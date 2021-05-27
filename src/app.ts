import express, { Request, Response, NextFunction } from "express";
import index from "./router/index"
import login from "./router/login"
import register from "./router/register"

const app = express();

require('dotenv').config();

const mysql = require("mysql");
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER ,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

connection.connect();
/*
const socketapp = require('express'); 
const http = require('http').Server(socketapp); 
const io = require('socket.io')(http);
const room = io.of('/test');

http.listen(9000, function () { console.log('Listening on *:9000'); });
*/
app.use(bodyParser.urlencoded({extended: false}))
app.use('/',index);
app.use('/login',login);
app.use('/register',register)

app.listen(3000, () => {
  console.log("start");
});