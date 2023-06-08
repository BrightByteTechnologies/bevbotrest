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
    // Execute the SQL query to retrieve employees from the database
    pool.query("SELECT * FROM employees WHERE teamId = 3", (error, results, fields) => {
        if (error) throw error;

        // Format the results to the desired format
        const formattedResults = results.map(item => {
            return {
                id: item.id,
                firstName: item.employeeFirstname,
                lastName: item.employeeLastname,
                team: "Hardware",
                position: item.employeePosition,
                url: item.picUrl,
            };
        });

        // Send the formatted results as JSON response
        res.json(formattedResults);
    });

});

// Export the router module
module.exports = router;