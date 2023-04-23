const express = require('express');
const mysql = require('mysql');

const router = express.Router();
const pool = mysql.createPool({
  host: "localhost",
  user: "brightbyteadmin",
  password: "bbt2_admin",
  database: "brightbytetechnologies",
});

router.get("/", (req, res) =>{
  pool.query("SELECT * FROM employees WHERE teamId = 1", (error, results, fields) => {
    if (error) throw error;
  
    const formattedResults = results.map(item => {
      return {
        id: item.id,
        firstName: item.employeeFirstname,
        lastName: item.employeeLastname,
        team: "Management",
        position: item.employeePosition,
        url: item.picUrl,
      }
    });
  
    res.json(formattedResults);
  });
});

module.exports = router;
