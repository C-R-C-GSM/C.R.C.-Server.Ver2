import express, { Request, Response, NextFunction } from "express";
import methodOverride from 'method-override'
import cors from 'cors'

import indexRouter from "./router/index"
import loginRouter from "./router/login"
import registerRouter from "./router/register"
import reviewRouter from "./router/review"
import suggestRouter from "./router/suggest"
import checkRouter from './router/check'
import noticeRouter from './router/notice'

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

app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use((cors()));

app.use('/',indexRouter);
app.use('/login',loginRouter);
app.use('/register',registerRouter);
app.use('/review',reviewRouter);
app.use('/suggest',suggestRouter);
app.use('/check',checkRouter);
app.use('/notice',noticeRouter)

app.use('/swagger',swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000,hostname, () => {
  console.log("start");
});