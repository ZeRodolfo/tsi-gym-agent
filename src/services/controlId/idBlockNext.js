import axios from "axios";

export const login = async (ip, { login, password }) => {
  console.log("Tentativa de acesso:", { ip, login, password });

  return await axios
    .post(
      `http://${ip}/login.fcgi`,
      {
        login,
        password,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000, // 15 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const logout = async (ip, session) => {
  console.log("Tentativa de logout:", { ip, session });
  return await axios
    .post(
      `http://${ip}/logout.fcgi`,
      {
        session,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const verifySession = async (ip, session) => {
  console.log("Tentativa de verificação de sessão:", { ip, session });
  return await axios
    .post(
      `http://${ip}/session_is_valid.fcgi`,
      {
        session,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .then(({ data }) => data?.session_is_valid)
    .catch((error) => {
      throw error;
    });
};

export const resetToFactoryDefault = async (ip, session) => {
  console.log("Tentativa de reset para padrão de fábrica:", { ip, session });
  return await axios
    .post(
      `http://${ip}/reset_to_factory_default.fcgi?session=${session}`,
      {
        keep_network_info: false,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const executeActions = async (ip, session, { action, parameters }) => {
  console.log("Tentativa de executar ação na catraca:", {
    ip,
    session,
    action,
    parameters,
  });
  return await axios
    .post(
      `http://${ip}/execute_actions.fcgi?session=${session}`,
      {
        action,
        parameters,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const liberarGiroSentidoHorario = async (ip, session) => {
  return await executeActions(ip, session, {
    action: "catra",
    parameters: "allow=clockwise",
  });
};

export const liberarGiroSentidoAntiHorario = async (ip, session) => {
  return await executeActions(ip, session, {
    action: "catra",
    parameters: "allow=anticlockwise",
  });
};

export const liberarGiroAmbosSentidos = async (ip, session) => {
  return await executeActions(ip, session, {
    action: "catra",
    parameters: "allow=both",
  });
};

export const customizarMensagemEventos = async (
  ip,
  session,
  identifier = {
    custom_auth_message: "Seja bem-vindo",
    custom_deny_message: "Acesso negado",
    custom_not_identified_message: "Usuário não reconhecido",
    custom_mask_message: "Por favor, use máscara",
    enable_custom_auth_message: "1",
    enable_custom_deny_message: "1",
    enable_custom_not_identified_message: "1",
    enable_custom_mask_message: "1",
  }
) => {
  return await axios
    .post(
      `http://${ip}/set_configuration.fcgi?session=${session}`,
      {
        identifier,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const createUsers = async (
  ip,
  session,
  users = [
    // {
    //   name: "Douglas Miguel",
    //   registration: "",
    //   password: "",
    //   salt: "",
    // },
  ]
) => {
  return await axios
    .post(
      `http://${ip}/create_objects.fcgi?session=${session}`,
      {
        object: "users",
        values: users,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const createOrUpdateUsers = async (
  ip,
  session,
  users = [
    // {
    //   id: UUID(),
    //   name: "Douglas Miguel",
    //   registration: "",
    //   password: "",
    //   salt: "",
    // },
  ]
) => {
  return await axios
    .post(
      `http://${ip}/create_or_modify_objects.fcgi?session=${session}`,
      {
        object: "users",
        values: users,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const updateUsers = async (
  ip,
  session,
  userId,
  payload = {
    // begin_time: 0,
    // end_time: 1717690651,
  }
) => {
  return await axios
    .post(
      `http://${ip}/modify_objects.fcgi?session=${session}`,
      {
        object: "users",
        values: payload,
        where: {
          users: {
            id: userId,
          },
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const usersWithoutPictures = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/load_objects.fcgi?session=${session}`,
      {
        object: "users",
        where: [
          {
            object: "users",
            field: "image_timestamp",
            operator: "IS NULL",
            value: "",
            connector: "OR",
          },
          {
            object: "users",
            field: "image_timestamp",
            operator: "=",
            value: 0,
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const usersWithPictures = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/load_objects.fcgi?session=${session}`,
      {
        object: "users",
        where: [
          {
            object: "users",
            field: "image_timestamp",
            operator: "!=",
            value: 0,
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const activatePush = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/set_configuration.fcgi?session=${session}`,
      {
        push_server: {
          push_request_timeout: "5000",
          push_request_period: "15",
          push_remote_address: "http://localhost:4000",
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const deactivatePush = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/set_configuration.fcgi?session=${session}`,
      {
        push_server: {
          push_remote_address: "",
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};

export const getUserImages = async (ip, session, userIds = []) => {
  return await axios
    .post(
      `http://${ip}/user_get_image_list.fcgi?session=${session}`,
      {
        user_ids: userIds,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000, // 10 segundos
      }
    )
    .catch((error) => {
      throw error;
    });
};
