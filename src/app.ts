import express, { Request, Response, NextFunction } from "express";
import methodOverride from 'method-override'

import index from "./router/index"
import login from "./router/login"
import register from "./router/register"
import review from "./router/review"
import suggest from "./router/suggest"

import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from './swagger.json'

const app = express();
const hostname = "10.120.75.224";

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
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

app.use('/',index);
app.use('/login',login);
app.use('/register',register);
app.use('/review',review);
app.use('/suggest',suggest)

app.use('/swagger',swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000,hostname, () => {
  console.log("start");
});