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

/*
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
  //console.log(school_meal_arr);
});
*/
let student:number = 0;
index.get("/", (request: Request, response: Response, next: NextFunction) => {
  response.json({student:student});
});



//라파 post용
index.post('/Main', (req:Request, res:Response) => {
  let student_num = req.body;
  console.log(student_num);
});

//#region post 
/*
  student = request.body.counter;
  console.log(request.body.counter);
  console.log('post success');
    나중에 쓸 쿼리문 1. 학생의 번호를 가져오는 쿼리문 2. 학생의 체크를 모두 가져오는 것
  connection.query("SELECT students FROM student", function(error, results, fields) {
    console.log(results[0].number);
    res.send(results[0].number);
  });
  connection.query("SELECT students FROM student", function(error, results, fields) {
    console.log(results[0].check);
  });
  */
//  connection.query("INSERT INTO students(check) VALUE('"+true+"'", function(error, results, fields) {
//    if(error) {
//      console.log(error);
//    }
//  }); 
//#endregion



export = index;