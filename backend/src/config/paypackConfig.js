require("dotenv").config();
const PaypackJs = require("paypack-js").default;

const paypack = new PaypackJs({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

module.exports = paypack;
