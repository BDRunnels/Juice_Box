require("dotenv").config();
const PORT = 3000;
const express = require('express');
const morgan = require("morgan");
const server = express();
const apiRouter = require("./api");
const { client } = require('./db');

// console.log(process.env.JWT_SECRET);


server.use(morgan("dev"));
server.use(express.json());
server.use("/api", apiRouter);

server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
  });



client.connect(); // this connects client to DB's. 

server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});