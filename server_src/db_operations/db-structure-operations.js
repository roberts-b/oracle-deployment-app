var oracledb = require('oracledb');
var log = require('electron-log');
var { doRelease, getConnectionParametersObject } = require('../helpers/db-helpers.js');
var { queryAll } = require('../helpers/query-all.js');


exports.getUniqueObjectTypes = function () {
    const connectionParams = getConnectionParametersObject();

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

exports.getAllObjectsByObjectType = function (objectType) {
    log.info('getAllObjectsByObjectType called with objectType: ', objectType);
    const connectionParams = getConnectionParametersObject();

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

                // connection.execute(
                //     "SELECT OBJECT_NAME, STATUS FROM ALL_OBJECTS where OWNER= :owner_bv and OBJECT_TYPE=:object_type_bv order by OBJECT_NAME",
                //     [connectionParams.user.toUpperCase(), objectType],
                //     {resultSet: false, maxRows: 1000},
                //     function (err, result) {
                //         if (err) {
                //             log.error(err.message);
                //             reject(Error(error));
                //             doRelease(connection).catch(function (error) {
                //                 reject(Error(error));
                //             });
                //             return;
                //         };
                //         log.info('getAllObjectsByObjectType : ', result);
                //         doRelease(connection).catch(function (error) {
                //             reject(Error(error));
                //         });
                //         resolve(result.rows);
                //     });

                queryAll(connection,
                    "SELECT OBJECT_NAME, STATUS FROM ALL_OBJECTS where OWNER= :owner_bv and OBJECT_TYPE=:object_type_bv order by OBJECT_NAME",
                    [connectionParams.user.toUpperCase(), objectType],
                    300,
                    function (err, result) {
                        if (err) {
                            log.error(err.message);
                            reject(Error(error));
                            doRelease(connection).catch(function (error) {
                                reject(Error(error));
                            });
                            return;
                        };
                        // log.info('getAllObjectsByObjectType : ', result);
                        doRelease(connection).catch(function (error) {
                            reject(Error(error));
                        });
                        resolve({objectType: objectType, resultArray : result});
                    })
            });
    });
};