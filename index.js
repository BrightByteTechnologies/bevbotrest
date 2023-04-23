const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Set the current working directory to the directory containing index.js
process.chdir(path.dirname(process.argv[1]));

// Load environment variables from .env file
dotenv.config();
const app = express();

const API_KEY = process.env.API_KEY;
// Use the body-parser middleware to parse JSON requests
app.use(bodyParser.json());


// Define a middleware that checks the API key in the request header
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['api-key'];

  // If the API key is missing or doesn't match the key, send a 401 Unauthorized response
  if (!apiKey || apiKey !== API_KEY) { // Use the API key from environment variable
    res.status(401).send('Unauthorized');
  } else {
    // If the API key is valid, call the next middleware or route handler
    next();
  }
};

// Use the checkApiKey middleware for all routes
app.use(checkApiKey);

const companyRouter = require("./routes/company");;
const managementRouter = require("./routes/Teams/management");
const softwareRouter = require("./routes/Teams/software");
const hardwareRouter = require("./routes/Teams/hardware");
const timelineRouter = require("./routes/timeline");
const productRouter = require("./routes/products");

app.use("/company", companyRouter);
app.use("/management", managementRouter);
app.use("/software", softwareRouter);
app.use("/hardware", hardwareRouter);
app.use("/timeline", timelineRouter);

const port = 3000
app.listen(port, () => {
  console.log("Server started!");
});
