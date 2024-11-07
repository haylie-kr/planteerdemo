const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const moment = require('moment-timezone');
const appendTimestamp = winston.format((info, opts) => {
  if (opts.tz)
    info.timestamp = moment().tz(opts.tz).format(" YYYY-MM-DD HH:mm:ss ||");
  return info;
});
const format = winston.format.combine(
  appendTimestamp({ tz: "Asia/Seoul" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level} | ${info.message}`
  )
);
const logger = winston.createLogger({
    format,
    transports: [
        new DailyRotateFile({
          level : "info",
          filename: 'logs/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d'
        }), new winston.transports.Console({ handleExceptions: true }) ,
        new DailyRotateFile({
          level: "error",
          datePattern: "YYYY-MM-DD",
          filename: `logs/%DATE%.error.log`,
        })
      ]
});

module.exports = logger;