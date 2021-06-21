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

let meal_text:string;
let meal_text_split:string[];
let school_meal_arr: string[] = [];

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

index.post("/get_meal",(req:Request, res:Response) => {
  let accesstoken = req.body.accessToken;
  let decoded = jwt.vertify(accesstoken,process.env.JWT_SECRET);

  if(!decoded) {
      res.json({success:false,code:-401,message:'expired token'});
  } else {
    client.fetch("http://gsm.gen.hs.kr/xboard/board.php?tbnum=8", {}, function (err:Error, $:any, res:Response, body:Body) {
      for (let week:number = 2; week <= 6; week++) {
        for (let day:number = 2; day <= 6; day++) {
          meal_text = $(`#xb_fm_list > div.calendar > ul:nth-child(${week}) > li:nth-child(${day}) > div > div.slemailer_food_list`).text();

          meal_text = meal_text.replace(/\t/g,"");
          meal_text = meal_text.replace(/\r/g,"");
          meal_text = meal_text.replace(/\n\n\n\n\n\n\n/g,"day");
          meal_text = meal_text.replace(/\n/g,"");

          meal_text_split = meal_text.split("day");

          school_meal_arr.push(meal_text_split[0]);
          school_meal_arr.push(meal_text_split[1]);
          school_meal_arr.push(meal_text_split[2]);
        }
      }
    });
    res.json({success:true, code:0,message:'post meal data'})
  }
})

index.post('/refresh', (req:Request, res:Response) => {
  
})


export = index;