import express, { Request, Response, NextFunction } from "express";

const index = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

let student:number = 0;

index.get("/", (request: Request, response: Response, next: NextFunction) => {
  console.log('get success');
  response.json({student:student});
});

index.post('/', function(req:Request,res: Response,next:NextFunction) {
  let email:string = req.body.email;
  let password = req.body.password;
  connection.query("SELECT password,salt FROM crcdb.userdata WHERE email = ?",[email],
  function(err:Error, results:any,fields:any) {
    if(err) {
      res.send("DB ERROR");
      console.log(err)
    } else {
      console.log(results[0])
      let dbpasswd = crypto.pbkdf2Sync(password, results[0].salt, 1, 32, 'sha512').toString('hex')
      console.log(results[0].password);
      console.log(dbpasswd);
      if(results[0].password == dbpasswd) {
        const refreshToken = jwt.sign({}, 
        process.env.JWT_SECRET, { 
        expiresIn: '14d',
        issuer: 'C.R.C_SERVER' 
        });
          connection.query("UPDATE crcdb.userdata SET refresh = ? WHERE email =?;",[refreshToken,email],
          function(err:Error, results:any,fields:any) {
            if(err) {
              res.send("DATA UPDATE QUERY ERROR");
              console.log(err)
            } else {
              try {
                const accessToken = jwt.sign({ email, password }, 
                  process.env.JWT_SECRET, { 
                    expiresIn: '1h',
                    issuer: 'C.R.C_SERVER' 
                  });
                  res.cookie('accessToken', accessToken);
                  res.cookie('refreshToken', refreshToken);
              } catch (error) {
                res.send("JWT ERROR!")
              }
              res.send("LOGIN SUCCESS")
            }
          });
          
      } else {
        res.send("Wrong Password")
      }
    }
  });
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

index.post('/mail', async(req:Request, res:Response) => {
  let authNum = Math.random().toString().substr(2,6);

  const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from:process.env.NODEMAILER_USER,
    to:req.body.email,
    subject:"회원가입 E-Mail인증번호",
    text:`인증번호는 ${authNum} 입니다`
  };

  await smtpTransport.sendMail(mailOptions, (error:Error, response:Response)=> {
    if(error) {
      console.log('send error');
      console.log(error);
    } else {
      console.log('send success');
    }
    smtpTransport.close(); 
  });
  //authNum입력 후 확인방법 생각하기
  if(req.body.authNum == authNum) {
    res.send("SUCCESS")
  }
});

export = index;