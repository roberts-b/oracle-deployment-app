const constants = require('../../src/constants/constants.js');
const settings = require('electron-settings');
const path = require('path');
var log = require('electron-log');
const {getAllTnsNames} = require('../tns_operations/parse-tnsfile.js');

exports.getTnsFilePath = function(){
    return settings.get(constants.TNSNAMES_FOLDER_SETTINGS_NAME, path.join(__dirname,'..','..', '/tnsNames/'));
};

exports.getCurrentTnsName = function(){
    let currentTnsName = settings.get(constants.CURRENT_DATABASE_SETTINGS_NAME);
    return currentTnsName;
}

exports.presetDefaultTnsNameIfNeeded = function () {
    //default is empty we must preset TNS name, lets pick first from the list tnsnames.ora file if ofcourse it is not empty
    if(!settings.get(constants.CURRENT_DATABASE_SETTINGS_NAME)){
        getAllTnsNames().then(function(result){
            if(result && result.length > 0) {
                settings.set(constants.CURRENT_DATABASE_SETTINGS_NAME, result[0]);
            }else{
                log.error('presetDefaultTnsNameIfNeeded list of tns names in tnsnames.ora file is empty, so cannot preset default value');
            }
        }).catch(function(error){
            log.error(error);
        });
    }
};

exports.setCurrentlyUsedTnsName = function(newTnsName) {
    log.info('setCurrentlyUsedTnsName setting new value: ', newTnsName);
    settings.set(constants.CURRENT_DATABASE_SETTINGS_NAME, newTnsName);
    return constants.SUCCESS_MESSAGE;
}

exports.getUserNamePasswordByTnsName = function(tnsName) {
    log.info('getUserNamePasswordByTnsName received TnsName: ',tnsName);
    let userName = settings.get(tnsName+'.user');
    let password = settings.get(tnsName+'.password');

    if(userName === undefined){
        userName = '';
    }
    if(password === undefined){
        password = '';
    }
    return {userName: userName, password: password};
}