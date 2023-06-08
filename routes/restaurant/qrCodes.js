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
    // Retrieve the restaurant_id and token parameters from the query string
    const restaurantId = req.query.restaurant_id;
    const token = req.query.token;

    // Check if restaurant_id and token are present
    if (!restaurantId || !token) {
        res.status(400).send("restaurant_id and token are required");
        return;
    }

    // Escape the restaurantId and token to prevent SQL injection
    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedToken = sqlstring.escape(token);

    // SQL query to retrieve tableNo and used status from the codes table
    const sql = `SELECT tableNo, used FROM codes WHERE restaurant_id = ${escapedRestaurantId} AND token = ${escapedToken}`;

    // Execute the SQL query
    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }

        // Format the results to desired format
        const formattedResults = results.map(item => {
            return {
                tableNo: item.tableNo,
                used: item.used,
            };
        });

        // Send the formatted results as JSON response
        res.json(formattedResults);
    });
});

// Handler for the "/register" route
router.post('/register', (req, res) => {
    // Retrieve the restaurant_id, token, and tableNo from the request body
    const restaurantId = req.body.restaurant_id;
    const token = req.body.token;
    const tableNo = req.body.tableNo;

    // Check if restaurant_id, token, and tableNo are present
    if (!restaurantId || !token || !tableNo) {
        res.status(400).send('restaurant_id, token, and tableNo are required!');
        return;
    }

    // Escape the restaurantId, token, and tableNo to prevent SQL injection
    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedToken = sqlstring.escape(token);
    const escapedTableNo = sqlstring.escape(tableNo);

    // SQL query to check if the restaurant exists
    const sql = `SELECT id FROM restaurants WHERE restaurant_id = ${escapedRestaurantId}`;

    // Execute the SQL query to check if the restaurant exists
    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }

        // Check if the restaurant exists
        if (results.length < 1) {
            res.status(404).send("Restaurant not found");
            return;
        }

        // SQL query to insert the new record into the codes table
        const insertSql = `INSERT INTO codes VALUES (null, ${escapedRestaurantId}, ${escapedToken}, ${escapedTableNo}, 0)`;

        // Execute the SQL query to insert the new record
        pool.query(insertSql, (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
                return;
            }

            res.status(201).send("Token registered successfully");
        });
    });
});

// Handler for the "/use" route
router.post('/use', (req, res) => {
    // Retrieve the restaurant_id and token from the request body
    const restaurantId = req.body.restaurant_id;
    const token = req.body.token;

    // Check if restaurant_id and token are present
    if (!restaurantId || !token) {
        res.status(400).send('restaurant_id and token are required!');
        return;
    }

    // Escape the restaurantId and token to prevent SQL injection
    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedToken = sqlstring.escape(token);

    // SQL query to check if the restaurant exists
    const sql = `SELECT id FROM restaurants WHERE restaurant_id = ${escapedRestaurantId}`;

    // Execute the SQL query to check if the restaurant exists
    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }

        // Check if the restaurant exists
        if (results.length < 1) {
            res.status(404).send("Restaurant not found");
            return;
        }

        // SQL query to update the used status in the codes table
        const updateSql = `UPDATE codes SET used = 1 WHERE restaurant_id = ${escapedRestaurantId} AND token = ${escapedToken}`;

        // Execute the SQL query to update the used status
        pool.query(updateSql, (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
                return;
            }

            res.status(200).send("OK");
        });
    });
});

// Export the router module
module.exports = router;