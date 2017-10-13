"use strict";

var log = require('electron-log');

exports.queryAll = function(conn, sql, args, maxRowNumberToFetch, cb) {
	var allRows = [];
	conn.execute(sql, args, {
		resultSet: true,
		prefetchRows: maxRowNumberToFetch
	}, function(err, result) {
		if (err) return cb(err);

		function fetch() {
			result.resultSet.getRows(maxRowNumberToFetch, function(err, rows) {
				if (err) return cb(err);
				allRows.push(rows);
				if (rows.length === maxRowNumberToFetch) {
					fetch();
				} else {
					result.resultSet.close(function(err) {
						if (err) return cb(err);
						cb(null, Array.prototype.concat.apply([], allRows));
					});
				}
			});
		}
		fetch();
	});
};