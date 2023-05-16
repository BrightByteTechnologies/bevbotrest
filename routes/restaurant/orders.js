const { json } = require("body-parser");
const express = require("express");
const removeUploadedFiles = require("multer/lib/remove-uploaded-files");
const mysql = require('mysql');
const sqlstring = require('sqlstring');

const router = express.Router();
const pool = mysql.createPool({
  host: "localhost",
  user: "restaurantadmin",
  password: "bbt2_restaurants_admin",
  database: "restaurant",
});

// Handle GET request to the root endpoint
router.get("/", (req, res) => {
  // Retrieve the restaurant ID from the request query parameters
  const restaurantId = req.query.restaurant_id;

  // Check if the restaurant ID is provided
  if (!restaurantId) {
    res.status(400).send("restaurant_id is required");
    return;
  }

  // Escape the restaurant ID to prevent SQL injection
  const escapedRestaurantId = sqlstring.escape(restaurantId);

  // SQL query to fetch order information for the specified restaurant
  const sql = `SELECT o.id, o.done, p.productName, p.productDesc, p.basePrice, p.picUrl, oi.amount, t.amount as taxAmount, ta.tableNo c.tableNo 
              FROM order_items oi, products p, orders o, taxes t, tables ta, codes c 
              WHERE oi.product_id = p.id
              AND oi.order_id = o.id
              AND o.restaurant_id = ${escapedRestaurantId}
              AND t.id = p.taxID
              AND ta.tableNo = c.tableNo`;

  // Execute the SQL query
  pool.query(sql, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Format the query results
    const formattedResults = results.map(item => {
      return {
        name: item.productName,
        description: item.productDesc,
        price: item.basePrice * item.taxAmount,
        amount: item.amount,
        url: item.picUrl,
        done: item.done
      }
    });

    // Send the formatted results as JSON response
    res.json(formattedResults);
  });
});

// Handle POST request to the "/place" endpoint
router.post("/place", (req, res) => {
  // Retrieve the restaurant ID, token, and order data from the request body
  const restaurantId = req.body.restaurant_id;
  const token = req.body.token;
  const orderData = req.body.orderData;

  // Check if the required fields are provided and valid
  if (!restaurantId || !token || !orderData || !isJSON(orderData)) {
    res.status(400).send("restaurant_id, token, and order-data as JSON are required!");
    return;
  }

  // Parse the order data from JSON string to object
  const parsedOrderData = JSON.parse(orderData);

  // Escape the restaurant ID and token to prevent SQL injection
  const escapedRestaurantId = sqlstring.escape(restaurantId);
  const escapedToken = sqlstring.escape(token);

  // SQL query to check if the token exists and retrieve code ID and table number
  const sql = `SELECT id, tableNo FROM codes WHERE token = ${escapedToken} AND restaurant_id = ${escapedRestaurantId}`;

  // Execute the SQL query
  pool.query(sql, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Check if the token is found
    if (results.length < 1) {
      res.status(404).send("Token not found");
      return;
    }

    // Retrieve the code ID and table number from the query results
    const codeId = results[0].id;
    const tableNo = results[0].tableNo;

    // Extract the basket items from the parsed order data
    const basketItems = parsedOrderData.basketItems;
    const orderItems = Object.entries(basketItems);

    let currentOrderItems = [];
    let currentOrderQuantity = 0;
    let currentOrderTotal = 0;

    // Iterate over order items and create separate orders
    orderItems.forEach(([key, item]) => {
      const productId = item.id;
      const quantity = item.quantity;

      if (currentOrderQuantity + quantity <= 5) {
        currentOrderItems.push({ productId, quantity });
        currentOrderQuantity += quantity;
        currentOrderTotal += item.price * quantity; // Assuming each item has a 'price' property
      } else {
        const remainingQuantity = 5 - currentOrderQuantity;
        currentOrderItems.push({ productId, quantity: remainingQuantity });
        currentOrderQuantity += remainingQuantity;
        currentOrderTotal += item.price * remainingQuantity; // Assuming each item has a 'price' property

        // Create an order with the current items
        createOrder(currentOrderItems, escapedRestaurantId, codeId, tableNo, currentOrderTotal);

        // Reset the current order variables
        currentOrderItems = [];
        currentOrderQuantity = 0;
        currentOrderTotal = 0;

        const remainingItems = quantity - remainingQuantity;
        for (let i = 0; i < Math.floor(remainingItems / 5); i++) {
          currentOrderItems = [{ productId, quantity: 5 }];
          currentOrderQuantity = 5;
          currentOrderTotal = item.price * 5; // Assuming each item has a 'price' property

          // Create an order with the current items
          createOrder(currentOrderItems, escapedRestaurantId, codeId, tableNo, currentOrderTotal);
        }

        const remainingItemsMod = remainingItems % 5;
        if (remainingItemsMod > 0) {
          currentOrderItems = [{ productId, quantity: remainingItemsMod }];
          currentOrderQuantity = remainingItemsMod;
          currentOrderTotal = item.price * remainingItemsMod; // Assuming each item has a 'price' property
        }
      }
    });

    // Create an order with the remaining items if any
    if (currentOrderQuantity > 0) {
      createOrder(currentOrderItems, escapedRestaurantId, codeId, tableNo, currentOrderTotal);
    }

    // Send a success response
    res.status(200).send("OK");
  });
});

