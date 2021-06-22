import express, { Request, Response, NextFunction } from "express";
import request from 'request';

const notice = express.Router();
const jwt = require('jsonwebtoken');
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
let meal_data:JSON;

let notice_list:JSON;
notice.get('/check', (req:Request, res:Response) => {
    connection.query("SELECT * FROM crcdb.notice", function(err:Error,results:any, fields:any) {
        if(err) {
            res.json({success:false,code:-100, message:'cant connect db'});
        } else {
            res.json({success:true,code:0,message:'notice list check',notice_list:results})
        }
    })
});

notice.post('/register', (req:Request, res:Response) => {
    let title:string = req.body.title;
    let content:string = req.body.content;
    let today = new Date();
    let time = today.toLocaleString().substring(0,today.toLocaleString().indexOf('├')-1);

    connection.query("INSERT INTO crcdb.notice(title,content,time) VALUES(?,?,?)",[title,content,time],
    function(err:Error, results:any,fields:any ) {
        if(err) {
            res.json({success:false,code:-100,message:'cannot connect db'});
            console.log(err)
        } else {
        
        res.json({success:true,code:0,message:'notice register'})
        }
    });
});

notice.get("/get_meal",(req:Request, res:Response) => {
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
      res.json({success:true, code:0,message:'post meal data',meal_data:school_meal_arr})
    }
  })

export = notice;