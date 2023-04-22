const express = require("express");

const router = express.Router();

router.get('/', async (req, res) => {
    const images = [
      { name: 'bb-logo', url: 'https://cdn.row-hosting.de/BBT/Company/bb-logo.png'},
      { name: 'bb-logo-removedbg', url: 'https://cdn.row-hosting.de/BBT/Company/bb-logo-removedbg.png'},
    ]
    res.json({images})
});

module.exports = router;