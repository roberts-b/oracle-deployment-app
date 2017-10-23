var {ipcMain} = require('electron');
var log = require('electron-log');
var {getDDLFunction} = require('../db_operations/getDDL.js');
const constants = require('../../src/constants/constants.js');
const rpcNames = require('../../src/constants/rpc-names.js');

ipcMain.on(rpcNames.GET_DDL.reqName, (event, args) => { 
    log.info('getDDL_async received with args: '+ args); 
    getDDLFunction(args['objectType'], args['objectName']).
        then(function(result){
            // log.info('DDLListener received from getDDLFunction reply: ', result);
            event.sender.send(rpcNames.GET_DDL.respName, {status: constants.SUCCESS_MESSAGE, value: result});

        }).catch(function(error){
            log.error('DDLListener received from getDDLFunction reply: ', error);
            event.sender.send(rpcNames.GET_DDL.respName, {status: constants.FAILURE_MESSAGE, value: error.message});
        });
    
    
 }); 