// Handle GET request to the "/unfinished" endpoint
router.get("/unfinished", async (req, res) => {
  const restaurantId = req.query.restaurant_id;

  if (!restaurantId) {
    res.status(400).send("restaurant_id is required");
    return;
  }

  try {
    const response = await getUnfinishedOrders(restaurantId);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send(response.message);
    }
  } catch (error) {
    res.status(error.status).send(error.message);
  }
});

// Function to create a new order with the given items
function createOrder(items, restaurantId, codeId, tableNo, total) {
  // Get the current date in ISO format
  const currentDate = new Date().toISOString().slice(0, 10);
  const escapedTotal = sqlstring.escape(total);

  // SQL query to insert a new order into the database
  const insertSql = `INSERT INTO orders VALUES (null, ${restaurantId}, ${codeId}, '${tableNo}', '${currentDate}', ${escapedTotal}, 0)`;

  // Execute the SQL query
  pool.query(insertSql, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Get the ID of the inserted order
    const insertedId = results.insertId;

    // Insert individual order items
    items.forEach(({ productId, quantity }) => {
      if (quantity > 0) {
        insertOrderItem(insertedId, productId, quantity);
      }
    });

  });
}

router.post("/finish", (req, res) => {
  const restaurantId = req.body.restaurant_id;
  const orderID = req.body.order_id;
  
  if(!restaurantId || !orderID) {
    res.status(400).send("restaurant_id and order_id are required!");
  }

  const escapedRestaurantId = sqlstring.escape(restaurantId);
  const escapedOrderID = sqlstring.escape(orderID);

  const sql = `UPDATE orders SET done = 1 WHERE id = ${escapedOrderID} AND restaurant_id = ${escapedRestaurantId}`;
  pool.query(sql, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send("OK");
  });
});

const getUnfinishedOrders = (restaurant_id) => {
  return new Promise((resolve, reject) => {
    const escapedRestaurantId = sqlstring.escape(restaurant_id);
    const sql = `SELECT o.id, o.tableNo, o.date, o.total, p.productName, p.productDesc, p.basePrice, oi.amount, p.picUrl, t.amount as taxAmount 
                FROM order_items oi, products p, orders o, taxes t 
                WHERE oi.product_id = p.id
                AND oi.order_id = o.id
                AND o.restaurant_id = ${escapedRestaurantId}
                AND o.done = 0
                AND t.id = p.taxID`;

    pool.query(sql, (error, results, fields) => {
      if (error) {
        console.error(error);
        const data = {
          status: 500,
          message: 'Internal Server Error'
        };
        reject(data);
      }

      const formattedResults = results.map(item => {
        return {
          orderId: item.id,
          date: item.date,
          total: item.total,
          tableNo: item.tableNo,
          name: item.productName,
          description: item.productDesc,
          price: item.basePrice * item.taxAmount,
          amount: item.amount,
          url: item.picUrl
        };
      });

      const data = {
        status: 200,
        message: 'OK',
        data: formattedResults
      };

      resolve(data);
    });
  });
};

// Function to insert an order item into the database
const insertOrderItem = (orderId, itemId, amount) => {
  const sql = `INSERT INTO order_items (id, order_id, product_id, amount) VALUES(null, ${orderId}, ${itemId}, ${amount})`;

  // Execute the SQL query
  pool.query(sql, (error, results, fields) => {
    if (error) {
      console.error(error);
      // Handle the error as needed
    }
  });
};

// Function to check if a string is valid JSON
function isJSON(variable) {
  try {
    JSON.parse(variable);
    return true;
  } catch (error) {
    return false;
  }
}

// Pass the function as a parameter when exporting the router
module.exports = router;