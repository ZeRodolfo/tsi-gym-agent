const express = require("express");
const { startOfDay, isAfter, format, isBefore } = require("date-fns");
const catracaRoutes = require("./catraca"); // Importa as rotas
const enrollmentsRoutes = require("./enrollments"); // Importa as rotas
const historicsRoutes = require("./historics"); // Importa as rotas
const syncRoutes = require("./sync"); // Importa as rotas
const printersRoutes = require("./printers"); // Importa as rotas
const teachersRoutes = require("./teachers"); // Importa as rotas
const employeesRoutes = require("./employees"); // Importa as rotas
const agentsRoutes = require("./agents"); // Importa as rotas
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger");
const axios = require("axios");

// const api = axios.create({
//   baseURL: "http://localhost:4000/api",
// });

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

  const ip =
    req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || // se estiver atrás de proxy
    req?.connection?.remoteAddress;

  // Normaliza o loopback IPv6 para IPv4
  const normalizedIp = ip === "::1" ? "127.0.0.1" : ip.replace("::ffff:", "");
  logger.info("Origem da requisição (IP): " + normalizedIp);

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

  const repoPerson = AppDataSource.getRepository("Person");
  const repoHistoric = AppDataSource.getRepository("Historic");
  const repoCatraca = AppDataSource.getRepository("Catraca");
  const catracas = await repoCatraca.find(); // tentar buscar pelo ip da requisição?
  const catraca =
    normalizedIp === "127.0.0.1"
      ? catracas?.[0]
      : catracas?.find(
          (item) =>
            item.ip === normalizedIp || item?.ipSecondary === normalizedIp
        );

  if (!catraca) {
    // await api.post("/notify", {
    //   title: "Acesso negado",
    //   message: `Sem comunicação com o servidor local.`,
    // });

    return res.json({
      result: {
        event: 6,
        message: "Sem comunicação com o servidor local.",
        user_name: "Usuário",
        user_image: false,
        user_id: userId,
        portal_id: portalId,
        actions: [],
      },
    });
  }

  const person = await repoPerson.findOne({
    where: {
      identifierCatraca: userId,
    },
    relations: [
      "teacher",
      "teacher.times",
      "employee",
      "employee.times",
      "enrollments",
    ],
    order: {
      enrollments: {
        extendedAt: "DESC",
        endDate: "DESC",
        startDate: "DESC",
      },
    },
  });

  try {
    logger.info("Dados do usuário na catraca", { userId, event, portalId });

    if (catraca?.slave) {
      const primaryFree =
        catraca?.primaryIpSide === "exit" && normalizedIp === catraca?.ip;
      const secondaryFree =
        catraca?.primaryIpSide === "entry" &&
        normalizedIp === catraca?.ipSecondary;

      if (primaryFree || secondaryFree) {
        const historic = repoHistoric.create({
          catraca: { id: catraca?.id },
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          personId: person?.id,
          type: "terminal",
          identifierCatraca: userId,
          attendedAt: new Date(),
          status: "success",
          message: person?.name
            ? `Volte sempre, ${person?.name}!`
            : "Volte sempre!",
        });
        await repoHistoric.save(historic);

        io.emit("access", { ...historic });

        // await api.post("/notify", {
        //   title: "Acesso liberado",
        //   message: `Volte sempre, ${person?.name}!`,
        //   picture,
        // });

        // inverter o sentido da liberação na catraca atraves da configuração
        const parameters =
          catraca?.catraSideToEnter === "0"
            ? "allow=anticlockwise"
            : "allow=clockwise";
        return res.json({
          result: {
            event: 7,
            user_id: userId,
            user_name: person?.name || "Atenção",
            user_image: user_has_image === "1",
            actions: [{ action: "catra", parameters }],
            portal_id: portalId,
            message: person?.name
              ? `Volte sempre, ${person?.name}!`
              : "Volte sempre!",
          },
        });
      }
    }

    if (userId === 0 || !person) {
      const message = "Facial não detectada.";
      logger.info("Usuário não encontrado na catraca", {
        userId,
        event,
        portalId,
        user_has_image,
        message,
      });

      const historic = repoHistoric.create({
        catraca: { id: catraca?.id },
        companyId: catraca?.companyId,
        branchId: catraca?.branchId,
        personId: person?.id,
        identifierCatraca: person?.identifierCatraca,
        type: "terminal",
        attendedAt: new Date(),
        status: "not_found",
        message,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic });

      // await api.post("/notify", {
      //   title: "Acesso negado",
      //   message,
      // });

      return res.json({
        result: {
          event: 6,
          message,
          user_name: "Usuário",
          user_image: false,
          user_id: userId,
          portal_id: portalId,
          actions: [],
        },
      });
    } else {
      logger.info("Usuário passou na catraca", { userId, event, portalId });
    }

    const {
      name,
      picture,
      teacher,
      employee,
      enrollments: personEnrollments,
    } = person;
    const personName = name?.split(" ")?.[0];
    const enrollments = personEnrollments?.filter(
      (e) => !e.studentId?.includes("deleted-")
    );

    if (!teacher && !employee && !enrollments?.length) {
      const message = "Sincronizando informações. Aguarde!";
      const historic = repoHistoric.create({
        catraca: { id: catraca?.id },
        companyId: catraca?.companyId,
        branchId: catraca?.branchId,
        type: "terminal",
        attendedAt: new Date(),
        status: "person_not_store",
        message,
        personId: person?.id,
        identifierCatraca: person?.identifierCatraca,
      });
      await repoHistoric.save(historic);
      io.emit("access", { ...historic });

      // await api.post("/notify", {
      //   title: "Acesso negado",
      //   message,
      //   picture,
      // });

      return res.json({
        result: {
          event: 6,
          message,
          user_name: personName,
          user_image: user_has_image === "1",
          user_id: userId,
          portal_id: portalId,
          actions: [],
        },
      });
    }

    const currentDate = new Date();
    // Pega o dia da semana atual (0=Dom, 1=Seg, ...)
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
    const times = [...(teacher?.times || []), ...(employee?.times || [])];
    let isAllowed = false;

    for (const time of times) {
      if (time.day !== format(currentDate, "EEEE")?.toLocaleLowerCase())
        continue;

      const [startHour, startMinute] = time.startTime.split(":").map(Number);
      const [endHour, endMinute] = time.endTime.split(":").map(Number);

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      // Verifica se o horário atual está dentro do intervalo
      if (startTime <= currentTime && currentTime <= endTime) {
        isAllowed = true;
        break;
      }
    }

    if (teacher || employee) {
      // salvar historico
      const historic = repoHistoric.create({
        catraca: { id: catraca?.id },
        companyId: catraca?.companyId,
        branchId: catraca?.branchId,
        personId: person?.id,
        type: "terminal",
        identifierCatraca: userId,
        attendedAt: new Date(),
        status: "success",
        message: `Bem-vindo, ${personName}!`,
        teacherId: teacher?.id,
        employeeId: employee?.id,
      });
      await repoHistoric.save(historic);

      io.emit("access", { ...historic, teacher, employee });

      // await api.post("/notify", {
      //   title: "Acesso liberado",
      //   message: `Bem-vindo, ${personName}!`,
      //   picture,
      // });

      // Se atingiu aqui, libera o acesso
      // verificar o sentido da catraca atraves da configuração
      const parameters =
        catraca?.catraSideToEnter === "0"
          ? "allow=clockwise"
          : "allow=anticlockwise";
      return res.json({
        result: {
          event: 7,
          user_id: userId,
          user_name: personName,
          user_image: user_has_image === "1",
          actions: [{ action: "catra", parameters }],
          portal_id: portalId,
          message: `Bem-vindo, ${personName}!`,
        },
      });
    }

    if (!isAllowed) {
      // Buscar usuário no seu sistema, verificar quando existir mais de uma matricula
      // fazer uma verificação caso o aluno já possua uma matrícula e solicitar uma atualização na atual
      // não deixar ter mais de uma matrícula ativa ao mesmo tempo, barrar no front principal
      if (!enrollments?.length) {
        if (teacher || employee) {
          const message = teacher
            ? "Professor fora do horário"
            : "Funcionário fora do horário";
          const historic = repoHistoric.create({
            catraca: { id: catraca?.id },
            companyId: catraca?.companyId,
            branchId: catraca?.branchId,
            type: "terminal",
            attendedAt: new Date(),
            status: "not_worktime",
            message,
            teacherId: teacher?.id,
            employeeId: employee?.id,
            personId: person?.id,
            identifierCatraca: person?.identifierCatraca,
          });
          await repoHistoric.save(historic);
          io.emit("access", { ...historic });

          // await api.post("/notify", {
          //   title: "Acesso negado",
          //   message,
          //   picture,
          // });

          return res.json({
            result: {
              event: 6,
              message,
              user_name: personName,
              user_image: user_has_image === "1",
              user_id: userId,
              portal_id: portalId,
              actions: [],
            },
          });
        }

        const message = "Matrícula não localizada.";
        const historic = repoHistoric.create({
          catraca: { id: catraca?.id },
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          type: "terminal",
          attendedAt: new Date(),
          status: "not_found",
          message,
          personId: person?.id,
          identifierCatraca: person?.identifierCatraca,
        });
        await repoHistoric.save(historic);
        io.emit("access", { ...historic });

        // await api.post("/notify", {
        //   title: "Acesso negado",
        //   message,
        //   picture,
        // });

        return res.json({
          result: {
            event: 6,
            message: "Matrícula não localizada.",
            user_name: personName,
            user_image: user_has_image === "1",
            user_id: userId,
            portal_id: portalId,
            actions: [],
          },
        });
      }

      const sortEnrollments = (a, b) => {
        // Lógica de ordenação

        // Crie um mapa de prioridade para os status
        const statusPriority = {
          pending: 1,
          pending_registration_release: 2,
          active: 3,
          locked: 4,
          scheduled_lock: 5,
          expired: 6,
          canceled: 7,
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

      const { studentId, id, companyId, branchId } = enrollment || {};
      const payloadHistoric = {
        studentId,
        enrollment: { id, identifierCatraca: person?.identifierCatraca }, // já cria o vínculo via FK
        catraca: { id: catraca?.id },
        companyId,
        branchId,
        type: "terminal",
        identifierCatraca: person?.identifierCatraca,
        attendedAt: new Date(),
        personId: person?.id,
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

        // await api.post("/notify", {
        //   title: "Acesso negado",
        //   message,
        //   picture,
        // });

        return res.json({
          result: {
            event: 6,
            message,
            user_id: userId,
            user_name: personName,
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

        // await api.post("/notify", {
        //   title: "Acesso negado",
        //   message,
        //   picture,
        // });

        return res.json({
          result: {
            event: 6,
            message,
            user_id: userId,
            user_name: personName,
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

        // await api.post("/notify", {
        //   title: "Acesso negado",
        //   message,
        //   picture,
        // });

        return res.json({
          result: {
            event: 6,
            message,
            user_id: userId,
            user_name: personName,
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

        // await api.post("/notify", {
        //   title: "Acesso negado",
        //   message,
        //   picture,
        // });

        return res.json({
          result: {
            event: 6,
            message,
            user_id: userId,
            user_name: personName,
            user_image: user_has_image === "1",
            portal_id: portalId,
            actions: [],
          },
        });
      }

      const today = startOfDay(new Date());
      const extendedAt = enrollment.extendedAt
        ? startOfDay(enrollment.extendedAt.replace("Z", ""))
        : null;
      const endDateOnly = startOfDay(enrollment.endDate.replace("Z", ""));
      const extendedAtOnly = extendedAt ? extendedAt : null;
      const isExpiredNormal = isAfter(today, endDateOnly); // endDateOnly?.getTime() < today?.getTime();
      const isExpiredExtended =
        extendedAtOnly && isAfter(today, extendedAtOnly); //extendedAtOnly?.getTime() < today?.getTime(); // expira só se passou do dia estendido

      const startDateOnly = startOfDay(enrollment.startDate.replace("Z", ""));
      const isBeforeStart = isBefore(today, startDateOnly);

      if (isBeforeStart) {
        const message = `Matrícula inicia ${format(
          startDateOnly,
          "dd/MM/yyyy"
        )}`;
        const historic = repoHistoric.create({
          ...payloadHistoric,
          status: "pending",
          message,
        });
        await repoHistoric.save(historic);
        io.emit("access", { ...historic, enrollment });

        // await api.post("/notify", {
        //   title: "Acesso negado",
        //   message,
        //   picture,
        // });

        return res.json({
          result: {
            event: 6,
            message,
            user_id: userId,
            user_name: personName,
            user_image: user_has_image === "1",
            portal_id: portalId,
            actions: [],
          },
        });
      }

      if (
        isExpiredExtended ||
        (isExpiredNormal && !extendedAt) ||
        (!isExpiredNormal && enrollment?.status === "expired")
      ) {
        const message = "Matrícula expirada.";
        const historic = repoHistoric.create({
          ...payloadHistoric,
          status: "expired",
          message,
        });
        await repoHistoric.save(historic);
        io.emit("access", { ...historic, enrollment });

        // await api.post("/notify", {
        //   title: "Acesso negado",
        //   message,
        //   picture,
        // });

        return res.json({
          result: {
            event: 6,
            message,
            user_id: userId,
            user_name: personName,
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
        message: `Bem-vindo, ${personName}!`,
      });
      await repoHistoric.save(historic);

      io.emit("access", { ...historic, enrollment });

      // await api.post("/notify", {
      //   title: "Acesso liberado",
      //   message: `Bem-vindo, ${personName}!`,
      //   picture,
      // });

      // Se atingiu aqui, libera o acesso
      // verificar o sentido da catraca atraves da configuração
      const parameters =
        catraca?.catraSideToEnter === "0"
          ? "allow=clockwise"
          : "allow=anticlockwise";

      return res.json({
        result: {
          event: 7,
          user_id: userId,
          user_name: personName,
          user_image: user_has_image === "1",
          actions: [{ action: "catra", parameters }],
          portal_id: portalId,
          message: `Bem-vindo, ${personName}!`,
        },
      });
    } else {
      // salvar historico
      const historic = repoHistoric.create({
        catraca: { id: catraca?.id },
        companyId: catraca?.companyId,
        branchId: catraca?.branchId,
        personId: person?.id,
        type: "terminal",
        identifierCatraca: userId,
        attendedAt: new Date(),
        status: "success",
        message: `Bem-vindo, ${personName}!`,
        teacherId: teacher?.id,
        employeeId: employee?.id,
      });
      await repoHistoric.save(historic);

      io.emit("access", { ...historic, teacher, employee });

      // await api.post("/notify", {
      //   title: "Acesso liberado",
      //   message: `Bem-vindo, ${personName}!`,
      //   picture,
      // });

      // Se atingiu aqui, libera o acesso
      // verificar o sentido da catraca atraves da configuração
      const parameters =
        catraca?.catraSideToEnter === "0"
          ? "allow=clockwise"
          : "allow=anticlockwise";
      return res.json({
        result: {
          event: 7,
          user_id: userId,
          user_name: personName,
          user_image: user_has_image === "1",
          actions: [{ action: "catra", parameters }],
          portal_id: portalId,
          message: `Bem-vindo, ${personName}!`,
        },
      });
    }
  } catch (err) {
    logger.error("Não foi possível liberar a catraca:", err);
    const message = "Matrícula não localizada.";
    const historic = repoHistoric.create({
      catraca: { id: catraca?.id },
      companyId: catraca?.companyId,
      branchId: catraca?.branchId,
      personId: person?.id,
      identifierCatraca: person?.identifierCatraca || userId,
      type: "terminal",
      attendedAt: new Date(),
      status: "not_found",
      message,
    });
    await repoHistoric.save(historic);
    io.emit("access", { ...historic });

    // await api.post("/notify", {
    //   title: "Acesso negado",
    //   message,
    //   picture: person?.picture,
    // });

    return res.json({
      result: {
        event: 6,
        message,
        user_name: person?.name || userName || "Usuário",
        user_image: false,
        user_id: userId,
        portal_id: portalId,
        actions: [],
      },
    });
  }
});

router.post("/new_qrcode.fcgi", async (req, res) => {
  logger.info("Validação do QRCode na catraca");

  const io = req.app.get("io");
  const { device_id, identifier_id, qrcode_value, uuid, time, portal_id } =
    req.body;

  const repoHistoric = AppDataSource.getRepository("Historic");
  const repoCatraca = AppDataSource.getRepository("Catraca");
  const catracas = await repoCatraca.find(); // tentar buscar pelo ip da requisição?
  const catraca = catracas?.[0];

  logger.info(`Identificação QRCode:`, {
    device_id,
    identifier_id,
    qrcode_value,
    uuid,
    time,
    portal_id,
  });

  if (!catraca) {
    // await api.post("/notify", {
    //   title: "Acesso negado",
    //   message: `Sem comunicação com o servidor local.`,
    // });

    return res.json({
      result: {
        event: 6,
        message: "Sem comunicação com o servidor local.",
        user_name: "Usuário",
        user_image: false,
        user_id: userId,
        portal_id: portalId,
        actions: [],
      },
    });
  }

  try {
    if (catraca?.slave) {
      const primaryFree =
        catraca?.primaryIpSide === "exit" && normalizedIp === catraca?.ip;
      const secondaryFree =
        catraca?.primaryIpSide === "entry" &&
        normalizedIp === catraca?.ipSecondary;

      if (primaryFree || secondaryFree) {
        const historic = repoHistoric.create({
          catraca: { id: catraca?.id },
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          personId: person?.id,
          type: "terminal",
          identifierCatraca: userId,
          attendedAt: new Date(),
          status: "success",
          message: person?.name
            ? `Volte sempre, ${person?.name}!`
            : "Volte sempre!",
        });
        await repoHistoric.save(historic);

        io.emit("access", { ...historic });

        // await api.post("/notify", {
        //   title: "Acesso liberado",
        //   message: `Volte sempre, ${person?.name}!`,
        //   picture,
        // });

        // inverter o sentido da liberação na catraca atraves da configuração
        const parameters =
          catraca?.catraSideToEnter === "0"
            ? "allow=anticlockwise"
            : "allow=clockwise";
        return res.json({
          result: {
            event: 7,
            user_id: userId,
            user_name: person?.name || "Atenção",
            user_image: user_has_image === "1",
            actions: [{ action: "catra", parameters }],
            portal_id: portalId,
            message: person?.name
              ? `Volte sempre, ${person?.name}!`
              : "Volte sempre!",
          },
        });
      }
    }

    const repoIntegration = AppDataSource.getRepository("Integration");
    const integration = await repoIntegration.findOneBy({
      code: qrcode_value,
    });

    if (!integration) {
      return res.json({
        result: {
          event: 6,
          message: "Código inválido.",
          user_name: "Atenção",
          user_image: false,
          user_id: 0,
          portal_id,
          actions: [],
        },
      });
    }

    // validate code in wellhub
    const { data: isValid } = await axios.post(
      `${process.env.BASE_URL}/webhook/validate/${integration?.source}`,
      {
        gymId: integration?.gymId,
        uniqueToken: integration?.uniqueToken,
        code: integration?.code,
      },
      {
        headers: {
          "x-client-id": catraca?.clientId,
          "x-client-secret": catraca?.clientSecret,
          "x-company-id": catraca?.companyId,
          "x-branch-id": catraca?.branchId,
        },
      }
    );

    const eventData = JSON.parse(integration?.eventData || "{}");
    const userName =
      eventData?.user?.name?.split(" ")?.[0] || eventData?.user?.first_name;

    const today = new Date();
    const checkinAt = integration?.checkinAt || new Date();
    if (format(checkinAt, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      const parameters =
        catraca?.catraSideToEnter === "0"
          ? "allow=clockwise"
          : "allow=anticlockwise";

      // update
      await repoIntegration.update(
        {
          id: integration.id,
        },
        {
          checkinAt: new Date(),
        }
      );
      return res.json({
        result: {
          event: 7,
          user_id: 0,
          user_name: userName || "Acesso liberado",
          user_image: false,
          actions: [{ action: "catra", parameters }],
          portal_id: portalId,
          message: `Bem-vindo, ${userName}!`,
        },
      });
    } else {
      return res.json({
        result: {
          event: 6,
          message: "Código expirado.",
          user_name: userName || "Acesso negado",
          user_image: false,
          user_id: 0,
          portal_id,
          actions: [],
        },
      });
    }
  } catch (err) {
    logger.error("Não foi possível liberar a catraca:", err);
    const message = "Código inválido.";
    const historic = repoHistoric.create({
      catraca: { id: catraca?.id },
      companyId: catraca?.companyId,
      branchId: catraca?.branchId,
      type: "terminal",
      attendedAt: new Date(),
      status: "not_found",
      message,
    });
    await repoHistoric.save(historic);
    io.emit("access", { ...historic });

    // await api.post("/notify", {
    //   title: "Acesso negado",
    //   message,
    //   picture: person?.picture,
    // });

    return res.json({
      result: {
        event: 6,
        message,
        user_name: "Usuário",
        user_image: false,
        user_id: 0,
        portal_id,
        actions: [],
      },
    });
  }
});

router.use("/catracas", catracaRoutes);
router.use("/enrollments", enrollmentsRoutes);
router.use("/historic", historicsRoutes);
// router.use("/sync", syncRoutes);
router.use("/printers", printersRoutes);
router.use("/teachers", teachersRoutes);
router.use("/employees", employeesRoutes);
router.use("/agents", agentsRoutes);
module.exports = router;
