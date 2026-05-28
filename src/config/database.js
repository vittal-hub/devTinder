const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://darpalvittalprasad_db_user:GdDaUjACPD3KCGvW@devtinder.bja0xbl.mongodb.net/?appName=devTinder",
  );
};

module.exports = { connectDB };
