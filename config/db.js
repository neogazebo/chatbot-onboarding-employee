'use strict'

const mysql = require('mysql');

// @todo : separate by ENV
let connection  = mysql.createPool({
  connectionLimit : 10,
  host            : 'dbdev.orlitodb.com',
  user            : 'admin',
  password        : 'mypass$',
  database        : 'orlitodb',
  // multipleStatements : true
});

module.exports.connection = connection;