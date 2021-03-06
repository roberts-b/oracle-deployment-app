var oracledb = require('oracledb');
var log = require('electron-log');
var { parseClob, doRelease, getConnectionParametersObject } = require('../helpers/db-helpers.js');


// Get a non-pooled connection
exports.getDDLFunction = function (objectType, objectName) {
    const connectionParamsObject = getConnectionParametersObject();
    log.info('getDDLFunction connecting using: ',connectionParamsObject);
    return new Promise(function (resolve, reject) {
        oracledb.getConnection(
            connectionParamsObject,
            function (err, connection) {
                if (err) {
                    log.error(err.message);
                    reject(Error(err));
                    return;
                }

                var bindvars = {
                    objectType: objectType,
                    objectName: objectName,
                    dbSchema: connectionParamsObject.user.toUpperCase(),
                    ret: { dir: oracledb.BIND_OUT, type: oracledb.CLOB }
                };
                connection.execute(
                    // The statement to execute
                    "BEGIN :ret := dbms_metadata.get_ddl(:objectType,:objectName,:dbSchema); END;",

                    bindvars,

                    // The callback function handles the SQL execution results
                    function (err, result) {
                        if (err) {
                            log.error(err);
                            doRelease(connection).catch(function (error){
                                reject(Error(error));
                                return;
                              });
                            reject(Error(err));
                            return;
                        }
                        // log.info(result.outBinds);
                        parseClob(result.outBinds.ret, connection).then(function (clobdata) {
                            resolve(clobdata);
                        }).catch(function (error) {
                            log.error(error);
                            reject(Error(error));
                            return;
                        });

                    });
            });
    });
};