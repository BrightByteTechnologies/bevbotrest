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

router.get("/", (req, res) =>{
  const restaurantId = req.query.restaurant_id;
  if (!restaurantId) {
      res.status(400).send("restaurant_id is required");
      return;
  }

  const escapedRestaurantId = sqlstring.escape(restaurantId);
  const sql = `SELECT products.id, products.productName, products.productDesc, 
              products.basePrice, products.picUrl, taxes.description as taxDescription, taxes.amount as taxAmount 
              FROM products 
              LEFT JOIN taxes ON products.taxID = taxes.id WHERE products.restaurant_id = ${escapedRestaurantId}`;

  pool.query(sql, (error, results, fields) => {
    if (error) throw error;

    const formattedResults = results.map(item => {
      return {
          id: item.id,
          name: item.productName,
          description: item.productDesc,
          price: item.basePrice,
          taxDesc: item.taxDescription,
          taxAmount: item.taxAmount,
          url: item.picUrl
      }
  });

  res.json(formattedResults);
  });
});

module.exports = router;
