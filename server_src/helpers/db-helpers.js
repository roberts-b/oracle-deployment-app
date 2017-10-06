const log = require('electron-log');
const constants = require('../../src/constants/constants.js');
const settings = require('electron-settings');
const settingsHelper = require('../helpers/settings-helper.js');

// Stream a CLOB and builds up a String piece-by-piece
exports.parseClob = function (clob, connection) {

	return new Promise(function (resolve, reject) {
		clob.setEncoding('utf8');  // set the encoding so we get a 'string' not a 'buffer'
    
		clob.on(
			'error',
			function (err) {
				log.error(err);
				doRelease(connection).catch(function (error){
					reject(Error(error));
					return;
				});
				reject(Error(err));
			});

		// node-oracledb's lob.pieceSize is the number of bytes retrieved
		// for each readable 'data' event.  The default is lob.chunkSize.
		// The recommendation is for it to be a multiple of chunkSize.
		// clob.pieceSize = 100; // fetch smaller chunks to demonstrate repeated 'data' events

		var myclob = ""; // or myblob = Buffer.alloc(0) for BLOBs
		clob.on(
			'data',
			function (chunk) {
				log.info("clob.on 'data' event.  Got %d bytes of data", chunk.length);
				// Build up the string.  For larger LOBs you might want to print or use each chunk separately
				myclob += chunk; // or use Buffer.concat() for BLOBS
			});
		clob.on(
			'end',
			function () {
				log.info("clob.on 'end' event");
				
			});
		clob.on(
			'close',
			function () {
				log.info("clob.on 'close' event");
				doRelease(connection).catch(function (error){
					reject(Error(error));
					return;
				});
				// log.info(myclob);
				resolve(myclob);
			});
	});
};

// Note: connections should always be released when not needed
var doRelease = exports.doRelease = function (connection) {
	return new Promise(function (resolve, reject){
		connection.close(
			function (err) {
				if (err) {
					log.error(err);
					reject(err);
				}
				resolve('SUCCESS');
			});
	});
	
};

exports.getConnectionParametersObject = function () {
	return {
		user: settings.get('crsDev.user','TIA'),
		password: settings.get('crsDev.password','tia7vatit'),
		connectString: settingsHelper.getCurrentTnsName(),
	};
};