var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_johalj',
  password        : '9469',
  database        : 'cs340_johalj'
});
module.exports.pool = pool;
