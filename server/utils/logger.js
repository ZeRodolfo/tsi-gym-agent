const { createLogger, format, transports } = require("winston");
const path = require("path");

const logDirectory = path.resolve(__dirname, "../../logs");

const logger = createLogger({
  level: "info",
  transports: [
    // Logs de erro em JSON (para análise posterior)
    new transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.json()
      ),
    }),
    // Todos os logs em JSON (persistência)
    new transports.File({
      filename: path.join(logDirectory, "combined.log"),
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.json()
      ),
    }),
    // Console mais amigável
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "HH:mm:ss" }),
        format.printf(({ level, message, timestamp, ...meta }) => {
          let extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return `[${timestamp}] ${level}: ${message}${extra}`;
        })
      ),
    }),
  ],
});

module.exports = logger;
