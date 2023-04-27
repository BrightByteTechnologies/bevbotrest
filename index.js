const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Set the current working directory to the directory containing index.js
process.chdir(path.dirname(process.argv[1]));

// Load environment variables from .env file
dotenv.config();
const app = express();

const routeApiKeys = {
  '/management': process.env.WEBSITE_KEY,
  '/software': process.env.WEBSITE_KEY,
  '/hardware': process.env.WEBSITE_KEY,
  '/tables': process.env.RESTAURANT_KEY,
  '/tables/reserve': process.env.RESTAURANT_RESERVING_KEY,
  '/qrcodes': process.env.QR_KEY,
  '/qrcodes/register': process.env.QR_REGISTRATION_KEY,
  // add more routes and API keys here as needed
};

// Use the body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Define a middleware that checks the API key in the request header
const checkApiKey = (req, res, next) => {
  const apiKey = routeApiKeys[req.path];
  // If the API key is missing or doesn't match the key, send a 401 Unauthorized response
  if (!apiKey || apiKey !== req.headers['api-key']) {
    res.status(401).send('Unauthorized');
  } else {
    // If the API key is valid, call the next middleware or route handler
    next();
  }
};


// Use the checkApiKey middleware for all routes
app.use(checkApiKey);

// Router for website
const managementRouter = require("./routes/Teams/management");
const softwareRouter = require("./routes/Teams/software");
const hardwareRouter = require("./routes/Teams/hardware");
const timelineRouter = require("./routes/timeline");

// Router for restaurant
const tablesRouter = require("./routes/restaurant/tables");
const qrCodesRouter = require("./routes/restaurant/qrCodes");
const productRouter = require("./routes/restaurant/products");

app.use("/management", managementRouter);
app.use("/software", softwareRouter);
app.use("/hardware", hardwareRouter);
app.use("/timeline", timelineRouter);

// Routes for restaurant
app.use("/tables", tablesRouter);
app.use("/qrcodes", qrCodesRouter);

const port = 3000
app.listen(port, () => {
  console.log("Server started!");
});
