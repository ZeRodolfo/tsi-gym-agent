import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/Tabs";
import AccessControl from "components/AccessControl";
import HistoricAccess from "components/HistoricAccess";
import AccessControlConfig from "components/AccessControlConfig";
import { useNavigate } from "react-router-dom";
import { useRevalidateToken } from "contexts/RevalidateToken";

const MainPage = () => {
  const navigate = useNavigate();
  const { tokenData } = useRevalidateToken();

  useEffect(() => {
    const load = async () => {
      const catracaData = await window.api.getCatracaData();
      console.log("Catraca Data:", catracaData);
      // if (tokenData?.token?.id && !catracaData?.ip) {
      //   navigate("/parameters");
      //   return;
      // }
    };

    load();
  }, [tokenData]);

  return (
    <>
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
    </>
  );
};

export default MainPage;
