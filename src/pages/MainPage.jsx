import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/Tabs";
import AccessControl from "components/AccessControl";
import HistoricAccess from "components/HistoricAccess";
import AccessControlConfig from "components/AccessControlConfig";
import { useNavigate } from "react-router-dom";
import CompanyHeader from "components/CompanyHeader";
import Loading from "components/ui/Loading";

const MainPage = () => {
  const [tokenData, setTokenData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const tokenData = await window.api.getTokenData();
      if (!tokenData?.token?.id) {
        navigate("/setup");
        return;
      }

      const catracaData = await window.api.getCatracaData();
      if (tokenData?.token?.id && !catracaData?.ip) {
        navigate("/parameters");
        return;
      }

      // realizar no component ou no context
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

  if (!tokenData?.token?.id) return <Loading />;

  return (
    <div>
      <CompanyHeader {...tokenData} onChangeToken={setTokenData} />
      <div className="px-3 grid grid-cols-[180px_1fr] gap-2 justify-center items-center w-full">
        <div>
          <img
            src="/logo.png"
            alt="Logo da TSI Gym"
            className="w-[180px] h-[180px] rounded-full"
          />
        </div>
        <div className="p-4 min-h-[calc(100vh-100px)]">
          <Card className="rounded-2xl shadow p-0">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Controle de acesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="screen">
                <TabsList className="grid w-full grid-cols-3">
                  {["screen", "catraca", "historic"].map(function (tab) {
                    const label =
                      tab === "screen"
                        ? "Acesso"
                        : tab === "historic"
                        ? "Histórico de Acessos"
                        : tab;
                    return (
                      <TabsTrigger key={tab} value={tab} className="capitalize">
                        {label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="screen" className="mt-5">
                  <AccessControl />
                </TabsContent>
                <TabsContent value="catraca" className="mt-5">
                  <AccessControlConfig />
                </TabsContent>
                <TabsContent value="historic" className="mt-5">
                  <HistoricAccess />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
