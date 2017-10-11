var oracledb = require('oracledb');
var log = require('electron-log');
var { doRelease, getConnectionParametersObject } = require('../helpers/db-helpers.js');


// Get a non-pooled connection
exports.getUniqueObjectTypes = function () {
    var connectionParams = {};

    log.info('connection object is null so using getConnectionParametersObject() function');
    connectionParams = getConnectionParametersObject();

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

                connection.execute(
                    "SELECT unique(OBJECT_TYPE) FROM ALL_OBJECTS where OWNER = :owner_bv",
                    [connectionParams.user.toUpperCase()],
                    function (err, result) {
                        if (err) {
                            log.error(err.message);
                            reject(Error(error));
                            doRelease(connection).catch(function (error) {
                                reject(Error(error));
                            });
                            return;
                        };
                        log.info('getUniqueObjectTypes : ', result);
                        doRelease(connection).catch(function (error) {
                            reject(Error(error));
                        });
                        resolve(result.rows);
                    });
            });
    });
};