/* eslint-disable global-require, max-len */
require('dotenv').config();
require('winston-daily-rotate-file');
const fs = require('fs-extra');
const moment = require('moment');
const winston = require('winston');
const Papertrail = require('winston-papertrail').Papertrail;
const _ = require('lodash');

const { Config } = require('../config');

let logger;

function initLogger() {
  // Don't initialize logger for tests
  if (!_.includes(process.argv, '--test')) {
    const logDir = require('./index').getLogDir();
    fs.ensureDirSync(logDir); // Create log dir if needed

    const winstonCfg = winston.config;
    const transports = [
      new (winston.transports.Console)({
        timestamp() {
          return moment().format('YYYY-MM-DD HH:mm:ss');
        },
        formatter(options) {
          return `${options.timestamp()} ${winstonCfg.colorize(options.level, options.level.toUpperCase())} ${(options.message ? options.message : '')} ${(options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : '')}`;
        },
      }),
      new (winston.transports.DailyRotateFile)({
        filename: `${logDir}/runebasepredictionapp_${moment().format('YYYYMMDD_HHmmss')}.log`,
        timestamp() {
          return moment().format('YYYY-MM-DD HH:mm:ss');
        },
        formatter(options) {
          return `${options.timestamp()} ${winstonCfg.colorize(options.level, options.level.toUpperCase())} ${(options.message ? options.message : '')} ${(options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : '')}`;
        },
        json: false,
        maxFiles: '14d',
      }),
    ];

    // add Papertrail remote logging if prod env
    if (!require('./index').isDevEnv()) {
      transports.push(new Papertrail({
        host: 'logs5.papertrailapp.com',
        port: 46145,
        level: 'info',
        colorize: true,
        logFormat: (level, message) => `< ${level} > ${message}`,
      }));
    }

    logger = new (winston.Logger)({ transports, exitOnError: false });
    logger.level = process.env.LOG_LEVEL || Config.DEFAULT_LOGLVL;
    logger.info(`Logs path: ${logDir}`);
  }
}

function getLogger() {
  if (!logger) {
    throw Error('Logger has not been initialized');
  }
  return logger;
}

module.exports = {
  initLogger,
  getLogger,
};
