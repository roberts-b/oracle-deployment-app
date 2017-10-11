'use strict';

require('./server_src/setup/environment-setup.js');

// Import parts of electron to use
var path = require('path');
const {app, BrowserWindow, ipcMain} = require('electron');
const url = require('url')
var log = require('electron-log');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

function createWindow() {
  //start listener
  loadAllListeners();


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024, height: 768, show: false
  });

  // and load the index.html of the app.
  let indexPath;
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow.loadURL( indexPath );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
    
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;


    //TODO: maybe it is not needed currently will remove, later will have to check
    // ipcMain.removeAllListeners([
    //   'get_all_tns_async',
    //    'get_current_tns_sync',
    //    'set_current_tns_sync',
    //    'getDDL_async'
    //   ]);
    // log.info('mainWindow.on(closed) all RPC listeners unregistered');
  });



}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

//print to log unhandled promise rejections
process.on('unhandledRejection', error => {
  // Prints "unhandledRejection woops!"
  log.error('unhandledRejection: ', error);
});

function loadAllListeners(){
  require('./server_src/server_listeners/DDL-listener.js');
  require('./server_src/server_listeners/tns-listener.js');
  require('./server_src/server_listeners/db-structure-listener.js');
}
