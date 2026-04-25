const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to Railway MySQL!');
});

module.exports = db;
