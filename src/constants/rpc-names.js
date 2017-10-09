var constants = require('./constants.js'); 

module.exports = {
	GET_ALL_TNS_NAMES: {type: constants.ASYNC_RPC_TYPE_NAME,
		reqName: 'get_all_tns_request_async',
		respName: 'get_all_tns_response_async'},
	GET_CURRENT_TNS_NAME: {type: constants.SYNC_RPC_TYPE_NAME,
		reqName: 'get_current_tns_sync'},
	SET_CURRENT_TNS_NAME: {type: constants.SYNC_RPC_TYPE_NAME,
		reqName: 'set_current_tns_sync'},
	GET_USERNAME_PASSWORD_BY_TNS_NAME: {type: constants.SYNC_RPC_TYPE_NAME,
		reqName: 'get_username_password_by_tns_name_sync'},
	SET_USERNAME_PASSWORD_BY_TNS_NAME: {type: constants.ASYNC_RPC_TYPE_NAME,
		reqName: 'set_username_password_by_tns_name_async',
		respName: 'set_username_password_by_tns_name_response_async'},


	GET_DDL: {type: constants.ASYNC_RPC_TYPE_NAME,
		reqName: 'getDDL_async',
		respName: 'getDDL_response_async'},

};