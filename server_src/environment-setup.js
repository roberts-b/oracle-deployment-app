//add properties to environment path

var path = require('path');
process.env['PATH'] = path.join(__dirname,'..', '/instantclient') + ';' + process.env['PATH'];
process.env['TNS_ADMIN']=path.join(__dirname,'..', '/tnsNames');


function getLogFileName(){
    return `${new Date().toISOString().substring(0, 10)}_log.log`;
}

function createLogsDir(){
    var fs = require('fs');
    var dir = path.join(__dirname, '..', `/logs`);

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

//configure logging
var log = require('electron-log');
log.transports.file.level = 'info';

createLogsDir();

log.transports.file.file = path.join(__dirname, '..', `/logs/${getLogFileName()}`);
log.info('_____________________');
log.info('Current environment variables setup: ');
log.info(process.env);
log.info('_____________________');

