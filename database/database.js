const mysql = require('mysql');

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Amtmhs45152',
    database: 'typhon',
    charset: 'utf8mb4',
});

module.exports = db;