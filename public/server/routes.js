const express = require("express");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { login, password, ip } = req.body;
  console.log("Tentativa de acesso:", { login, password });

  const response = await fetch(
    `http://${ip}/login.fcgi?login=${login}&password=${password}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  ).then((response) => response.json());

  return res.status(200).json(response);
});

router.post("/logout", async (req, res) => {
  const { session } = req.body;
  console.log("Tentativa de logout:", { session });

  await fetch(`http://${ip}/logout.fcgi?session=${session}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return res.status(200).json();
});


 router.get("/device_is_alive.fcgi", (req, res) => {
    const { session } = req.body;
    console.log("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });
  router.post("/device_is_alive.fcgi", (req, res) => {
    const { session } = req.body;
    console.log("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });

 router.get("/session_is_valid.fcgi", (req, res) => {
    const { session } = req.body;
    console.log("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });
  router.post("/session_is_valid.fcgi", (req, res) => {
    const { session } = req.body;
    console.log("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });

router.post("/notifications", async (req, res) => {
  const body = req.body;
  console.log("Tentativa de liberar catraca:", { body });

  return res.status(200).json({
    result: {
      event: 7,
      user_id: 10,
      portal_id: 1,
      actions: [{ action: "catra", parameters: "allow=clockwise" }],
    },
  });
});

router.post("/notifications/dao", async (req, res) => {
  const body = req.body;
  console.log("Tentativa de liberar catraca dao:", { body: JSON.stringify(body) });

  return res.status(200).json({
    result: {
      // event: 9,
      // user_id: 10,
      // portal_id: 1,
      // actions: [{ action: "catra", parameters: "allow=clockwise" }],
      "event": 6,
    "user_id": 10,
    "portal_id": 1,
    "message": "Acesso negado: mensalidade em atraso."
    },
  });
});

router.post("/notifications/catra_event", async (req, res) => {
  const body = req.body;
  console.log("Tentativa de liberar catraca:", { body });

  return res.status(200).json({
    result: {
      // event: 9,
      // user_id: 10,
      // portal_id: 1,
      // actions: [{ action: "catra", parameters: "allow=clockwise" }],
      "event": 6,
    "user_id": 10,
    "portal_id": 1,
    "message": "Acesso negado: mensalidade em atraso."
    },
  });
});

router.post("/biometria", async (req, res) => {
  const body = req.body;
  console.log("Tentativa de liberar catraca:", { body });

  return res.status(200).json({
    result: {
      event: 7,
      user_id: 10,
      portal_id: 1,
      actions: [{ action: "catra", parameters: "allow=clockwise" }],
    },
  });
});

 router.post('/new_user_identified.fcgi', async (req, res) => {
    console.log("AKI 22222222222222222", req.body)
  const {
    user_id: userIdStr,
    event: eventStr,
    user_name: userName,
    portal_id: portalIdStr,
    user_has_image
  } = req.body;

  const userId = parseInt(userIdStr, 10);
  const event = parseInt(eventStr, 10);
  const portalId = parseInt(portalIdStr, 10);

  // Identificação falhou? event != 1
  // if (event !== 1 || !userId) {
  //   return res.json({ result: { event: 6, portal_id: portalId } });
  // }

  // Buscar usuário no seu sistema
  const user = null // await getUserById(userId);
  // if (!user) {
  //   return res.json({ result: {
  //     event: 6,
  //     message: 'Usuário não cadastrado',
  //     user_id: userId,
  //     portal_id: portalId,
  //   } });
  // }

  // Verificar status financeiro
  // if (!user?.paymentOk) {
  //   return res.json({ result: {
  //     event: 6,
  //   user_id: userId,
  //   "user_name": userName || user?.name,
  //       "user_image": user_has_image === '1',
  //   portal_id: portalId,
  //   message: `Mensalidade em atraso!`
  //   } });
  // }

  console.log('response', { result: {
    event: 7,
    user_id: userId,
    portal_id: portalId,
    actions: [
      { action: 'catra', parameters: 'allow=clockwise' }
    ],
    message: `Bem-vindo, ${userName || user?.name}!`
  } })
  // Se atingiu aqui, libera o acesso
  return res.json({ result: {
    event: 7,
    user_id: userId,
    "user_name": userName || user?.name,
        "user_image": user_has_image === '1',
        "actions": [
            {"action": "catra", "parameters": "allow=clockwise"}
        ],
    portal_id: portalId,
    message: `Bem-vindo, ${userName || user?.name}!`
  } });
});

module.exports = router;
