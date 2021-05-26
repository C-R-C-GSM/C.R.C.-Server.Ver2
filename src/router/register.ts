import express, { Request, Response, NextFunction } from "express";
import { connect } from ".";

const register = express.Router();

const mysql = require("mysql")
require('dotenv').config();
const nodemailer = require('nodemailer');

var connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER ,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE
});

connection.connect();

register.get("/", (request: Request, response: Response, next: NextFunction) => {
    console.log('get success');
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
        text:`인증번호는 ${authNum} 입니다`
    };

    await smtpTransport.sendMail(mailOptions, (error:Error, response:Response)=> {
        if(error) {
        console.log('send error');
        console.log(error);
        } else {
        console.log('send success');
        connection.query("UPDATE crcdb.userdata SET authNum = ? WHERE email =?;",[authNum,req.body.email],
        function(err:Error, results:any,fields:any) {
            if(err) {
            res.send("DB CHECK");
            console.log(err);
            } else {
            res.send("이메일을 확인해주세요!");
            }
        }) 
        }
        smtpTransport.close(); 
    });
});

register.post("/email-num-check", (request: Request, response: Response, next: NextFunction) => {
    
    connection.query("SELECT authNum FROM crcdb.userdata WHERE email = ?",[request.body.email],
    function(err:Error, results:any,fields:any) {
        if(err) {
            response.send("DB ERROR");
            console.log(err);
        } else {
            if(request.body.authNum == results[0].authNum) {
                response.json({res:'success'});
            } else {
                response.json({res:'fail'});
            }
        }
    })
});

export = register;