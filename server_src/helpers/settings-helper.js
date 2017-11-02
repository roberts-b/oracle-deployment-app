const constants = require('../../src/constants/constants.js');
const settings = require('electron-settings');
const path = require('path');
var log = require('electron-log');
const {getAllTnsNames} = require('../tns_operations/parse-tnsfile.js');

exports.getTnsFilePath = function(){
    return settings.get(constants.TNSNAMES_FOLDER_SETTINGS_NAME, path.join(__dirname,'..','..', '/tnsNames/'));
};

var getCurrentTnsName = exports.getCurrentTnsName = function(){
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

exports.setUserNamePasswordByTnsName = function(valueObject){
    log.info('setUserNamePasswordByTnsName received value: ', valueObject);
    const tnsName = valueObject.tnsName;
    const userName = valueObject.userName;
    const password = valueObject.password;
    settings.set(tnsName+'.user', userName);
    settings.set(tnsName+'.password', password);
    return 'New values are preset successfully';
}

//Expected input structure: {objectName: '', filterExpression: '', isNot: false}
exports.saveDbStructureFilterParameters = function(valueObject){
    log.info('saveDbStructureFilterParameters received value: ', valueObject);
    const currentTnsName = getCurrentTnsName();
    if(!currentTnsName || '' === currentTnsName){
        return {status: constants.FAILURE_MESSAGE, message: 'Saving failed current TNS name is null or undefined'};
    }

    if(!valueObject.objectName || '' === valueObject.objectName){
        return {status: constants.FAILURE_MESSAGE, message: 'Saving failed provided object name is null or undefined'};
    }
    const saveExpressionFirstPart = currentTnsName+'_'+valueObject.objectName;
    settings.set(saveExpressionFirstPart+'.expression', valueObject.expression);
    settings.set(saveExpressionFirstPart+'.isNot', valueObject.isNot);
    return {status: constants.SUCCESS_MESSAGE, message: 'Structure filter values saved successfully'};
}

exports.getDbStructureFilterParameters = function(objectName){
    const currentTnsName = getCurrentTnsName();
    if(!currentTnsName || '' === currentTnsName){
        log.error('Getting current filter parameters failed, because currentTnsName is undefined or empty');
        return {status: constants.FAILURE_MESSAGE, message: 'Getting current filter parameters failed, because currentTnsName is undefined or empty'};
    }

    if(!objectName || '' === objectName){
        return {status: constants.FAILURE_MESSAGE, message: 'Getting current filter parameters failed provided object name is null or undefined'};
    }
    const getExpressionFirstPart = currentTnsName+'_'+objectName;
    let expression = settings.get(getExpressionFirstPart+'.expression', '');
    let isNot = settings.get(getExpressionFirstPart+'.isNot', false);
    const returnValue = {objectName: objectName, expression: expression, isNot: isNot};
    // log.info('getDbStructureFilterParameters for : ', getExpressionFirstPart, ' returning: ', returnValue);
    return {status: constants.SUCCESS_MESSAGE, result: returnValue};
}