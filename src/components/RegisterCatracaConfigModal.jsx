import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/Tabs";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "components/ui/AlertDialog";
import { Input } from "components/ui/Input";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Title } from "components/ui/Title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/Select";
import {
  login,
  customizarMensagemEventos,
} from "services/controlId/idBlockNext";
import setupIDBlock from "services/controlId/config-idblock";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useRevalidateToken } from "contexts/RevalidateToken";
import { api } from "services/api";
import { FreeCatracaModal } from "components/FreeCatracaModal";
import { ResetCatracaModal } from "components/ResetCatracaModal";
import { useQueryClient } from "@tanstack/react-query";
import { printerValidateTokens } from "services/settings";

const CATRACA_MODELS = {
  idblock_next: "ID Block Next",
};

export default function RegisterCatracaConfigModal({ isOpen, data, onClose }) {
  const [type, setType] = useState(null);

  const queryClient = useQueryClient();
  const { data: catraca, settings, setSettings } = useRevalidateToken();

  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [ip, setIp] = useState(""); // "192.168.18.116"
  const [ipLocal, setIpLocal] = useState(""); //"192.168.0.1"
  const [port, setPort] = useState(3000);
  const [username, setUsername] = useState("tsitech");
  const [password, setPassword] = useState("admin");
  const [txtWelcome, setTxtWelcome] = useState("Seja bem-vindo");
  const [txtAccessDenied, setTxtAccessDenied] = useState("Acesso negado");
  const [txtUserNotIdentifier, setTxtUserNotIdentifier] = useState(
    "Usuário não reconhecido"
  );
  const [sideToEnter, setSideToEnter] = useState("0");
  const [openCatracaModal, setOpenCatracaModal] = useState(false);
  const [openResetCatracaModal, setOpenResetCatracaModal] = useState(false);

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setType(null);
      setClientId("");
      setClientSecret("");
    } else {
      setClientId(data?.printer?.clientId || "");
      setClientSecret(data?.printer?.clientSecret || "");

      setType(data?.type || null);
      setIp(data?.ip || "");
      setIpLocal(data?.ipLocal || "");
      setSideToEnter(data?.catraSideToEnter || "0");
      setPort(data?.port || 3000);
      setUsername(data?.username || "tsitech");
      setPassword(data?.password || "admin");
      setTxtWelcome(data?.customAuthMessage || "Seja bem-vindo");
      setTxtAccessDenied(data?.customDenyMessage || "Acesso negado");
      setTxtUserNotIdentifier(
        data?.customNotIdentifiedMessage || "Usuário não reconhecido"
      );
    }
  }, [isOpen, data]);

  const handleTestComunication = async () => {
    setIsLoadingTest(true);
    login(ip, { login: username, password })
      .then(async ({ data }) => {
        toast.success("Comunicação testada com sucesso com a catraca!");
        // await logout(ip, data.session);
      })
      .catch((error) => {
        console.error("Erro ao acessar o servidor:", error);
        toast.error(
          "Não foi possível se comunicar com a catraca. Por favor, verifique os dados."
        );
      })
      .finally(() => {
        setIsLoadingTest(false);
      });
  };

  const handleSetup = async () => {
    setIsLoadingSettings(true);
    console.log("Iniciando configuração da Catraca");
    const response = await login(ip, { login: username, password });
    const { session } = response?.data || {};

    if (!session) {
      toast.error(
        "Não foi possível se comunicar com a catraca. Por favor, verifique os dados."
      );
      setIsLoadingSettings(false);
      return;
    }

    // pegar o IP da maquina onde esta o agente
    setupIDBlock({
      DEVICE_IP: ip,
      DEVICE_PASSWORD: [username, password].join(":"),
      WEBHOOK_URL: `http://${ipLocal}:4000/api`,
      session,
      catra_side_to_enter: sideToEnter,
    })
      .then(async () => {
        await customizarMensagemEventos(ip, session, {
          custom_auth_message: txtWelcome,
          custom_deny_message: txtAccessDenied,
          custom_not_identified_message: txtUserNotIdentifier,
          custom_mask_message: "Por favor, use máscara",
          enable_custom_auth_message: "1",
          enable_custom_deny_message: "1",
          enable_custom_not_identified_message: "1",
          enable_custom_mask_message: "1",
        });
        toast.success("Catraca configurada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao configurar catraca:", error);
        toast.error(
          "Não foi possível configurar a catraca. Por favor, verifique os dados."
        );
      })
      .finally(() => {
        setIsLoadingSettings(false);
      });
  };

  const handleSaveTab = async () => {
    setIsLoadingSave(true);
    console.log("Salvando dados da Catraca");

    // se já existir catraca, não deixar cadastrar uma nova
    if (
      settings?.type === type &&
      type === "catraca" &&
      ((data?.catraca?.id && data?.id !== settings?.id) ||
        (!data?.id && settings?.id))
    ) {
      toast.error("Já existe uma catraca cadastrada.");
      setIsLoadingSave(false);
      return;
    }

    try {
      const payload = {
        ip,
        port,
        username,
        password,
        customAuthMessage: txtWelcome,
        customDenyMessage: txtAccessDenied,
        customNotIdentifiedMessage: txtUserNotIdentifier,
        customMaskMessage: "Por favor, use máscara",
        enableCustomAuthMessage: "1",
        enableCustomDenyMessage: "1",
        enableCustomNotIdentifiedMessage: "1",
        enableCustomMaskMessage: "1",
        ipLocal,
        catraSideToEnter: sideToEnter,
      };

      const { data: settingsData } = await api.post("/settings", payload);
      setSettings(settingsData);

      queryClient.invalidateQueries({ queryKey: ["settings-all"] });

      const response = await login(ip, { login: username, password });
      const { session } = response?.data || {};

      if (!session) {
        toast.error(
          "Não foi possível se comunicar com a catraca. Por favor, verifique os dados."
        );
        setIsLoadingSave(false);
        return;
      }
      await customizarMensagemEventos(ip, session, {
        custom_auth_message: txtWelcome,
        custom_deny_message: txtAccessDenied,
        custom_not_identified_message: txtUserNotIdentifier,
        custom_mask_message: "Por favor, use máscara",
        enable_custom_auth_message: "1",
        enable_custom_deny_message: "1",
        enable_custom_not_identified_message: "1",
        enable_custom_mask_message: "1",
      });
      toast.success("Dados da Catraca salvos com sucesso!");
      // onSetup?.("/main");
    } catch (error) {
      console.error("Erro ao salvar catraca:", error);
      toast.error(
        "Não foi possível salvar os dados da catraca. Não foi possível acessar a catraca, verifique os parâmetros informados."
      );
    } finally {
      setIsLoadingSave(false);
    }
  };

  const validateToken = async () => {
    try {
      const machineKey = await window.system.getMachineId();
      const { data } = await printerValidateTokens({
        clientId,
        clientSecret,
      });

      toast.success("Dados da Impressora importados com sucesso!");
      onClose();
    } catch (err) {
      console.log(err);
      toast.error("Credenciais inválidas. Por favor, tente novamente.");
    }
  };

  const isLoading = isLoadingTest || isLoadingSave || isLoadingSettings;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cadastro do Dispositivo</AlertDialogTitle>

          <div className="w-[150px]">
            <Label>Tipo do dispositivo</Label>
            <Select
              onValueChange={(val) => setType(val)}
              value={type}
              disabled={!!data?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="w-[150px]">
                <SelectItem value="catraca">Catraca</SelectItem>
                <SelectItem value="printer">Impressora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogDescription className="text-gray-400">
            {type ? (
              <>
                Preencha os dados necessários para conectar e configurar o
                dispositivo de{" "}
                <b>{type === "catraca" ? "Catraca" : "Impressão"}</b>{" "}
                corretamente.
              </>
            ) : (
              <>
                Defina os parâmetros de conexão e configuração da catraca ou
                impressora utilizados no sistema.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {type === "catraca" ? (
          <section>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <Title>Configurações da Catraca</Title> -
              <Label>
                <b>MODELO:</b>
                <span className="text-warning ml-2">
                  {CATRACA_MODELS?.[catraca?.modelType] || "Não definido"}
                </span>
              </Label>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="grid grid-cols-[1fr_130px_130px] items-center gap-3">
                <div>
                  <Label>Endereço IP da Catraca</Label>

                  <Input
                    value={ip}
                    onChange={function (e) {
                      setIp(e.target.value || "");
                    }}
                    className="flex-1"
                    placeholder="___.___.___.___"
                  />
                </div>

                <div>
                  <Label>Login</Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={function (e) {
                      setUsername(e.target.value);
                    }}
                  />
                </div>

                <div>
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={function (e) {
                      setPassword(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div>
                <Button
                  onClick={handleTestComunication}
                  variant="secondary"
                  disabled={isLoading}
                >
                  {isLoadingTest ? "Testando..." : "Testar Comunicação"}
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

            <div className="mt-5 mb-2">
              <Title>Operacional</Title>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label>Endereço IP da Máquina</Label>
                <Input
                  value={ipLocal}
                  onChange={function (e) {
                    setIpLocal(e.target.value || "");
                  }}
                  className="flex-1"
                  placeholder="___.___.___.___"
                />
              </div>
              <div className="w-[150px]">
                <Label>Sentido do Giro</Label>
                <Select
                  onValueChange={function (val) {
                    setSideToEnter(val);
                  }}
                  value={sideToEnter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sentido" />
                  </SelectTrigger>
                  <SelectContent className="w-[150px]">
                    <SelectItem value="1">Anti-horário</SelectItem>
                    <SelectItem value="0">Horário</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => setOpenCatracaModal(true)}
                variant="secondary"
                disabled={isLoading}
              >
                Liberar Catraca
              </Button>
              <Button
                onClick={() => setOpenResetCatracaModal(true)}
                variant="secondary"
                disabled={isLoading}
              >
                Resetar
              </Button>
              <Button
                onClick={handleSetup}
                variant="success"
                disabled={isLoading}
              >
                {isLoadingSettings ? "Configurando..." : "Configurar"}
              </Button>
              <Button onClick={handleSaveTab} disabled={isLoading}>
                {isLoadingSave ? "Salvando..." : "Salvar"}
              </Button>
            </div>

            <ResetCatracaModal
              isOpen={openResetCatracaModal}
              onClose={() => setOpenResetCatracaModal(false)}
            />
          </section>
        ) : type === "printer" ? (
          <section className="w-full flex justify-start flex-col gap-3">
            <div>
              <Label>Client ID</Label>

              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Digite o client id"
                className="flex-1"
              />
            </div>
            <div>
              <Label>Client Secret</Label>

              <Input
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Digite o client secret"
              />
            </div>
            <div className="w-full text-center">
              <Button onClick={validateToken} className="max-w-[200px]">
                Importar dados
              </Button>
            </div>
          </section>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
