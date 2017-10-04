var {ipcMain} = require('electron');
var log = require('electron-log');
var {getAllTnsNames} = require('../tns_operations/parse-tnsfile.js');
var settingsHelper = require('../helpers/settings-helper');

ipcMain.on('get_all_tns_async', (event, args) => { 
    log.info('get_all_tns_async received '); 
    getAllTnsNames().
        then(function(result){
            log.info('tnsListener received from getAllTnsNames reply: ', result);
            event.sender.send('get_all_tns_reply_async', result);

        }).catch(function(error){
            log.error('tnsListener received from getAllTnsNames reply: ', error);
            event.sender.send('get_all_tns_reply_async', error);
        })
    
    
 }); 

 ipcMain.on('get_current_tns_sync', (event, args) => { 
    log.info('get_current_tns_sync received '); 
    let currentTns =  settingsHelper.getCurrentTnsName();
    log.info('get_current_tns_sync returning: ', currentTns);
    event.returnValue = currentTns;
 }); 