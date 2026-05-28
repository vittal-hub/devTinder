const express = require("express");
const app = express();
const { connectDB } = require("./config/database");
const User = require("./models/user.js");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const userObj = req.body;
  const user = new User(userObj);
  try {
    await user.save();
    res.send("User added successfully!!");
  } catch (err) {
    res.status(400).send("error in saving the user!" + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("database connection established......");
    app.listen(3000, () => {
      console.log("app is listening on port 3000");
    });
  })
  .catch((err) => {
    console.error("connection with database failed!!!");
  });
