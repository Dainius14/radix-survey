import winston = require('winston');
import { format, transports } from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    new transports.File({ dirname: 'logs', filename: 'error.log', level: 'error' }),
    new transports.File({ dirname: 'logs', filename: 'log.log' }),
    
    new winston.transports.Console({
      format: format.combine(
        format.timestamp({ format: 'HH:mm:ss' }),
        format.splat(),
        format.printf(({ level, timestamp, message, service, ...rest }) => {
          let restStr = JSON.stringify(rest, null, 4);
          restStr = restStr != '{}' ? ' ' + restStr : '';
          return format.colorize().colorize(level, `[${timestamp}] `)
            + message + restStr;
        }
      )
    )})
  ]
});

export default logger