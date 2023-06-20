require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemon = require("nodemon");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());

const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => console.log("Connected!"));

mongoose.connection.on("connected", function () {
  console.log("Mongoose default connection open");
});

//If the connection throws an error
mongoose.connection.on("error", function (err) {
  console.log("Mongoose default connection error");
});

const userSchema = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    email: String,
    password: String,
    age: Number
  },
  {
    timestamps: true
  }
)

const User = mongoose.model("User", userSchema);

//API to check connection
app.get("/", (req, res) => {
  res.json({ message: "Welcome to our app" });
});

//API to create user
app.post("/users", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(req.body.password, salt)
    const password = hash
    const userObj = {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      age: req.body.age,
      password: password
    }
    const user = new User(userObj)
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const {email, password} = req.body
    const user = await User.findOne({email: email})
    //Checking if user email is valid
    if(!user){
      res.status(401).json({ message: "User not found" });
    }else{
      //Checking if user password is valid
      const isValidPassword = await bcrypt.compare(password, user.password)
      if(!isValidPassword){
        res.status(401).json({ message: "Wrong Password!" });
      }else{
        res.status(200).json(user);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
})

//API to get users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

//API to get users by id
app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

//API to edit user info
app.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

//API to delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
