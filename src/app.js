const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("on home page");
});
app.listen(3000, () => {
  console.log("app is listening on port 3000");
});
