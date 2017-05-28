'use strict'

const mysql = require('mysql');

// @todo : separate by ENV
let connection  = mysql.createPool({
  connectionLimit : 10,
  host            : 'dbdev.deydu.com',
  user            : 'deydu',
  password        : 'awesome4$',
  database        : 'orlitodb',
  // multipleStatements : true
});

module.exports.connection = connection;