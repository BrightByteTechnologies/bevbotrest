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

router.post("/reserve", (req, res) => {
    const restaurantId = req.body.restaurant_id;
    const table_no = req.body.tableNo;
    if (!restaurantId || !table_no) {
        res.status(400).send("restaurant_id and tableNo are required");
        return;
    }
    console.log("/reserver called");
    const escapedRestaurantId = sqlstring.escape(restaurantId);
    const escapedTableNo = sqlstring.escape(table_no);

    const sql = 
        `UPDATE tables SET reserved = 1 WHERE restaurant_id = ${escapedRestaurantId} AND tableNo = ${escapedTableNo} AND reserved = 0`;

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

module.exports = router;