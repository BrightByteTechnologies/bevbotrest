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