const express = require('express');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = req.body;
  res.status(201).json({message: "post added"});
});

app.use('/api/posts', (req, res, next) => {
  const posts = [
    { id: '1', title: 'Server Works', content: 'congrats. The server works.'},
    { id: '2', title: 'Server Works Still', content: 'congrats. The server still works.'}
  ];
  res.status(200).json({message: 'posts retrieved successfully', data: posts});
});

module.exports = app;
