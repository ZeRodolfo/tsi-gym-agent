const axios = require("axios");
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

const headerParams = {
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 segundos
};

module.exports = async function job() {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    const catraca = catracas?.[0];
    if (!catraca?.ip) return;

    const { data: response } = await api.get("/catracas/sync", {
      params: {
        clientId: catraca.clientId,
        clientSecret: catraca.clientSecret,
        machineKey: catraca.machineKey,
        machineName: "PC Name",
        type: ["people"],
      },
    });

    logger.info(
      "Total de Pessoas a serem sincronizadas: " + response?.people?.length || 0
    );

    if (response?.people?.length) {
      logger.info("Iniciando sincronização com a catraca");

      // const {
      //   data: { session },
      // } = await axios.post(
      //   `http://${catraca?.ip}/login.fcgi`,
      //   {
      //     login: catraca?.username,
      //     password: catraca?.password,
      //   },
      //   headerParams
      // );
      // logger.info("SESSÂO", { session });
      // if (!session) throw new Error("Falha ao autenticar na catraca");

      const peopleUsers = response.people?.map((item) => ({
        id: item?.identifierCatraca,
        name: item?.name,
        registration: "",
      }));

      const chunkSize = 5;
      if (peopleUsers.length) {
        for (let i = 0; i < peopleUsers.length; i += chunkSize) {
          const chunk = peopleUsers.slice(i, i + chunkSize);
          logger.info(
            `Enviando lote ${i / chunkSize + 1} (${chunk.length} cadastros)...`
          );

          // await axios.post(
          //   `http://${catraca?.ip}/create_or_modify_objects.fcgi?session=${session}`,
          //   {
          //     object: "users",
          //     values: chunk,
          //   },
          //   headerParams
          // );
        }
      }

      const results = [];
      const repoAddress = AppDataSource.getRepository("Address");
      const repoPerson = AppDataSource.getRepository("Person");
      const timestamp = Math.floor(Date.now() / 1000);

      const peopleWithPicture = response.people?.map((item) => {
        const picture = item?.picture;
        return {
          user_id: item?.identifierCatraca,
          image: picture
            ?.replace("data:image/png;base64,", "")
            ?.replace("data:image/jpeg;base64,", "")
            ?.replace(/\s/g, ""),
          timestamp,
        };
      });

      for (let i = 0; i < peopleWithPicture.length; i += chunkSize) {
        const chunk = peopleWithPicture.slice(i, i + chunkSize);
        logger.info(
          `📸 Enviando lote ${i / chunkSize + 1} (${chunk.length} fotos)...`
        );
        const result = {
          results: chunk?.map((item) => ({
            user_id: item.user_id,
            success: true,
          })),
        };

        // const result = {
        //   results: [
        //     {
        //       user_id: 1,
        //       success: false,
        //       errors: [
        //         {
        //           code: 1,
        //           message:
        //             "Failed: Invalid member 'timestamp' (int expected, got string)",
        //         },
        //       ],
        //     },
        //     {
        //       user_id: 2,
        //       success: false,
        //       errors: [
        //         {
        //           code: 2,
        //           message: "Face not detected",
        //         },
        //       ],
        //     },
        //     {
        //       user_id: 3,
        //       scores: {
        //         bounds_width: 104,
        //         horizontal_center_offset: 16,
        //         vertical_center_offset: -150,
        //         center_pose_quality: 768,
        //         sharpness_quality: 1000,
        //       },
        //       success: true,
        //     },
        //     {
        //       user_id: 4,
        //       scores: {
        //         bounds_width: 151,
        //         horizontal_center_offset: -16,
        //         vertical_center_offset: -24,
        //         center_pose_quality: 502,
        //         sharpness_quality: 789,
        //       },
        //       success: false,
        //       errors: [
        //         {
        //           code: 7,
        //           message: "Face pose not centered",
        //         },
        //       ],
        //     },
        //   ],
        // };

        // const { data: result } = await axios.post(
        //   `http://${catraca?.ip}/user_set_image_list.fcgi?session=${session}`,
        //   {
        //     match: false,
        //     user_images: chunk,
        //   },
        //   headerParams
        // );

        if (result?.results) results.push(...result?.results);
      }

      for (const result of results) {
        if (result?.success) {
          const payload = response.people?.find(
            (item) => item.identifierCatraca === result.user_id
          );

          if (!payload) continue;

          let person = await repoPerson.findOneBy({
            identifierCatraca: result.user_id,
          });

          if (!person) {
            person = repoPerson.create(payload);
            await repoPerson.save(person);
            logger.info(
              "Pessoa criada de Identificador na catraca: " + result?.user_id
            );
          } else {
            if (payload?.address) {
              let address = await repoAddress.findOneBy({
                id: payload?.address?.id,
              });
              if (!address) address = repoAddress.create(payload.address);
              await repoAddress.save({ ...address, ...payload.address });
            }
            delete payload.id;
            delete payload.address;

            await repoPerson.save({ ...person, ...payload });
            logger.info(
              "Pessoa atualizada de Identificador na catraca: " +
                result?.user_id
            );
          }
        } else {
          logger.warn(
            "Foto não importada para a Pessoa de Identificador na catraca: " +
              result?.user_id,
            result
          );
        }
      }

      await api.put(`/catracas/sync`, {
        companyId: catraca?.companyId,
        branchId: catraca?.branchId,
        catracaId: catraca?.id,
        type: "people",
        data: results,
      });
    }

    logger.info("Sincronização finalizada com sucesso.");
  } catch (err) {
    logger.error(
      "Não foi possível sincronizar os dados com a catraca e banco de dados.",
      { message: err?.response?.data || err?.message }
    );
  }
};
