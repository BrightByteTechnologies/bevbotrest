// Import required modules
const express = require("express");
const mysql = require('mysql');

// Create an instance of the Express router
const router = express.Router();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "brightbyteadmin",
  password: "bbt2_admin",
  database: "brightbytetechnologies",
});

// Handler for the root route ("/")
router.get("/", (req, res) => {
  // Execute the SQL query to retrieve data from the "timeline" table
  pool.query("SELECT * FROM timeline", (error, results, fields) => {
    if (error) throw error;

    // Format the results to the desired format
    const formattedResults = results.map(item => {
      return {
        id: item.id,
        date: item.date,
        description: item.picDesc,
        url: item.picUrl,
      };
    });

    // Send the formatted results as JSON response
    res.json(formattedResults);
  });
});

// Export the router module
module.exports = router;