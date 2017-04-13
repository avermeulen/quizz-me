var Promise = require('bluebird');
module.exports = function (connection) {
    return {
        execute: function (sql, params) {
            return new Promise(function (resolve, reject) {
                connection.query(sql, params || {}, function (err, results) {
                    if (err)
                        return reject(err);
                    resolve(results);
                });
            });
        }
    };
};
