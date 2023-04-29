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
    const token = req.query.token;

    if (!restaurantId || !token) {
        res.status(400).send("restaurant_id and token is required");
        return;
    }

    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedToken = sqlstring.escape(token);
    const sql = `SELECT tableNo, used FROM codes WHERE restaurant_id = ${escapedRestaurantId} AND token = ${escapedToken}`;

    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }

        const formattedResults = results.map(item => {
            return {
                tableNo: item.tableNo,
                used: item.used,
            }
        });

        res.json(formattedResults);
    });
});

router.post('/register', (req, res) => {
    const restaurantId = req.body.restaurant_id;
    const token = req.body.token;
    const tableNo = req.body.tableNo;

    if (!restaurantId || !token || !tableNo) {
        res.status(400).send('restaurant_id, token and tableNo are required!');
        return;
    }

    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedToken = sqlstring.escape(token);
    const escapedTableNo = sqlstring.escape(tableNo);
    const sql = `SELECT id FROM restaurants WHERE restaurant_id = ${escapedRestaurantId}`;

    // Check if the restaurant exists
    pool.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }

        if (results.length < 1) {
            res.status(404).send("Restaurant not found");
            return;
        }

        const insertSql = `INSERT INTO codes VALUES (null, ${escapedRestaurantId}, ${escapedToken}, ${escapedTableNo})`;

        // Insert the new record
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

module.exports = router;