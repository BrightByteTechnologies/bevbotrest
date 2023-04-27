const express = require("express");
const mysql = require('mysql');

const router = express.Router();
const pool = mysql.createPool({
    host: "localhost",
    user: "restaurantadmin",
    password: "dadFwsgeh",
    database: "restaurant",
});

router.get("/", (req, res) => {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
        res.status(400).send("restaurant_id is required");
        return;
    }

    pool.query("SELECT * FROM tables WHERE restaurant_id = ?", [restaurantId], (error, results, fields) => {
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

router.put("/reserve/:table_no", (req, res) => {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
        res.status(400).send("restaurant_id is required");
        return;
    }
    const { table_no } = req.params;

    // Update the table reservation status
    pool.query(
        "UPDATE tables SET reserved = 1 WHERE restaurant_id = ? AND tableNo = ? AND reserved = 0",
        [restaurantId, table_no],
        (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
                return;
            }

            if (results.affectedRows === 0) {
                res.status(404).send("Table not found or already reserved");
                return;
            }

            res.sendStatus(200);
        }
    );
});

module.exports = router;