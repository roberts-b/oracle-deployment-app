var oracledb = require('oracledb');
var log = require('electron-log');
var {doRelease, getConnectionParametersObject } = require('../helpers/db-helpers.js');


// Get a non-pooled connection
exports.validateConnection = function (connectionParamsObject) {
    var connectionParams = {};

    if (connectionParamsObject) {
        log.info('validating with provided connection object', connectionParamsObject);

        connectionParams = {
            user: connectionParamsObject.userName,
            password: connectionParamsObject.password,
            connectString: connectionParamsObject.tnsName,
        }

    } else {
        log.info('connection object is null so using getConnectionParametersObject() function');
        connectionParams = getConnectionParametersObject();
    }

    log.info(connectionParams);
    return new Promise(function (resolve, reject) {
        oracledb.getConnection(
            connectionParams,
            function (err, connection) {
                if (err) {
                    log.error(err.message);
                    reject(Error(err));
                    return;
                }
                log.info('getAllObjectsByObjectType executing query: select SYSDATE from dual');
                connection.execute(

                    "select SYSDATE from dual",
                    function (err, result) {
                        if (err) {
                            log.error(err.message);
                            reject(Error(error));
                            doRelease(connection).catch(function (error) {
                                reject(Error(error));
                            });
                            return;
                        };
                        log.info('validate connection result for select SYSDATE from dual: ',result.rows);
                        doRelease(connection).catch(function (error) {
                            reject(Error(error));
                        });
                        resolve('Connection was created successfully with params: username: ' + connectionParams.user
                            + ' password: ' + connectionParams.password + ' connectString: ' + connectionParams.connectString);
                    });
            });
    });
};