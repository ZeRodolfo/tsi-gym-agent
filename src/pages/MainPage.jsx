import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/Tabs";
import AccessControl from "components/AccessControl";
import HistoricAccess from "components/HistoricAccess";
import AccessControlConfig from "components/AccessControlConfig";
import RegisterCatracaConfigModal from "components/RegisterCatracaConfigModal";
import { ActionsControl } from "components/ActionsControl";
import ConfigurationList from "components/ConfigurationList";
import logo from "assets/logo.png"; // Caminho relativo a partir do seu componente

const MainPage = () => {
  return (
    <>
      <div className="px-3 grid grid-cols-[180px_1fr] gap-2 justify-center items-center w-full">
        <div>
          <img
            src={logo}
            alt="Logo da TSI Gym"
            className="w-[180px] h-[180px] rounded-full"
          />
        </div>
        <div className="p-4 min-h-[calc(100vh-100px)]">
          <Card className="rounded-2xl shadow p-0 bg-white border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Controle de acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="!px-0">
              <Tabs defaultValue="screen">
                <TabsList className="grid w-full grid-cols-4">
                  {["screen", "actions", "config", "historic"].map(function (
                    tab
                  ) {
                    const LABELS = {
                      screen: "Acesso",
                      actions: "Ações",
                      config: "Configurações",
                      historic: "Histórico",
                    };

                    const label = LABELS[tab] || tab;
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
                <TabsContent value="actions" className="mt-5">
                  <ActionsControl />
                </TabsContent>
                {/* <TabsContent value="config" className="mt-5">
                  <RegisterCatracaConfigModal />
                </TabsContent> */}
                <TabsContent value="config" className="mt-5">
                  <ConfigurationList />
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
