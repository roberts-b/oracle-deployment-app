const {dialog} = require('electron');
const fs = require('fs');
var log = require('electron-log');

exports.saveFile = function (contentToSave, fileName) {
    log.info('saveFileFunction called contentToSave: ', contentToSave);

    return new Promise(function (resolve, reject) {
        if(!contentToSave){
            reject(Error('Content to save is null or undefined skipping save operation'));
            return;
        }
    let dialogOptions = {
        title: 'Save database object',
        filters: [
            { name: 'DB files', extensions: ['sql', 'pls', 'ddl'] },
            { name: 'Any', extensions: ['*'] }
          ]
    }
    if(fileName){
        dialogOptions.defaultPath = '~/'+fileName
    }
    
    dialog.showSaveDialog(dialogOptions ,function(fileName){
        if(!fileName){
            log.error('saveFileFunction fileName is undefined or null skipping save operation');
            reject(Error('FileName is undefined or null skipping save operation'));
            return;
        }

        fs.writeFile(fileName,contentToSave, function(error) {
            if(error){
                log.error('saveFileFunction save operation failed with error: ', error);
                reject(Error(error));
                return; 
            }

            resolve('Content successfully saved to file: '+ fileName);
        })
    })
});

}
