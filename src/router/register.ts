import express, { Request, Response, NextFunction } from "express";
import { connect } from ".";

const register = express.Router();

const mysql = require("mysql")
require('dotenv').config();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

var connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER ,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE
});

connection.connect();

register.get("/", (request: Request, response: Response, next: NextFunction) => {
    let accesstoken = request.cookies.accessToken;
    let refreshtoken = request.cookies.refreshToken;
    /*
    connection.query("SELECT userid FROM crcdb.userdata WHERE email = ?",[email],
    function(err:Error, results:any,fields:any) {
      if(err) {
        response.send("DB ERROR");
        console.log(err);
      } else {
        key = results[0].userid;
      }
    });
    */
    let decoded = jwt.vertify(accesstoken,process.env.JWT_SECRET);
    if(!decoded) {
        response.send("토큰이 만료되었습니다!");
    } else {
        console.log('get success');
    }
});

register.post('/', async(req:Request, res:Response) => {
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
        text:`http://10.120.75.224:3000/register/email-num-check?authNum=${authNum}&email=${req.body.email}`
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
    connection.query("INSERT INTO crcdb.userdata(authNum) VALUES(?)",[authNum],
    function(err:Error, results:any,fields:any) {
        if(err) {
            res.send("DB ERROR");
            console.log(err);
        }
    })
});

register.get("/:authNum", (request: Request, response: Response, next: NextFunction) => {
    let authNum = request.query.authNum;
    let email = request.query.email;
    console.log(authNum,email);
    connection.query("SELECT authNum FROM crcdb.userdata WHERE email = ?",[email],
    function(err:Error, results:any,fields:any) {
        if(err) {
            console.log(err);
            response.send("DB ERROR");
        } else {
            console.log(results);
            if(!results[0].authNum || !results[0].email) {
                response.send("잘못된 요청입니다.")
            } else {
                if(results[0].authNum == authNum) {
                    connection.query("UPDATE crcdb.userdata SET auth = ? WHERE email = ?",[1,email],
                    function(err:Error, results:any,fields:any) {
                        if(err) {
                            console.log(err);
                            response.send("DB ERROR")
                        }
                    });
                    response.send("인증번호 맞네요!");
                } else {
                    response.send("인증번호 맞지 않네유!");
                }
            }
            
        }
    });
});


export = register;