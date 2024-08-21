import log4js from 'log4js';

// Configure log4js
log4js.configure({
    appenders: {
        out: { type: 'stdout' }, // Log to console
        app: { type: 'file', filename: 'application.log' }, // Log to a file
    },
    categories: {
        default: { appenders: ['out', 'app'], level: 'debug' }, // Use both console and file for logging
    },
});

const logger = log4js.getLogger();

export default logger;
