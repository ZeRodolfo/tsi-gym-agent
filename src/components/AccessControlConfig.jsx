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
import { Title } from "components/ui/Title";
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
import { toast } from "react-toastify";

export default function AccessControlConfig() {
  const [ip, setIp] = useState("192.168.0.129");
  const [port, setPort] = useState(3000);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [txtWelcome, setTxtWelcome] = useState("Seja bem-vindo");
  const [txtAccessDenied, setTxtAccessDenied] = useState("Acesso negado");
  const [txtUserNotIdentifier, setTxtUserNotIdentifier] = useState(
    "Usuário não reconhecido"
  );

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
        toast.success("Comunicação testada com sucesso com a catraca!");
        await logout(ip, data.session);
      })
      .catch((error) => {
        console.error("Erro ao acessar o servidor:", error);
        toast.error(
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
        toast.success("Catraca configurada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao configurar catraca:", error);
        toast.error(
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
      txtWelcome,
      txtAccessDenied,
      txtUserNotIdentifier,
    };

    try {
      window.api?.saveCatracaData?.(data);
      toast.success("Dados da Catraca salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar catraca:", error);
      toast.error(
        "Não foi possível salvar os dados da catraca. Por favor, tente novamente."
      );
    }
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
            {/* <TabsList className="grid w-full grid-cols-7">
              {[
                "catraca",
                // "msgPadrao",
                // "entrada",
                // "saida",
                // "negado",
                // "horario",
              ].map(function (tab) {
                const label = tab === "msgPadrao" ? "Msg. Padrão" : tab;
                return (
                  <TabsTrigger key={tab} value={tab} className="capitalize">
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList> */}

            {/* <TabsContent value="catraca" className="mt-4"> */}
            <div className="mt-5 mb-2 flex flex-wrap items-center gap-3">
              <Title>Configurações da Catraca</Title> -
              <Label>
                <b>MODELO:</b>
                <span className="text-warning ml-2">ID Block Next</span>
              </Label>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="grid grid-cols-[1fr_130px_130px] items-center gap-3">
                <div>
                  <Label>Endereço IP</Label>

                  <Input
                    value={ip}
                    onChange={function (e) {
                      setIp(e.target.value);
                    }}
                    className="flex-1"
                  />
                </div>

                <div>
                  <Label>Login</Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={function (e) {
                      setUsername(Number(e.target.value));
                    }}
                  />
                </div>

                <div>
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
              <div>
                <Button onClick={handleTestComunication} variant="secondary">
                  Testar Comunicação
                </Button>
              </div>
            </div>

            <div className="mt-5 mb-2">
              <Title>Mensagens no display da Catraca</Title>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 w-full items-center gap-3">
                <div>
                  <Label>Boas vindas</Label>

                  <Input
                    value={txtWelcome}
                    onChange={function (e) {
                      setTxtWelcome(e.target.value);
                    }}
                    className="flex-1"
                  />
                </div>
                <div>
                  <Label>Acesso Negado</Label>

                  <Input
                    value={txtAccessDenied}
                    onChange={function (e) {
                      setTxtAccessDenied(e.target.value);
                    }}
                    className="flex-1"
                  />
                </div>
                <div>
                  <Label>Usuário não Cadastrado</Label>

                  <Input
                    value={txtUserNotIdentifier}
                    onChange={function (e) {
                      setTxtUserNotIdentifier(e.target.value);
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
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
            {/* </TabsContent> */}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {/* <Button variant="warning">Fechar</Button> */}
          <Button onClick={handleSetup} variant="success">
            Iniciar Configuração
          </Button>
          <Button onClick={handleSaveTab}>Salvar</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
