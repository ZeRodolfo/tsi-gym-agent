const path = require("path");
const edge = require("edge-js");
const { app } = require("electron");

// Descobre se estamos em dev ou em produção
const dllPath = app.isPackaged
  ? path.join(process.resourcesPath, "app", "CIDPrinter.dll")
  : path.join(__dirname, "../../CIDPrinter.dll");

// Mapeia funções da DLL
const cidPrinter = {
  iniciar: edge.func({
    assemblyFile: dllPath,
    typeName: "CIDPrinter.CIDPrintiD",
    methodName: "Iniciar",
  }),
  reset: edge.func({
    assemblyFile: dllPath,
    typeName: "CIDPrinter.CIDPrintiD",
    methodName: "Reset",
  }),
  imprimir: edge.func({
    assemblyFile: dllPath,
    typeName: "CIDPrinter.CIDPrintiD",
    methodName: "ImprimirFormatado",
  }),
};

module.exports = cidPrinter;
