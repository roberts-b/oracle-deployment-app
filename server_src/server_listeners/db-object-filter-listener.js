var {ipcMain} = require('electron');
var log = require('electron-log');
var {saveDbStructureFilterParameters, getDbStructureFilterParameters} = require('../helpers/settings-helper.js');
const constants = require('../../src/constants/constants.js');
const rpcNames = require('../../src/constants/rpc-names.js');

ipcMain.on(rpcNames.SAVE_OBJECT_FILTER_PARAMETERS.reqName, (event, args) => { 
    log.info('SAVE_OBJECT_FILTER_PARAMETERS received ', args); 
    const result = saveDbStructureFilterParameters(args);
    event.returnValue = result;
 }); 

 ipcMain.on(rpcNames.GET_OBJECT_FILTER_PARAMETERS.reqName, (event, args) => { 
    log.info('GET_ALL_OBJECTS_BY_OBJECT_TYPE received objectType: ', args); 
    const result = getDbStructureFilterParameters(args);
    event.returnValue = result;
 }); 