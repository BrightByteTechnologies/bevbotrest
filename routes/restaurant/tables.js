// Import required modules
const express = require("express");
const mysql = require('mysql');
const sqlstring = require('sqlstring');

// Create an instance of the Express router
const router = express.Router();

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "restaurantadmin",
    password: "bbt2_restaurants_admin",
    database: "restaurant",
});

// Handler for the root route ("/")
router.get("/", (req, res) => {
    // Retrieve the restaurant_id parameter from the query string
    const restaurantId = req.query.restaurant_id;

    // Check if restaurant_id is present
    if (!restaurantId) {
        res.status(400).send("restaurant_id is required");
        return;
    }

    // Escape the restaurantId to prevent SQL injection
    const escapedRestaurantId = sqlstring.escape(restaurantId);

    // SQL query to retrieve all tables for a given restaurant_id
    const sql = `SELECT * FROM tables WHERE restaurant_id = ${escapedRestaurantId}`;

    // Execute the SQL query
    pool.query(sql, (error, results, fields) => {
        if (error) throw error;

        // Format the results to desired format
        const formattedResults = results.map(item => {
            return {
                tableNo: item.tableNo,
                reserved: item.reserved,
            };
        });

        // Send the formatted results as JSON response
        res.json(formattedResults);
    });
});

// Create a Map to store timeouts for each table
const tableTimeouts = new Map();

// Handler for the "/reserve" route
router.post("/reserve", (req, res) => {
    // Retrieve the restaurant_id, tableNo, and reservedTime from the request body
    const restaurantId = req.body.restaurant_id;
    const table_no = req.body.tableNo;
    const reservedTime = req.body.reservedTime;

    // Checks if all the needed variables are given
    if (!restaurantId || !table_no || !reservedTime) {
        res.status(400).send("restaurant_id, tableNo, and reservedTime are required");
        return;
    }

    // Checks if the given time is of type int
    if (!isInteger(reservedTime)) {
        res.status(400).send("reservedTime has to be of type int!");
        return;
    }

    // Escape the restaurantId and tableNo to prevent SQL injection
    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedTableNo = sqlstring.escape(table_no);

    // Clear previous timeout for the table, if any
    clearTimeout(tableTimeouts.get(table_no));

    // Set a new timeout for unreserving the table
    const timeout = setTimeout(() => unreserve(escapedTableNo, escapedRestaurantId), reservedTime * 1000);
    tableTimeouts.set(table_no, timeout);

    // SQL query to update the table reservation status
    const sql = `UPDATE tables SET reserved = 1 WHERE restaurant_id = ${escapedRestaurantId} AND tableNo = ${escapedTableNo} AND reserved = 0`;

    // Update the table reservation status
    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }

        res.sendStatus(200);
    });
});

// Function to unreserve a table
function unreserve(tableNo, restaurant_id) {
    const sql = `UPDATE tables SET reserved = 0 WHERE restaurant_id = ${restaurant_id} AND tableNo = ${tableNo}`;

    // Update the table reservation status
    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            return;
        }
    });
}

// Function to check if a value is an integer
function isInteger(value) {
    // Check if the value is a number and has no fractional part
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

// Export the router module
module.exports = router;