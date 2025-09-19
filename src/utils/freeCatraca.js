import { toast } from "react-toastify";
import {
  login,
  liberarGiroSentidoHorario,
  liberarGiroSentidoAntiHorario,
} from "services/controlId/idBlockNext";
import { api } from "services/api";

export const handleFreeCatracaConfirm = async (catraca, settings, reason) => {
  await api.post("/historic", {
    type: "manually",
    reasonId: reason?.id,
    companyId: catraca?.companyId,
    branchId: catraca?.branchId,
    status: "success",
    message: `Liberação manual - ${reason.label}`,
  });

  if (!settings?.id)
    return toast.error(
      "Não foi possível prosseguir com a solicitação. Por favor, realize a sincronização."
    );

  try {
    const response = await login(ip, { login: username, password });
    const { session } = response?.data || {};

    if (!session)
      return toast.error(
        "Não foi possível se comunicar com a catraca. Por favor, verifique as configurações ou realize a sincronização."
      );

    if (settings?.catraSideToEnter === "0") {
      await liberarGiroSentidoHorario(settings?.ip, session);
    } else {
      await liberarGiroSentidoAntiHorario(settings?.ip, session);
    }
    // send api
    await api.post("/historic", {
      type: "manualy",
      reasonId: reason?.id,
      studentId,
      enrollmentId,
      companyId: catraca?.companyId,
      branchId: catraca?.branchId,
      status: "success",
      message: `Liberação manual - ${reason.label}`,
    });

    toast.success("Catraca liberada com sucesso.");
    onClose();
  } catch (err) {
    toast.error(
      "Não foi possível liberar a catraca. Por favor, verifique as configurações ou realize a sincronização."
    );
  }
};
