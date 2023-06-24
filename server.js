require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

app.use(bodyParser.json());

connectDB()

//routes
app.use('/api/users', require('./routes/api/users'))

//API to check connection
app.get("/", (req, res) => {
  res.json({ message: "Welcome to our app" });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

