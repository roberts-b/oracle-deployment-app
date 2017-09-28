/* Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved. */

/******************************************************************************
 *
 * You may not use the identified files except in compliance with the Apache
 * License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * NAME
 *   select1.js
 *
 * DESCRIPTION
 *   Executes a basic query without using a connection pool or ResultSet.
 *   Uses Oracle's sample HR schema.
 *
 *   Scripts to create the HR schema can be found at:
 *   https://github.com/oracle/db-sample-schemas
 *
 *   For a connection pool example see webapp.js
 *   For a ResultSet example see resultset2.js
 *   For a query stream example see selectstream.js
 *   For a Promise example see promises.js
 *
 *****************************************************************************/
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var log = require('electron-log');
var {parseClob, doRelease} = require('./server_src/helpers/db-helpers.js');

// force all CLOBs to be returned as Strings
// oracledb.fetchAsString = [ oracledb.CLOB ];

// Get a non-pooled connection

oracledb.getConnection(
	{
		user          : dbConfig.user,
		password      : dbConfig.password,
		connectString : dbConfig.connectString
	},
	function(err, connection)
	{
		if (err) {
			log.error(err.message);
			return;
		}

		var bindvars = {
			bv_type:  'VIEW',
			bv_name: 'TW_CLA_STATISTICS_AV',
			bv_schema: 'TIA',
			ret: {dir: oracledb.BIND_OUT, type: oracledb.CLOB}
		};
		connection.execute(
			// The statement to execute
			"BEGIN :ret := dbms_metadata.get_ddl(:bv_type,:bv_name,:bv_schema); END;",

			// The "bind value" 180 for the "bind variable" :id
			bindvars,

			// The callback function handles the SQL execution results
			function(err, result)
			{
				if (err) {
					log.error(err);
					doRelease(connection);
					return;
				}
				// log.info(result.outBinds);
				var clobdata = parseClob(result.outBinds['ret'], connection);
				log.info(clobdata);
            
			});
	});