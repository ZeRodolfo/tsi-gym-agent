const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const logDirectory = path.resolve(__dirname, "../../logs");

const logger = createLogger({
  level: "info",
  transports: [
    // Logs de erro (um arquivo por dia)
    new DailyRotateFile({
      dirname: path.resolve(logDirectory, "errors"),
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: false, // se quiser zipar os logs antigos, pode por true
      maxFiles: "10d", // mantém só 10 dias
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.json()
      ),
    }),

    // Todos os logs (um arquivo por dia)
    new DailyRotateFile({
      dirname: path.resolve(logDirectory, "infos"),
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxFiles: "10d",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.json()
      ),
    }),

    // Console (formato amigável)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "HH:mm:ss" }),
        format.printf(({ level, message, timestamp, ...meta }) => {
          let extra = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          return `[${timestamp}] ${level}: ${message}${extra}`;
        })
      ),
    }),
  ],
});

module.exports = logger;
