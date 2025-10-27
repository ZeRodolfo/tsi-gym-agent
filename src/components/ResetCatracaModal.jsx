import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "components/ui/AlertDialog";
import { useRevalidateToken } from "contexts/RevalidateToken";
import { handleFreeCatracaConfirm } from "utils/freeCatraca";

import { login, resetToFactoryDefault } from "services/controlId/idBlockNext";

export const ResetCatracaModal = ({ isOpen, onClose }) => {
  const { catraca } = useRevalidateToken();

  const handleReset = async () => {
    if (!settings?.id)
      return toast.error(
        "Não foi possível prosseguir com a solicitação. Por favor, realize a sincronização."
      );

    try {
      const response = await login(settings?.ip, {
        login: settings?.username,
        password: settings?.password,
      });
      const { session } = response?.data || {};
      if (!session)
        return toast.error(
          "Não foi possível se comunicar com a catraca. Por favor, verifique as configurações ou realize a sincronização."
        );

      await resetToFactoryDefault(settings?.ip, session);
      toast.success("Catraca resetada com sucesso.");
      onClose?.();
    } catch (err) {
      console.log("err", err);
      toast.error("Não foi possível resetar a catraca.");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resetar catraca</AlertDialogTitle>
          <AlertDialogDescription>
            Ao resetar a catraca, todas as configurações e usuários serão
            apagados. Tem certeza que deseja continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Fechar</AlertDialogCancel>
          <AlertDialogAction onClick={onClose}>
            Apagar usuários
          </AlertDialogAction>
          <AlertDialogAction onClick={handleReset}>Resetar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
