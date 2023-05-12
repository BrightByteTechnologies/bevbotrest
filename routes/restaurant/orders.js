const { json } = require("body-parser");
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
  const sql = `SELECT o.id, p.productName, p.productDesc, p.basePrice, p.picUrl, oi.amount FROM order_items oi, products p, orders o 
              WHERE oi.product_id = p.id
              AND oi.order_id = o.id
              AND o.restaurant_id = ${escapedRestaurantId}
              AND o.done = 0;`;

  pool.query(sql, (error, results, fields) => {
    if (error) throw error;

    const formattedResults = results.map(item => {
      return {
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

router.post("/place", (req, res) => {
  const restaurantId = req.body.restaurant_id;
  const token = req.body.token;
  const orderData = req.body.orderData;
  if (!restaurantId || !token || !orderData || !isJSON(orderData)) {
    res.status(400).send("restaurant_id, token, and order-data as JSON are required!");
    return;
  }
  const parsedOrderData = JSON.parse(orderData);

  const escapedRestaurantId = sqlstring.escape(restaurantId);
  const escapedToken = sqlstring.escape(token);

  const sql = `SELECT id FROM codes WHERE token = ${escapedToken} AND restaurant_id = ${escapedRestaurantId}`;

  pool.query(sql, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.length < 1) {
      res.status(404).send("Token not found");
      return;
    }

    const { id: codeId } = results[0];
    const currentDate = new Date().toISOString().slice(0, 10);
    const total = parsedOrderData.totalAmount;
    const escapedTotal = sqlstring.escape(total);

    const insertSql = `INSERT INTO orders VALUES (null, ${escapedRestaurantId}, ${codeId}, '${currentDate}', ${escapedTotal}, 0)`;
    pool.query(insertSql, (error, results, fields) => {
      console.log(insertSql);
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
        return;
      }

      const insertedId = results.insertId;
      const basketItems = parsedOrderData.basketItems;
      // Iterate over basketItems and insert order items
      for (const key in basketItems) {
        if (basketItems.hasOwnProperty(key)) {
          const item = basketItems[key];
          // Access individual properties of the item
          const productId = item.id;
          const amount = item.quantity;
          insertOrderItem(insertedId, productId, amount);
        }
      }
      });
  });
});

const insertOrderItem = (orderId, itemId, amount) => {
  const sql = `INSERT INTO order_items (id, order_id, product_id, amount) VALUES (null, ${orderId}, ${itemId}, ${amount})`;

  pool.query(sql, (error, results, fields) => {
    if (error) {
      console.error(error);
      // Handle the error as needed
    }
    
    var data = {
      code: 200,
      message: "OK"
    };
  
    return data;
  });
};

function isJSON(variable) {
  try {
    JSON.parse(variable);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = router;