var {ipcMain} = require('electron');
var log = require('electron-log');
var {getAllTnsNames} = require('../tns_operations/parse-tnsfile.js');
var settingsHelper = require('../helpers/settings-helper');
const constants = require('../../src/constants/constants.js');

ipcMain.on('get_all_tns_async', (event, args) => { 
    log.info('get_all_tns_async received '); 
    getAllTnsNames().
        then(function(result){
            log.info('tnsListener received from getAllTnsNames reply: ', result);
            event.sender.send('get_all_tns_reply_async', {status: constants.SUCCESS_MESSAGE, value: result});

        }).catch(function(error){
            log.error('tnsListener received from getAllTnsNames reply: ', error);
            event.sender.send('get_all_tns_reply_async', {status: constants.FAILURE_MESSAGE, value: error.message});
        });
    
    
 }); 

 ipcMain.on('get_current_tns_sync', (event, args) => { 
    log.info('get_current_tns_sync received '); 
    let currentTns =  settingsHelper.getCurrentTnsName();
    log.info('get_current_tns_sync returning: ', currentTns);
    event.returnValue = {status: constants.SUCCESS_MESSAGE, value: currentTns};
 }); 

 ipcMain.on('set_current_tns_sync', (event, args) => { 
    log.info('set_current_tns_sync received ', args); 
    let result =  settingsHelper.setCurrentlyUsedTnsName(args);
    log.info('set_current_tns_sync returning: ', result);
    event.returnValue = {status: constants.SUCCESS_MESSAGE, value: result};
 }); 

 ipcMain.on('get_username_password_by_tns_name_sync', (event, args) => { 
    log.info('get_username_password_by_tns_name_sync received ', args); 
    let result =  settingsHelper.getUserNamePasswordByTnsName(args);
    log.info('get_username_password_by_tns_name_sync returning: ', result);
    event.returnValue = {status: constants.SUCCESS_MESSAGE, value: result};
 }); 