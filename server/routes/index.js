const express = require("express");
const catracaRoutes = require("./catraca"); // Importa as rotas
const settingsRoutes = require("./settings"); // Importa as rotas
const enrollmentsRoutes = require("./enrollments"); // Importa as rotas
const historicsRoutes = require("./historics"); // Importa as rotas
const syncRoutes = require("./sync"); // Importa as rotas
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger");

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const router = express.Router();

router.post("/login", async (req, res) => {
  const { login, password, ip } = req.body;
  console.log("Tentativa de acesso na catraca");

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
  console.log("Tentativa de liberar catraca dao:", {
    body: JSON.stringify(body),
  });

  return res.status(200).json({
    result: {
      // event: 9,
      // user_id: 10,
      // portal_id: 1,
      // actions: [{ action: "catra", parameters: "allow=clockwise" }],
      event: 6,
      user_id: 10,
      portal_id: 1,
      message: "Acesso negado: mensalidade em atraso.",
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
      event: 6,
      user_id: 10,
      portal_id: 1,
      message: "Acesso negado: mensalidade em atraso.",
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

router.post("/new_user_identified.fcgi", async (req, res) => {
  logger.info("Validação do usuário na catraca");
  try {
    const repoHistoric = AppDataSource.getRepository("Historic");
    const io = req.app.get("io");
    const {
      user_id: userIdStr,
      event: eventStr,
      user_name: userName,
      portal_id: portalIdStr,
      user_has_image,
    } = req.body;

    const userId = parseInt(userIdStr, 10);
    const event = parseInt(eventStr, 10);
    const portalId = parseInt(portalIdStr, 10);

    logger.info("Dados do usuário na catraca", { userId, event, portalId });

    if (userId === 0) {
      const message = "Matrícula não localizada. Dirija-se a Recepção.";
      logger.info("Usuário não encontrado na catraca", {
        userId,
        event,
        portalId,
        user_has_image,
        message,
      });
      const historic = repoHistoric.create({
        ...payloadHistoric,
        status: "not_found",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic });

      return res.json({
        result: {
          event: 6,
          message,
          user_name: "",
          user_image: false,
          user_id: userId,
          portal_id: portalId,
          actions: [],
        },
      });
    } else {
      logger.info("Usuário passou na catraca", { userId, event, portalId });
    }
    // Identificação falhou? event != 1
    // if (event !== 1 || !userId) {
    //   return res.json({ result: { event: 6, portal_id: portalId } });
    // }

    // Buscar usuário no seu sistema
    const user = null; // await getUserById(userId);
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

    const repoEnrollment = AppDataSource.getRepository("Enrollment");
    const enrollment = await repoEnrollment.findOneBy({
      identifierCatraca: userId,
    });

    logger.info("Matrícula", { id: enrollment?.id });

    if (!enrollment) {
      const message = "Matrícula não localizada. Dirija-se a Recepção.";
      io.emit("access", { enrollment, status: "not_found", message });

      return res.json({
        result: {
          event: 6,
          message: "Matrícula não localizada. Dirija-se a Recepção.",
          user_name: "",
          user_image: user_has_image === "1",
          user_id: userId,
          portal_id: portalId,
          actions: [],
        },
      });
    }

    const { studentId, id, companyId, branchId } = enrollment || {};
    const payloadHistoric = {
      studentId,
      enrollment: { id }, // já cria o vínculo via FK
      companyId,
      branchId,
      type: "terminal",
      attendedAt: new Date(),
    };

    if (enrollment?.status === "pending") {
      const message = "Matrícula pendente. Dirija-se a Recepção.";
      const historic = repoHistoric.create({
        ...payloadHistoric,
        status: "pending",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic, enrollment });

      return res.json({
        result: {
          event: 6,
          message,
          user_id: userId,
          user_name: userName || user?.name,
          user_image: user_has_image === "1",
          portal_id: portalId,
          actions: [],
        },
      });
    }

    if (enrollment?.status === "pending_registration_release") {
      const message = "Matrícula pendente de aprovação. Dirija-se a Recepção.";
      const historic = repoHistoric.create({
        ...payloadHistoric,
        status: "pending_registration_release",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic, enrollment });

      return res.json({
        result: {
          event: 6,
          message,
          user_id: userId,
          user_name: userName || user?.name,
          user_image: user_has_image === "1",
          portal_id: portalId,
          actions: [],
        },
      });
    }

    if (enrollment?.status === "locked") {
      const message = "Matrícula trancada. Dirija-se a Recepção.";
      const historic = repoHistoric.create({
        ...payloadHistoric,
        status: "locked",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic, enrollment });

      return res.json({
        result: {
          event: 6,
          message,
          user_id: userId,
          user_name: userName || user?.name,
          user_image: user_has_image === "1",
          portal_id: portalId,
          actions: [],
        },
      });
    }

    if (enrollment?.status === "expired") {
      const message = "Matrícula expirada. Dirija-se a Recepção.";
      const historic = repoHistoric.create({
        ...payloadHistoric,
        status: "expired",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic, enrollment });

      return res.json({
        result: {
          event: 6,
          message,
          user_id: userId,
          user_name: userName || user?.name,
          user_image: user_has_image === "1",
          portal_id: portalId,
          actions: [],
        },
      });
    }

    if (enrollment?.status === "canceled") {
      const message = "Matrícula cancelada. Dirija-se a Recepção.";
      const historic = repoHistoric.create({
        ...payloadHistoric,
        status: "canceled",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic, enrollment });

      return res.json({
        result: {
          event: 6,
          message,
          user_id: userId,
          user_name: userName || user?.name,
          user_image: user_has_image === "1",
          portal_id: portalId,
          actions: [],
        },
      });
    }

    // checar matricula, status
    const extendedAt = enrollment.extendedAt
      ? new Date(enrollment.extendedAt)
      : null;
    const endDate = new Date(enrollment.endDate);
    const today = stripTime(new Date());

    const endDateOnly = stripTime(endDate);
    const extendedAtOnly = extendedAt ? stripTime(extendedAt) : null;

    const isExpiredNormal = endDateOnly < today;
    const isExpiredExtended = extendedAtOnly && extendedAtOnly < today; // expira só se passou do dia estendido

    if (isExpiredNormal || isExpiredExtended) {
      const message = "Matrícula expirada. Dirija-se à recepção.";
      const historic = repoHistoric.create({
        ...payloadHistoric,
        status: "expired",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic, enrollment });

      return res.json({
        result: {
          event: 6,
          message,
          user_id: userId,
          user_name: userName || user?.name,
          user_image: user_has_image === "1",
          portal_id: portalId,
          actions: [],
        },
      });
    }

    // salvar historico
    const historic = repoHistoric.create({
      ...payloadHistoric,
      status: "success",
      message: `Bem-vindo, ${userName || user?.name}!`,
    });
    await repoHistoric.save(historic);

    io.emit("access", { ...historic, enrollment });

    // Se atingiu aqui, libera o acesso
    // verificar o sentido da catraca atraves da configuração

    const parameters =
      settings?.catraSideToEnter === "0"
        ? "allow=clockwise"
        : "allow=anticlockwise";
    return res.json({
      result: {
        event: 7,
        user_id: userId,
        user_name: userName || user?.name,
        user_image: user_has_image === "1",
        actions: [{ action: "catra", parameters }],
        portal_id: portalId,
        message: `Bem-vindo, ${userName || user?.name}!`,
      },
    });
  } catch (err) {
    logger.error("Não foi possível liberar a catraca:", err);
    const message = "Matrícula não localizada. Dirija-se a Recepção.";
    const historic = repoHistoric.create({
      ...payloadHistoric,
      status: "not_found",
      message,
    });
    await repoHistoric.save(historic);
    io.emit("access", { ...historic });

    return res.json({
      result: {
        event: 6,
        message,
        user_name: "",
        user_image: false,
        user_id: userId,
        portal_id: portalId,
        actions: [],
      },
    });
  }
});

router.use("/catracas", catracaRoutes);
router.use("/settings", settingsRoutes);
router.use("/enrollments", enrollmentsRoutes);
router.use("/historic", historicsRoutes);
router.use("/sync", syncRoutes);
module.exports = router;
