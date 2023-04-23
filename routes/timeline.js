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
  pool.query("SELECT * FROM timeline", (error, results, fields) => {
    if (error) throw error;

    const formattedResults = results.map(item => {
        return {
          id: item.id,
          date: item.date,
          description: item.picDesc,
          url: item.picUrl,
        }
      });
    
      res.json(formattedResults);
  });
});

module.exports = router;