import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "components/ui/AlertDialog";
import { useRevalidateToken } from "contexts/RevalidateToken";
import { handleFreeCatracaConfirm } from "utils/freeCatraca";

export const REASONS = [
  {
    id: "system-out",
    label: "Sistema fora",
  },
  {
    id: "system-problem",
    label: "Problema com o sistema",
  },
  {
    id: "wellhub",
    label: "Aluno GymPass",
  },
  // {
  //   id: "system-problem",
  //   label: "Problema com o sistema",
  // },
];
export const FreeCatracaModal = ({ isOpen, catraca, onClose }) => {
  const { catraca: data } = useRevalidateToken();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Liberação de acesso na catraca</AlertDialogTitle>
          <AlertDialogDescription>
            Escolha um motivo para a liberação da catraca{" "}
            <strong className="capitalize">
              {catraca?.name || data?.name}
            </strong>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-wrap gap-3 items-start justify-start">
          {REASONS?.map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() =>
                handleFreeCatracaConfirm(catraca || data, reason, onClose)
              }
              className="px-5 py-7 bg-primary hover:bg-primary-700 text-white rounded"
            >
              {reason?.label}
            </button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
