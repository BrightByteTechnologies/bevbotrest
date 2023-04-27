const express = require("express");
const mysql = require('mysql');

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

    pool.query("SELECT token, tableNo FROM codes WHERE restaurant_id = ?", [restaurantId], (error, results, fields) => {
        if (error) throw error;

        const formattedResults = results.map(item => {
            return {
                token: item.token,
                tableNo: item.tableNo,
            }
        });

        res.json(formattedResults);
    });
});

router.post('/register', (req, res) => {
    const restaurantId = req.body.restaurant_id;
    const token = req.body.token;
    const tableNo = req.body.tableNo;
    if (!token || !tableNo) {
        res.status(400).send('restaurant_id, token and tableNo are required!');
        return;
    }

    // Check if the restaurant exists
    checkRestaurantId(restaurantId, err => {
        if (err) {
            console.error(err);
            res.status(err.status).send(err.message);
            return;
        }

        // Insert the new record
        pool.query(
            "INSERT INTO codes VALUES (null, ?, ?, ?)",
            [restaurantId, token, tableNo],
            (error, results) => {
                if (error) {
                    console.error(error);
                    res.status(err[0]).send(err[1]);
                    return;
                }

                res.status(201).send("Token registered successfully");
            }
        );
    });
});

function checkRestaurantId(restaurantId, callback) {
    // Check if the restaurant exists
    pool.query(
        "SELECT id FROM restaurants WHERE restaurant_id = ?",
        [restaurantId],
        (error, results, fields) => {
            if (error) {
                console.error(error);
                callback({ status: 500, message: "Internal Server Error" });
                return;
            }

            if (results.length < 1) {
                callback({ status: 404, message: "Restaurant not found" });
                return;
            }

            callback(null, results);
        }
    );
}

module.exports = router;