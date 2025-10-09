const express = require("express");
const catracaRoutes = require("./catraca"); // Importa as rotas
const settingsRoutes = require("./settings"); // Importa as rotas
const enrollmentsRoutes = require("./enrollments"); // Importa as rotas
const historicsRoutes = require("./historics"); // Importa as rotas
const syncRoutes = require("./sync"); // Importa as rotas
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger");

function stripTime(date) {
  if (typeof date === "string") {
    const [year, month, day] = date?.split("-");
    return new Date(year, month, day);
  }

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

  const io = req.app.get("io");
  const {
    user_id: userIdStr,
    event: eventStr,
    user_name: userName,
    portal_id: portalIdStr,
    user_has_image,
  } = req.body;

  const repoHistoric = AppDataSource.getRepository("Historic");
  const repoCatraca = AppDataSource.getRepository("Catraca");
  const catracas = await repoCatraca.find();
  const catraca = catracas?.[0];

  try {
    const userId = parseInt(userIdStr, 10);
    const event = parseInt(eventStr, 10);
    const portalId = parseInt(portalIdStr, 10);

    logger.info("Dados do usuário na catraca", { userId, event, portalId });

    if (userId === 0) {
      const message = "Matrícula não localizada.";
      logger.info("Usuário não encontrado na catraca", {
        userId,
        event,
        portalId,
        user_has_image,
        message,
      });

      if (catraca) {
        const historic = repoHistoric.create({
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          type: "terminal",
          attendedAt: new Date(),
          status: "not_found",
          message,
        });
        await repoHistoric.save(historic);
        io.emit("access", { ...historic });
      }

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

    // Buscar usuário no seu sistema, verificar quando existir mais de uma matricula
    // fazer uma verificação caso o aluno já possua uma matrícula e solicitar uma atualização na atual
    // não deixar ter mais de uma matrícula ativa ao mesmo tempo, barrar no front principal
    const repoEnrollment = AppDataSource.getRepository("Enrollment");
    const enrollments = await repoEnrollment.find({
      where: {
        identifierCatraca: userId,
      },
      order: {
        // updatedAt: "DESC",
        // endDate: "DESC",
        // extendedAt: "DESC",
        extendedAt: "DESC",
        endDate: "DESC",
        startDate: "DESC",
      },
    });

    if (!enrollments?.length) {
      const message = "Matrícula não localizada.";
      if (catraca) {
        const historic = repoHistoric.create({
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          type: "terminal",
          attendedAt: new Date(),
          status: "not_found",
          message,
        });
        await repoHistoric.save(historic);
        io.emit("access", { ...historic });
      }

      return res.json({
        result: {
          event: 6,
          message: "Matrícula não localizada.",
          user_name: "",
          user_image: user_has_image === "1",
          user_id: userId,
          portal_id: portalId,
          actions: [],
        },
      });
    }

    // const filterActiveEnrollment = (enrollments) => {
    //   console.log(enrollments);
    //   if (enrollments.length === 1) return enrollments[0];

    //   return enrollments.sort();
    // };

    const sortEnrollments = (a, b) => {
      // Lógica de ordenação

      // Crie um mapa de prioridade para os status
      const statusPriority = {
        pending: 1,
        pending_registration_release: 2,
        active: 3,
        locked: 4,
        expired: 5,
        canceled: 6,
      };

      // 1. Priorize pelo status: matrículas ativas vêm primeiro
      const priorityA = statusPriority[a.status] || Infinity;
      const priorityB = statusPriority[b.status] || Infinity;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 2. Priorize pela data de extensão mais recente (extendedAt)
      const extendedAtA = a.extendedAt ? new Date(a.extendedAt).getTime() : 0;
      const extendedAtB = b.extendedAt ? new Date(b.extendedAt).getTime() : 0;
      if (extendedAtA !== extendedAtB) {
        return extendedAtB - extendedAtA;
      }

      // 3. Priorize pela data de término mais recente (endDate)
      const endDateA = a.endDate ? new Date(a.endDate).getTime() : 0;
      const endDateB = b.endDate ? new Date(b.endDate).getTime() : 0;
      if (endDateA !== endDateB) {
        return endDateB - endDateA;
      }

      // 4. Priorize pela data de início mais recente (startDate)
      const startDateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const startDateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      if (startDateA !== startDateB) {
        return startDateB - startDateA;
      }

      // Se todas as propriedades forem iguais, a ordem não muda
      return 0;
    };

    const sortedEnrollments = enrollments.sort(sortEnrollments);
    const enrollment = sortedEnrollments[0];

    logger.info("Matrícula atual", {
      id: enrollment?.id,
      status: enrollment?.status,
      startDate: enrollment?.startDate,
      endDate: enrollment?.endDate,
    });

    const { studentId, id, companyId, branchId, identifierCatraca } =
      enrollment || {};
    const payloadHistoric = {
      studentId,
      enrollment: { id, identifierCatraca }, // já cria o vínculo via FK
      companyId,
      branchId,
      type: "terminal",
      attendedAt: new Date(),
    };

    if (enrollment?.status === "pending") {
      const message = "Matrícula pendente.";
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
      const message = "Matrícula pendente de aprovação.";
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
      const message = "Matrícula trancada.";
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

    if (enrollment?.status === "canceled") {
      const message = "Matrícula cancelada.";
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
      ? stripTime(enrollment.extendedAt)
      : null;
    // const endDate = new Date(enrollment.endDate);
    const today = stripTime(new Date());

    const endDateOnly = stripTime(enrollment.endDate);
    const extendedAtOnly = extendedAt ? extendedAt : null;

    const isExpiredNormal = endDateOnly?.getTime() < today?.getTime();
    const isExpiredExtended =
      extendedAtOnly && extendedAtOnly?.getTime() < today?.getTime(); // expira só se passou do dia estendido

    if (isExpiredNormal || isExpiredExtended) {
      const message = "Matrícula expirada.";
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

    if (enrollment?.status === "expired") {
      const message = "Matrícula expirada.";
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

    const repoSettings = AppDataSource.getRepository("Settings");
    const allSettings = await repoSettings.find();
    const settings = allSettings?.[0];
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
    const message = "Matrícula não localizada.";
    if (catraca) {
      const historic = repoHistoric.create({
        companyId: catraca?.companyId,
        branchId: catraca?.branchId,
        type: "terminal",
        attendedAt: new Date(),
        status: "not_found",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic });
    }

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
