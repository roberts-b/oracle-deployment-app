const tns = require('tns').default;
const fs = require('fs');
const settingsHelper = require('../helpers/settings-helper.js');
var log = require('electron-log');

exports.getAllTnsNames = function(){
    log.info('inside getAllTnsNames');
    return new Promise(function (resolve, reject) {
        let tnsPath = settingsHelper.getTnsFilePath();
        log.info('inside getAllTnsNames tnsPath ', tnsPath);
        fs.readFile(tnsPath + 'tnsnames.ora', 'utf-8', (err, result) => {
            log.info('inside getAllTnsNames contents: '+ result);
            if(err){
                reject(Error(err));
            }else{
                const contents = tns(result);
                resolve(Object.keys(contents));
            }

        });
    });
}