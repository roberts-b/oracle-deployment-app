var oracledb = require('oracledb');
var log = require('electron-log');
var constants = require('../../src/constants/constants.js');
var { doRelease, getConnectionParametersObject } = require('../helpers/db-helpers.js');
var { getDbStructureFilterParameters } = require('../helpers/settings-helper.js');
var { queryAll } = require('../helpers/query-all.js');


exports.getUniqueObjectTypes = function () {
    const connectionParams = getConnectionParametersObject();

    log.info(connectionParams);
    return new Promise(function (resolve, reject) {
        if(connectionParams.user === '' || connectionParams.password === ''){
            reject(Error('Username or password cannot be empty !'));
            return;
        }
        oracledb.getConnection(
            connectionParams,
            function (err, connection) {
                if (err) {
                    log.error(err.message);
                    reject(Error(err));
                    return;
                }
                log.info('getUniqueObjectTypes executing query: SELECT unique(OBJECT_TYPE) FROM ALL_OBJECTS where OWNER = :owner_bv');
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
                        }
                        log.info('getUniqueObjectTypes : ', result);
                        doRelease(connection).catch(function (error) {
                            reject(Error(error));
                        });
                        resolve(result.rows);
                    });
            });
    });
};

exports.getAllObjectSubTypesByObjectType = function (objectType) {
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

                const filterParameters = getDbStructureFilterParameters(objectType);
                let selectStatement = 'SELECT OBJECT_NAME, STATUS FROM ALL_OBJECTS where OWNER= :owner_bv and OBJECT_TYPE=:object_type_bv';
                if(constants.SUCCESS_MESSAGE === filterParameters.status && '' != filterParameters.result.expression){
                    //apply filter statement to select statement object
                    selectStatement = selectStatement + ' and UPPER(OBJECT_NAME)';
                    if(filterParameters.result.isNot){
                        selectStatement = selectStatement + ' NOT';
                    }

                    selectStatement = selectStatement + ' LIKE UPPER(\''+ filterParameters.result.expression + '\')';
                }else{
                    log.error('getAllObjectSubTypesByObjectType occured error during attempt to get filter parameters for object: ',
                        objectType, ' with following error: ',filterParameters.message);
                }
                selectStatement = selectStatement + ' order by OBJECT_NAME';

                log.info('getAllObjectSubTypesByObjectType executing query with select statement: ', selectStatement);
                queryAll(connection, selectStatement,
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
                        }
                        // log.info('getAllObjectsByObjectType : ', result);
                        doRelease(connection).catch(function (error) {
                            reject(Error(error));
                        });
                        resolve({ objectType: objectType, resultArray: result });
                    });
            });
    });
};