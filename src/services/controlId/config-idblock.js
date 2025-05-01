// scripts/config-idblock.ts
import axios from "axios";

let DEVICE_IP, DEVICE_PASSWORD, WEBHOOK_URL;

// const { DEVICE_IP, DEVICE_PASSWORD, WEBHOOK_URL } = process.env;

// helper para fazer GET autenticado
async function fcgi(path, params = {}) {
  console.log({ DEVICE_IP, DEVICE_PASSWORD, WEBHOOK_URL });
  const url = `http://${DEVICE_IP}/${path}`;
  const resp = await axios.get(url, {
    params,
    auth: {
      username: DEVICE_PASSWORD.split(":")[0],
      password: DEVICE_PASSWORD.split(":")[1],
    },
    timeout: 5000,
  });
  return resp.data;
}

export default async function main(payload = {}) {
  DEVICE_IP = payload.DEVICE_IP;
  DEVICE_PASSWORD = payload.DEVICE_PASSWORD;
  WEBHOOK_URL = payload.WEBHOOK_URL;

  try {
    // 1) Criar objeto device que aponta pro seu servidor
    console.log("1) Criando objeto device (online_client)…");
    const create = await fcgi("create_objects.fcgi", {
      object: "devices",
      url: WEBHOOK_URL,
      description: "Webhook TSIGym Check-in",
    });
    const serverId = create.id;
    console.log(" → server_id =", serverId);

    // 2) Definir sec_box.catra_role = 1 (device primário)
    console.log("2) Definindo catra_role = 1 (primário)");
    await fcgi("set_configuration.fcgi", {
      section: "sec_box",
      key: "catra_role",
      value: "1",
    });

    // 3) Ativar modo online e identificação local
    console.log("3) Ativando modo online e local_identification");
    await fcgi("set_configuration.fcgi", {
      section: "general",
      key: "online",
      value: "1",
    });
    await fcgi("set_configuration.fcgi", {
      section: "general",
      key: "local_identification",
      value: "1",
    });

    // 4) Apontar online_client.server_id para o objeto criado
    console.log("4) Apontando server_id em online_client");
    await fcgi("set_configuration.fcgi", {
      section: "online_client",
      key: "server_id",
      value: serverId,
    });

    // 5) Ajustar FSM da catraca: controlado em ambos os giros
    console.log("5) Ajustando catra_default_fsm = 0 (ambos controlados)");
    await fcgi("set_configuration.fcgi", {
      section: "sec_box",
      key: "catra_default_fsm",
      value: "0",
    });

    // 6) (Opcional) definir direção de entrada
    console.log("6) Definindo catra_side_to_enter = clockwise");
    await fcgi("set_configuration.fcgi", {
      section: "sec_box",
      key: "catra_side_to_enter",
      value: "clockwise",
    });

    console.log(
      "\n🎉 Configuração concluída! iDBlock Next pronto para modo online."
    );
  } catch (err) {
    console.error("Erro na configuração:", err.message || err);
    process.exit(1);
  }
}
