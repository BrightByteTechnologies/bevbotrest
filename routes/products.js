const express = require("express");
const mysql = require('mysql');

const router = express.Router();
const pool = mysql.createPool({
  host: "localhost",
  user: "brightbyteadmin",
  password: "bbt2_admin",
  database: "brightbytetechnologies",
});

router.get("/", (req, res) =>{
  pool.query("SELECT * FROM mytable", (error, results, fields) => {
    if (error) throw error;

    res.json(results);
  });
});

module.exports = router;
