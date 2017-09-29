//add properties to environment path

const path = require('path');
const settings = require('electron-settings');
const INSTANT_CLIENT_SETTINGS_NAME = 'instantclient_path';
const TNSNAMES_FOLDER_SETTINGS_NAME = 'tnsnames_path';
const LOGS_FOLDER_SETTINGS_NAME = 'logs_path';
const LOGGING_LEVEL_SETTTINGS_NAME = 'logs_level';


function getLogFileName(){
    return `${new Date().toISOString().substring(0, 10)}_log.log`;
}

function getLogsFilesFolderPath(){
    return settings.get(LOGS_FOLDER_SETTINGS_NAME, path.join(__dirname, '..', '/logs/'));
}

function createLogsDir(){
    var fs = require('fs');
    var dir = getLogsFilesFolderPath();

    if (!fs.existsSync(dir)){
        log.info('createLogsDir: logs folder : '+ dir+ ' does not exist so creating it!');
        fs.mkdirSync(dir);
    }
}

//sets path to Oracle Instant client
// presetDefaultSettingsValueIfNeeded(INSTANT_CLIENT_SETTINGS_NAME);
process.env['PATH'] = settings.get(INSTANT_CLIENT_SETTINGS_NAME, path.join(__dirname,'..', '/instantclient')) + ';' + process.env['PATH'];

//sets path to folder which contains tnsNames.ora file
process.env['TNS_ADMIN']=settings.get(TNSNAMES_FOLDER_SETTINGS_NAME, path.join(__dirname,'..', '/tnsNames'));

//configure logging
const log = require('electron-log');
log.transports.file.level = settings.get(LOGGING_LEVEL_SETTTINGS_NAME, 'info');;

createLogsDir();

log.transports.file.file = path.join(getLogsFilesFolderPath(),getLogFileName());

