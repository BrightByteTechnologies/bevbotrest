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
router.get("/", (req, res) =>{
  // Retrieve the restaurant_id parameter from the query string
  const restaurantId = req.query.restaurant_id;

  // Check if restaurant_id is present
  if (!restaurantId) {
      res.status(400).send("restaurant_id is required");
      return;
  }

  // Escape the restaurantId to prevent SQL injection
  const escapedRestaurantId = sqlstring.escape(restaurantId);

  // SQL query to retrieve products with their associated tax information
  const sql = `SELECT products.id, products.productName, products.productDesc, 
              products.basePrice, products.picUrl, taxes.description as taxDescription, taxes.amount as taxAmount 
              FROM products 
              LEFT JOIN taxes ON products.taxID = taxes.id WHERE products.restaurant_id = ${escapedRestaurantId}`;

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
          id: item.id,
          name: item.productName,
          description: item.productDesc,
          price: item.basePrice,
          taxDesc: item.taxDescription,
          taxAmount: item.taxAmount,
          url: item.picUrl
      };
    });

    // Send the formatted results as JSON response
    res.json(formattedResults);
  });
});

// Export the router module
module.exports = router;