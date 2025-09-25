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

const reasons = [
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
export const FreeCatracaModal = ({ isOpen, onClose }) => {
  const { data, settings } = useRevalidateToken();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Liberação de acesso na catraca</AlertDialogTitle>
          <AlertDialogDescription>
            Escolha um motivo para a liberação da catraca{" "}
            <strong className="capitalize">{data?.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-wrap gap-3 items-start justify-start">
          {reasons?.map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() =>
                handleFreeCatracaConfirm(data, settings, reason, onClose)
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
