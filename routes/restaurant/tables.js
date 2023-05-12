const express = require("express");
const mysql = require('mysql');
const sqlstring = require('sqlstring');

const router = express.Router();
const pool = mysql.createPool({
    host: "localhost",
    user: "restaurantadmin",
    password: "bbt2_restaurants_admin",
    database: "restaurant",
});

router.get("/", (req, res) => {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
        res.status(400).send("restaurant_id is required");
        return;
    }

    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const sql = `SELECT * FROM tables WHERE restaurant_id = ${escapedRestaurantId}`;

    pool.query(sql, (error, results, fields) => {
        if (error) throw error;

        const formattedResults = results.map(item => {
            return {
                tableNo: item.tableNo,
                reserved: item.reserved,
            }
        });

        res.json(formattedResults);
    });
});

// Create a Map to store timeouts for each table
const tableTimeouts = new Map();

router.post("/reserve", (req, res) => {
    const restaurantId = req.body.restaurant_id;
    const table_no = req.body.tableNo;
    const reservedTime = req.body.reservedTime;

    // Checks if all the needed variables are given
    if (!restaurantId || !table_no || !reservedTime) {
        res.status(400).send("restaurant_id, tableNo, and reservedTime are required");
        return;
    }

    // Checks if the given time is of type int
    // can also be '10' since there are no implicit types in JavaScript
    if (!isInteger(reservedTime)) {
        res.status(400).send("reservedTime has to be of type int!");
        return;
    }

    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedTableNo = sqlstring.escape(table_no);

    // Clear previous timeout for the table, if any
    clearTimeout(tableTimeouts.get(table_no));

    // Set a new timeout for unreserving the table
    const timeout = setTimeout(() => unreserve(escapedTableNo, escapedRestaurantId), reservedTime * 1000);
    tableTimeouts.set(table_no, timeout);

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

function unreserve(tableNo, restaurant_id) {
    const sql =
        `UPDATE tables SET reserved = 0 WHERE restaurant_id = ${escapedRestaurantId} AND tableNo = ${escapedTableNo}`;

    // Update the table reservation status
    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }

        res.sendStatus(200);
    });
}

function isInteger(value) {
    // Check if the value is a number and has no fractional part
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

module.exports = router;