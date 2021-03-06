//add properties to environment path

const path = require('path');
const settings = require('electron-settings');
const constants = require('../../src/constants/constants.js');
const settingsHelper = require('../helpers/settings-helper.js');


function getLogFileName() {
    return `${new Date().toISOString().substring(0, 10)}_log.log`;
}

function getLogsFilesFolderPath() {
    return settings.get(constants.LOGS_FOLDER_SETTINGS_NAME, path.join(__dirname, '..', '..', '/logs/'));
}

function createLogsDir() {
    var fs = require('fs');
    var dir = getLogsFilesFolderPath();

    if (!fs.existsSync(dir)) {
        log.info('createLogsDir: logs folder : ' + dir + ' does not exist so creating it!');
        fs.mkdirSync(dir);
    }
}

//sets path to Oracle Instant client
// presetDefaultSettingsValueIfNeeded(INSTANT_CLIENT_SETTINGS_NAME);
process.env.PATH = settings.get(constants.INSTANT_CLIENT_SETTINGS_NAME, path.join(__dirname, '..', '..', '/instantclient')) + ';' + process.env.PATH;

//sets path to folder which contains tnsNames.ora file
process.env.TNS_ADMIN = settingsHelper.getTnsFilePath();

//preset default tnsname if needed
settingsHelper.presetDefaultTnsNameIfNeeded();

//configure logging

let defaultLogLevel = 'error';

if ((process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) && process.argv.indexOf('--noDevServer') === -1) {
    //if running from dev environment set default log level to info
    defaultLogLevel = 'info';
}

const log = require('electron-log');
log.transports.file.level = settings.get(constants.LOGGING_LEVEL_SETTTINGS_NAME, defaultLogLevel);
log.transports.console.level = settings.get(constants.LOGGING_LEVEL_SETTTINGS_NAME, defaultLogLevel);

createLogsDir();

log.transports.file.file = path.join(getLogsFilesFolderPath(), getLogFileName());

