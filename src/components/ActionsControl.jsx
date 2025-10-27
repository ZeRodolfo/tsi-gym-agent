import * as React from "react";
import { useRevalidateToken } from "contexts/RevalidateToken";
import { handleFreeCatracaConfirm } from "utils/freeCatraca";
import { REASONS } from "./FreeCatracaModal";
import { Collapse } from "./ui/Collapse";

export const ActionsControl = () => {
  const { catraca: data } = useRevalidateToken();

  return (
    <section className="px-3">
      <Collapse
        title="Liberação de acesso na catraca"
        description={
          <>
            Escolha um motivo para a liberação da catraca{" "}
            <strong className="capitalize">{data?.name}</strong>.
          </>
        }
      >
        <div className="flex flex-wrap gap-3 items-start justify-start">
          {REASONS?.map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() => handleFreeCatracaConfirm(data, reason)}
              className="px-5 py-7 bg-primary hover:bg-primary-700 text-white rounded"
            >
              {reason?.label}
            </button>
          ))}
        </div>
      </Collapse>
      {/* <div>
        <Title className="text-lg">Liberação de acesso na catraca</Title>
        <Label>
          Escolha um motivo para a liberação da catraca{" "}
          <strong className="capitalize">{data?.name}</strong>.
        </Label>
      </div>
      <div className="flex flex-wrap gap-3 items-start justify-start">
        {REASONS?.map((reason) => (
          <button
            key={reason.id}
            type="button"
            onClick={() => handleFreeCatracaConfirm(data, settings, reason)}
            className="px-5 py-7 bg-primary hover:bg-primary-700 text-white rounded"
          >
            {reason?.label}
          </button>
        ))}
      </div> */}
    </section>
  );
};
