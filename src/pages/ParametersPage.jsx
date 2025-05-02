import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyHeader from "components/CompanyHeader";
import AccessControlConfig from "components/AccessControlConfig";
import { checkToken } from "services/settings";

const ParametersPage = () => {
  const [tokenData, setTokenData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const tokenData = await window.api.getTokenData();
      if (!tokenData?.token?.id) {
        navigate("/setup");
        return;
      }

      const lastCheck = new Date(tokenData.lastCheck);
      const today = new Date();

      if (today.toDateString() !== lastCheck.toDateString()) {
        try {
          const data = await checkToken(
            tokenData.token.clientToken,
            tokenData.token.clientSecretToken
          );

          if (!data?.id) {
            navigate("/setup");
          } else {
            setTokenData(data);
            window.api.saveTokenData({
              token: data,
              info: "dados da empresa no servidor",
            });
          }
        } catch (error) {
          window.api.saveTokenData(null);
        }
      } else {
        setTokenData(tokenData);
      }
    };

    load();
  }, []);

  if (!tokenData?.token?.id) return <p>Carregando...</p>;

  return (
    <div>
      {/* <h2>Parameters</h2>
      <p>Token: {tokenData?.token?.clientToken}</p> */}
      <CompanyHeader {...tokenData} onChangeToken={setTokenData} />
      <div className="px-3 grid grid-cols-[180px_1fr] gap-2 justify-center items-center w-full">
        <div>
          <img
            src="/logo.png"
            alt="Logo da TSI Gym"
            className="w-[180px] h-[180px] rounded-full"
          />
        </div>
        <AccessControlConfig />
      </div>
    </div>
  );
};

export default ParametersPage;
