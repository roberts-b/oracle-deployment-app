var {ipcMain} = require('electron');
var log = require('electron-log');
var {getAllTnsNames} = require('../tns_operations/parse-tnsfile.js');
var settingsHelper = require('../helpers/settings-helper');
const constants = require('../../src/constants/constants.js');
const rpcNames = require('../../src/constants/rpc-names.js');
const {validateConnection} = require('../db_operations/validate-connection.js');

ipcMain.on(rpcNames.GET_ALL_TNS_NAMES.reqName, (event, args) => { 
    log.info('get_all_tns_async received '); 
    getAllTnsNames().
        then(function(result){
            log.info('tnsListener received from getAllTnsNames reply: ', result);
            event.sender.send(rpcNames.GET_ALL_TNS_NAMES.respName, {status: constants.SUCCESS_MESSAGE, value: result});

        }).catch(function(error){
            log.error('tnsListener received from getAllTnsNames reply: ', error);
            event.sender.send(rpcNames.GET_ALL_TNS_NAMES.respName, {status: constants.FAILURE_MESSAGE, value: error.message});
        });
    
    
 }); 

 ipcMain.on(rpcNames.GET_CURRENT_TNS_NAME.reqName, (event, args) => { 
    log.info('get_current_tns_sync received '); 
    let currentTns =  settingsHelper.getCurrentTnsName();
    log.info('get_current_tns_sync returning: ', currentTns);
    event.returnValue = {status: constants.SUCCESS_MESSAGE, value: currentTns};
 }); 

 ipcMain.on(rpcNames.SET_CURRENT_TNS_NAME.reqName, (event, args) => { 
    log.info('set_current_tns_sync received ', args); 
    let result =  settingsHelper.setCurrentlyUsedTnsName(args);
    log.info('set_current_tns_sync returning: ', result);
    event.returnValue = {status: constants.SUCCESS_MESSAGE, value: result};
 }); 

 ipcMain.on(rpcNames.GET_USERNAME_PASSWORD_BY_TNS_NAME.reqName, (event, args) => { 
    log.info('get_username_password_by_tns_name_sync received ', args); 
    let result =  settingsHelper.getUserNamePasswordByTnsName(args);
    log.info('get_username_password_by_tns_name_sync returning: ', result);
    event.returnValue = {status: constants.SUCCESS_MESSAGE, value: result};
 }); 

 ipcMain.on(rpcNames.SET_USERNAME_PASSWORD_BY_TNS_NAME.reqName, (event, args) => { 
    log.info('set_username_password_by_tns_name_sync received ', args); 

    //check if username and password are already preset,then skip connection check and also return success message
    let alreadyUsedUsernamePassword =  settingsHelper.getUserNamePasswordByTnsName(args.tnsName);

    if(args.userName === alreadyUsedUsernamePassword.userName && args.password === alreadyUsedUsernamePassword.password){
        log.info('Provided ',args, ' are already used in system so skipping connection check and setting logic');
        event.sender.send(rpcNames.SET_USERNAME_PASSWORD_BY_TNS_NAME.respName, {status: constants.SUCCESS_MESSAGE, value: 'Provided username/password are already used for '+args.tnsName});
        return;
    }

    validateConnection(args).then(function(validationResult){
        log.info('validateConnection returned value: ', validationResult);
        let result =  settingsHelper.setUserNamePasswordByTnsName(args);
        log.info('set_username_password_by_tns_name_async returning: ', result);
        event.sender.send(rpcNames.SET_USERNAME_PASSWORD_BY_TNS_NAME.respName, {status: constants.SUCCESS_MESSAGE, value: result});
    }).catch(function(error){
        log.error('tnsListener received from set_username_password_by_tns_name_async reply: ', error);
        event.sender.send(rpcNames.SET_USERNAME_PASSWORD_BY_TNS_NAME.respName, {status: constants.FAILURE_MESSAGE, value: error.message});
    });

    
 }); 