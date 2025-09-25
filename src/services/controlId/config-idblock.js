// scripts/config-idblock.ts
import axios from "axios";

let DEVICE_IP, DEVICE_PASSWORD, WEBHOOK_URL;

// const { DEVICE_IP, DEVICE_PASSWORD, WEBHOOK_URL } = process.env;

// helper para fazer GET autenticado
async function fcgi(path, payload = {}, sessionId) {
  const url = `http://${DEVICE_IP}/${path}?session=${sessionId}`;
  const resp = await axios.post(url, payload, {
    timeout: 5000,
  });
  return resp?.data;
}

export default async function main(payload = {}) {
  DEVICE_IP = payload.DEVICE_IP;
  DEVICE_PASSWORD = payload.DEVICE_PASSWORD;
  WEBHOOK_URL = payload.WEBHOOK_URL // "http://192.168.18.27:4000/api";
  const session = payload.session;

  try {
    // 1) Criar objeto device que aponta pro seu servidor
    console.log("1) Criando objeto device (online_client)…");
    const create = await fcgi(
      "create_objects.fcgi",
      {
        object: "devices",
        values: [
          {
            ip: WEBHOOK_URL,
            name: "Webhook TSIGym Check-in",
          },
        ],
      },
      session
    );
    console.log(" → create =", create);
    const serverId = create.ids[0];
    console.log(" → server_id =", serverId);

    // 2) Definir sec_box.catra_role = 1 (device primário)
    console.log("2) Definindo catra_role = 1 (primário)");
    await fcgi(
      "set_configuration.fcgi",
      {
        sec_box: {
          catra_role: "1",
        },
      },
      session
    );

    // 3) Ativar modo online e identificação local
    console.log("3) Ativando modo online e local_identification");
    await fcgi(
      "set_configuration.fcgi",
      {
        general: {
          online: "1",
        },
      },
      session
    );
    await fcgi(
      "set_configuration.fcgi",
      {
        general: {
          local_identification: "1",
        },
      },
      session
    );

    // 4) Apontar online_client.server_id para o objeto criado
    console.log("4) Apontando server_id em online_client");
    await fcgi(
      "set_configuration.fcgi",
      {
        online_client: {
          server_id: serverId?.toString(),
        },
      },
      session
    );

    // 5) Ajustar FSM da catraca: controlado em ambos os giros
    console.log("5) Ajustando catra_default_fsm = 0 (ambos controlados)");
    await fcgi(
      "set_configuration.fcgi",
      {
        sec_box: {
          catra_default_fsm: "0",
        },
      },
      session
    );

    // 6) (Opcional) definir direção de entrada
    console.log("6) Definindo catra_side_to_enter = clockwise | 0 = horario | 1 = anti-horario");
    await fcgi(
      "set_configuration.fcgi",
      {
        sec_box: {
          catra_side_to_enter: payload?.catra_side_to_enter || "0",
        },
      },
      session
    );

    console.log(
      "\n🎉 Configuração concluída! iDBlock Next pronto para modo online."
    );
  } catch (err) {
    console.error("Erro na configuração:", err.message || err);
  }
}

async function configure(DEVICE) {
  const AUTH = {
    username: "admin",
    password: "admin",
  };
  const WEBHOOK_URL = "http://192.168.18.27:4000/api";

  // 1) criar sessão
  const sess = (
    await axios.post(`${DEVICE}/create_session.fcgi`, {}, { auth: AUTH })
  )?.data?.session;

  // 2) criar device (uma vez)
  const dev = await axios.post(
    `${DEVICE}/create_objects.fcgi?session=${sess}`,
    {
      object: "devices",
      values: [{ name: "Wellhub", ip: WEBHOOK_URL, public_key: "" }],
    },
    { auth: AUTH }
  );
  const serverId = dev?.data?.ids[0];

  // 3) set online_client.server_id via JSON
  await axios.post(
    `${DEVICE}/set_configuration.fcgi?session=${sess}`,
    { online_client: { server_id: `${serverId}` } },
    { auth: AUTH, headers: { "Content-Type": "application/json" } }
  );

  // 4) ativar modo online (general + online_client)
  await axios.post(
    `${DEVICE}/set_configuration.fcgi?session=${sess}`,
    {
      general: { online: "1", local_identification: "1" },
      online_client: {
        extract_template: "0",
        max_request_attempts: "3",
        request_timeout: "5000",
        alive_interval: "60000",
      },
    },
    { auth: AUTH, headers: { "Content-Type": "application/json" } }
  );

  console.log("iDBlock Next pronto em modo online!");
}

export { configure };
