import express, { Request, Response, NextFunction } from "express";
import request from 'request';

const index = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


var client = require('cheerio-httpcli');

const mysql = require("mysql")
require('dotenv').config();

var connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER ,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE
});

connection.connect();



let student:number = 0;
index.post("/", (request: Request, response: Response, next: NextFunction) => {
  let accesstoken = request.body.accessToken;
  let decoded = jwt.vertify(accesstoken,process.env.JWT_SECRET);

  if(!decoded) {
      response.json({success:false,code:-401,message:'expired token'});
  } else {
    response.json({success:true, code:0, message:'get meal data',student:student});
  }
});



index.post('/refresh', (req:Request, res:Response) => {
  
})


export = index;