import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/Tabs";
import { Input } from "components/ui/Input";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Checkbox } from "components/ui/Checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "components/ui/Select";
import IPInput from "./IPInput";
import { login } from "services/controlId/idBlockNext";
import setupIDBlock from "services/controlId/config-idblock";

export default function AccessControlConfig() {
  const [ip, setIp] = useState("192.168.0.129");
  const [port, setPort] = useState(3000);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");

  //   const [timeout, setTimeout] = useState(5);
  //   const [primeSF, setPrimeSF] = useState(false);
  //   const [method, setMethod] = useState("CONSULTAR NÚMERO DE MATRÍCULA");

  useEffect(() => {
    const load = async () => {
      const data = await window.api?.getCatracaData?.();
      setIp(data?.ip || "192.168.0.129");
      setPort(data?.port || 3000);
      setUsername(data?.login || "admin");
      setPassword(data?.password || "admin");
    };

    load();
  }, []);

  const handleTestComunication = async () => {
    login(ip, { login: username, password })
      .then(async ({ data }) => {
        console.log("Resposta do servidor:", data);
        alert("Comunicação testada com sucesso com a catraca!");
        // chamar logout
        await logout(ip, data.session);
      })
      .catch((error) => {
        console.error("Erro ao acessar o servidor:", error);
        alert(
          "Não foi possível se comunicar com a catraca. Por favor, verifique os dados."
        );
      });
  };

  const handleSetup = async () => {
    console.log("Iniciando configuração da Catraca");
    setupIDBlock({
      DEVICE_IP: ip,
      DEVICE_PASSWORD: [username, password].join(":"),
      WEBHOOK_URL: "http://localhost:4000/api",
    })
      .then(async ({ data }) => {
        alert("Catraca configurada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao configurar catraca:", error);
        alert(
          "Não foi possível configurar a catraca. Por favor, verifique os dados."
        );
      });
  };

  const handleSaveTab = async () => {
    console.log("Salvando dados da Catraca");
    const data = {
      ip,
      port,
      login: username,
      password,
    };

    await window.api?.saveCatracaData?.(data);
    console.log("Dados da Catraca salvos:", data);
  };

  return (
    <div className="p-4">
      <Card className="rounded-2xl shadow p-0">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Configuração do controle de acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="catraca">
            <TabsList className="grid w-full grid-cols-7">
              {[
                "catraca",
                "msgPadrao",
                "entrada",
                "saida",
                "negado",
                "horario",
              ].map(function (tab) {
                const label = tab === "msgPadrao" ? "Msg. Padrão" : tab;
                return (
                  <TabsTrigger key={tab} value={tab} className="capitalize">
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="catraca" className="mt-4">
              <div className="flex flex-wrap gap-4">
                <div className="grid grid-cols-[1fr_130px_130px] items-center space-x-2">
                  <div className="space-y-1">
                    <Label>Endereço IP</Label>

                    <Input
                      value={ip}
                      onChange={function (e) {
                        setIp(e.target.value);
                      }}
                      className="flex-1"
                    />
                  </div>

                  {/* <div className="space-y-1">
                    <Label>Porta TCP</Label>
                    <Input
                      type="number"
                      value={port}
                      onChange={function (e) {
                        setPort(Number(e.target.value));
                      }}
                    />
                  </div> */}

                  <div className="space-y-1">
                    <Label>Login</Label>
                    <Input
                      type="text"
                      value={username}
                      onChange={function (e) {
                        setUsername(Number(e.target.value));
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Senha</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={function (e) {
                        setPassword(Number(e.target.value));
                      }}
                    />
                  </div>
                </div>
                <div className="space-x-2">
                  <Button onClick={handleTestComunication}>
                    Testar Comunicação
                  </Button>
                  <Button onClick={handleSetup} className="disabled">
                    Iniciar Configuração
                  </Button>
                </div>

                {/* <div className="space-y-2">
                  <Label>Tempo de liberação (segundo(s))</Label>
                  <Input
                    type="number"
                    value={timeout}
                    onChange={function (e) {
                      setTimeout(Number(e.target.value));
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    checked={primeSF}
                    onCheckedChange={function (checked) {
                      setPrimeSF(checked);
                    }}
                  />
                  <Label>Primme Acesso SF</Label>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Acesso utilizando a impressão digital</Label>
                  <Select
                    onValueChange={function (val) {
                      setMethod(val);
                    }}
                    defaultValue={method}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSULTAR NÚMERO DE MATRÍCULA">
                        CONSULTAR NÚMERO DE MATRÍCULA
                      </SelectItem>
                      <SelectItem value="OUTRO MÉTODO">OUTRO MÉTODO</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">Fechar</Button>
          <Button onClick={handleSaveTab}>Salvar</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
