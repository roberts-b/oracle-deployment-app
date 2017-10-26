var {ipcMain} = require('electron');
var log = require('electron-log');
var {saveFile} = require('../file_operations/save-file.js');
const constants = require('../../src/constants/constants.js');
const rpcNames = require('../../src/constants/rpc-names.js');

ipcMain.on(rpcNames.SAVE_FILE.reqName, (event, args) => { 
    log.info('SAVE_FILE received ', args); 
    saveFile(args.content, args.fileName).
        then(function(result){
            // log.info('GET_UNIQUE_OBJECT_TYPES received from getUniqueObjectTypes reply: ', result);
            event.sender.send(rpcNames.SAVE_FILE.respName, {status: constants.SUCCESS_MESSAGE, value: result});

        }).catch(function(error){
            log.error('SAVE_FILE received from saveFile reply: ', error);
            event.sender.send(rpcNames.SAVE_FILE.respName, {status: constants.FAILURE_MESSAGE, value: error.message});
        });
    
    
 }); 