const express = require("express");
const Table = require("../models/table.model");

const router = express.Router();

router.get("/", async (req, res) => {
  const tables = await Table.find().sort({ number: 1 });
  res.json(tables);
});

module.exports = router;
