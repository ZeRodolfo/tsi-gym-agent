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

const CATRACA_MODELS = {
  idblock_next: "ID Block Next",
};

export default function AccessControlConfig({ onSetup }) {
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

  const navigate = useNavigate();
  const { data: catraca, settings, setSettings } = useRevalidateToken();

  //   const [timeout, setTimeout] = useState(5);
  //   const [primeSF, setPrimeSF] = useState(false);
  //   const [method, setMethod] = useState("CONSULTAR NÚMERO DE MATRÍCULA");

  useEffect(() => {
    const load = async () => {
      setIp(settings?.ip || "");
      setIpLocal(settings?.ipLocal || "");
      setSideToEnter(settings?.catraSideToEnter || "0");
      setPort(settings?.port || 3000);
      setUsername(settings?.username || "tsitech");
      setPassword(settings?.password || "admin");
      setTxtWelcome(settings?.customAuthMessage || "Seja bem-vindo");
      setTxtAccessDenied(settings?.customDenyMessage || "Acesso negado");
      setTxtUserNotIdentifier(
        settings?.customNotIdentifiedMessage || "Usuário não reconhecido"
      );
    };

    load();
  }, [settings]);

  const handleTestPrinter = async () => {
    window.printerAPI
      .print("<h1>Olá impressora!</h1>")
      // .then((res) => console.log("Impresso com sucesso:", res))
      // .catch((err) => console.error("Erro ao imprimir:", err));
  };

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
    const data = await login(ip, { login: username, password });
    const { session } = data?.data || {};

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

    try {
      const payload = {
        type: 'catraca',
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
      onSetup?.("/main");
    } catch (error) {
      console.error("Erro ao salvar catraca:", error);
      toast.error(
        "Não foi possível salvar os dados da catraca. Não foi possível acessar a catraca, verifique os parâmetros informados."
      );
    } finally {
      setIsLoadingSave(false);
    }
  };

  const isLoading = isLoadingTest || isLoadingSave || isLoadingSettings;

  return (
    <>
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
          onClick={handleTestPrinter}
          variant="secondary"
          disabled={isLoading}
        >
          Testar Impressão
        </Button>
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
        <Button onClick={handleSetup} variant="success" disabled={isLoading}>
          {isLoadingSettings ? "Configurando..." : "Iniciar Configuração"}
        </Button>
        <Button onClick={handleSaveTab} disabled={isLoading}>
          {isLoadingSave ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <FreeCatracaModal
        isOpen={openCatracaModal}
        onClose={() => setOpenCatracaModal(false)}
      />

      <ResetCatracaModal
        isOpen={openResetCatracaModal}
        onClose={() => setOpenResetCatracaModal(false)}
      />
    </>
  );
}
