'use strict';
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const env = process.env.NODE_ENV || 'development';

var transport = new transports.DailyRotateFile({
    filename: './logger_logs/%DATE%treel.log',
    datePattern: 'YYYY-MM-DD',
    //zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

transport.on('rotate', function(oldFilename, newFilename) {
    // do something fun
});

var logger = createLogger({
    // change level if in dev environment versus production
    level: env === 'development' ? 'verbose' : 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize(),
                format.printf(
                    info => `${info.timestamp} ${info.level}: ${info.message}`
                )
            )
        }),
        transport
    ]
});

// logger.debug('Debugging info');
// logger.verbose('Verbose info');
// logger.info('Hello world');
// logger.warn('Warning message');
// logger.error('Error info');

exports.logger = logger;
