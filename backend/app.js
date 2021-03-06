const path = require("path");
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");

const app = express();

mongoose.connect("mongodb+srv://testuser:<PASSWORD>@cluster0.opxck.mongodb.net/node-angular?retryWrites=true&w=majority")
  .then(res=>{
      console.log("Connected to Mongo");
    })
  .catch(err=>{
      console.log("Connection to Mongo Failed")
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images"))); //Allows read access to this address. Maps "backend/images" to be just "/images"

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);

module.exports = app;
