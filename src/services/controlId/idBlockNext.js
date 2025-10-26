import axios from "axios";
import { Buffer } from "buffer";

window.Buffer = Buffer;

export const login = async (ip, { login, password }) => {
  console.log("Tentativa de acesso: " + `http://${ip}/login.fcgi`);

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
      console.log("Login Err", error);
      // throw error;
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
      console.log("Logout Err", error);

      // throw error;
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
        actions: [{ action, parameters }],
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

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const buf = new ArrayBuffer(len);
  const view = new Uint8Array(buf);
  for (let i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}

export async function addFace(ip, session, userId, base64Image) {
  const timestamp = Math.floor(Date.now() / 1000);
  window.Buffer = window.Buffer || Buffer;
  const buffer = base64ToArrayBuffer(base64Image);
  return await axios.post(
    `http://${ip}/user_set_image.fcgi?user_id=${userId}&timestamp=${timestamp}&match=0&session=${session}`,
    buffer,
    { headers: { "Content-Type": "application/octet-stream" } }
  );
}
export async function addFaceToUsers(ip, session, userImages) {
  const timestamp = Math.floor(Date.now() / 1000);

  const user_images = userImages.map((item) => ({
    user_id: item.userId,
    timestamp,
    image: item.picture, // já deve estar em base64 sem o prefixo data:image/*
  }));

  return await axios.post(
    `http://${ip}/user_set_image_list.fcgi?session=${session}`,
    {
      match: false,
      user_images,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000, // opcional: aumentar o tempo limite, já que envio de imagens pode ser lento
    }
  );
}

export async function removeFace(ip, session, userId) {
  return await axios.post(
    `http://${ip}/user_destroy_image.fcgi?session=${session}`,
    { user_id: userId },
    { headers: { "Content-Type": "application/octet-stream" } }
  );
}

export const getGroups = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/load_objects.fcgi?session=${session}`,
      {
        object: "group_access_rules",
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

export const getUserAccessRules = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/load_objects.fcgi?session=${session}`,
      {
        object: "user_access_rules",
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

export const getAccessRules = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/load_objects.fcgi?session=${session}`,
      {
        object: "access_rules",
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

export const createAccessRules = async (
  ip,
  session,
  rules = [
    {
      name: "Happy Hour",
      type: 1,
      priority: 0,
    },
  ]
) => {
  return await axios
    .post(
      `http://${ip}/create_objects.fcgi?session=${session}`,
      {
        object: "access_rules",
        values: rules,
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

export const createUserGroups = async (
  ip,
  session,
  rules = [
    {
      user_id: 1,
      group_id: 1,
    },
  ]
) => {
  return await axios
    .post(
      `http://${ip}/create_objects.fcgi?session=${session}`,
      {
        object: "user_groups",
        fields: ["user_id", "group_id"],
        values: rules,
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

export const getUserGroups = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/load_objects.fcgi?session=${session}`,
      {
        object: "user_groups",
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

export const createGroupAccessRules = async (
  ip,
  session,
  rules = [
    {
      group_id: 2,
      access_rule_id: 3,
    },
  ]
) => {
  return await axios
    .post(
      `http://${ip}/create_objects.fcgi?session=${session}`,
      {
        object: "group_access_rules",
        values: rules,
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

export const getConfiguration = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/get_configuration.fcgi?session=${session}`,
      {
        general: [
          "online",
          "beep_enabled",
          // "relay1_enabled",
          // "relay1_timeout",
          // "relay1_auto_close",
          // "relay2_enabled",
          // "relay2_timeout",
          // "relay2_auto_close",
          "bell_enabled",
          "bell_relay",
          "local_identification",
          "exception_mode",
          "language",
          "daylight_savings_time_start",
          "daylight_savings_time_end",
          "auto_reboot",
        ],
        // "mifare": ["byte_order"],
        // "w_in0": ["byte_order"],
        // "w_out0": ["data"],
        alarm: ["siren_enabled"],
        identifier: [
          "verbose_logging",
          "log_type",
          "multi_factor_authentication",
        ],
        // "bio_id": ["similarity_threshold_1ton"],
        online_client: [
          "server_id",
          "extract_template",
          "max_request_attempts",
        ],
        // "bio_module": ["var_min"],
        monitor: ["path", "hostname", "port", "request_timeout"],
        push_server: [
          "push_request_timeout",
          "push_request_period",
          "push_remote_address",
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

export const destroyUsers = async (ip, session) => {
  return await axios
    .post(
      `http://${ip}/destroy_objects.fcgi?session=${session}`,
      {
        object: "users",
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
          push_remote_address: "http://192.168.18.27:4000",
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
