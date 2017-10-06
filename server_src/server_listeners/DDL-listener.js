var {ipcMain} = require('electron');
var log = require('electron-log');
var {getDDLFunction} = require('../db_operations/getDDL.js');
const constants = require('../../src/constants/constants.js');

ipcMain.on('getDDL_async', (event, args) => { 
    log.info('getDDL_async received with args: '+ args); 
    getDDLFunction(args['objectType'], args['objectName'], args['dbSchema']).
        then(function(result){
            log.info('DDLListener received from getDDLFunction reply: ', result);
            event.sender.send('getDDL_reply_async', {status: constants.SUCCESS_MESSAGE, value: result});

        }).catch(function(error){
            log.error('DDLListener received from getDDLFunction reply: ', error);
            event.sender.send('getDDL_reply_async', {status: constants.FAILURE_MESSAGE, value: error.message});
        });
    
    
 }); 