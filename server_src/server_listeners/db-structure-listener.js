var {ipcMain} = require('electron');
var log = require('electron-log');
var {getUniqueObjectTypes, getAllObjectsByObjectType} = require('../db_operations/db-structure-operations.js');
const constants = require('../../src/constants/constants.js');
const rpcNames = require('../../src/constants/rpc-names.js');

ipcMain.on(rpcNames.GET_UNIQUE_OBJECT_TYPES.reqName, (event, args) => { 
    log.info('GET_UNIQUE_OBJECT_TYPES received '); 
    getUniqueObjectTypes().
        then(function(result){
            log.info('GET_UNIQUE_OBJECT_TYPES received from getUniqueObjectTypes reply: ', result);
            event.sender.send(rpcNames.GET_UNIQUE_OBJECT_TYPES.respName, {status: constants.SUCCESS_MESSAGE, value: result});

        }).catch(function(error){
            log.error('GET_UNIQUE_OBJECT_TYPES received from getUniqueObjectTypes reply: ', error);
            event.sender.send(rpcNames.GET_UNIQUE_OBJECT_TYPES.respName, {status: constants.FAILURE_MESSAGE, value: error.message});
        });
    
    
 }); 

 ipcMain.on(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.reqName, (event, args) => { 
    log.info('GET_ALL_OBJECTS_BY_OBJECT_TYPE received objectType: ', args); 
    getAllObjectsByObjectType(args).
        then(function(result){
            // log.info('GET_ALL_OBJECTS_BY_OBJECT_TYPE received from getUniqueObjectTypes reply: ', result);
            event.sender.send(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.respName, {status: constants.SUCCESS_MESSAGE, value: result});

        }).catch(function(error){
            log.error('GET_ALL_OBJECTS_BY_OBJECT_TYPE received from getUniqueObjectTypes reply: ', error);
            event.sender.send(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.respName, {status: constants.FAILURE_MESSAGE, value: error.message});
        });
    
    
 }); 