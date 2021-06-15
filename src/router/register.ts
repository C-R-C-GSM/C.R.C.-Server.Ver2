import express, { Request, Response, NextFunction } from "express";
import { connect } from ".";

const register = express.Router();

const mysql = require("mysql")
require('dotenv').config();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

var connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER ,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE
});

connection.connect();


register.post("/", (req: Request, res: Response, next: NextFunction) => {
    console.log('register')
    let email:string = req.body.email;
    let password:string = req.body.password;
    let name:string = req.body.name;
    let student_data:string = req.body.student_data;
    let salt:any;
    let hashedPasswd:string;

    async function hash() {
        salt = await crypto.randomBytes(32).toString()
        hashedPasswd = await crypto.pbkdf2Sync(password, salt, 1, 32, 'sha512').toString('hex');
    }

    hash();
      connection.query("SELECT email FROM crcdb.userdata WHERE email = ?",[email],
      async function(err:Error, results:any,fields:any) {
          if(err) {
            res.json({success:false,code:-100,message:'cannot connect db'}); //DB error
          } else {
              if(results[0]) {
                  res.json({success:false,code:-200,message:'email already existed'}); //email existed
              } else {
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
                    res.json({success:false,code:-201,message:'invalid email address'})   //email send error
                    console.log(error);
                    } else {
                    console.log('send success');
                    connection.query("INSERT INTO crcdb.userdata(email,password,name,salt,student_data,authNum) VALUES(?,?,?,?,?,?)",
                    [email,hashedPasswd,name,salt,student_data,authNum],
                    function(err:Error, results:any,fields:any ) {
                        if(err) {
                            res.json({success:false,code:-100,message:'cannot connect db'});
                            console.log(err)
                        } else {
                          
                          res.json({success:true,code:0,message:'register sucess'})
                        }
                    });
                    }
                    smtpTransport.close();
                });
              }
          }
      });
});

register.get("/:authNum", (request: Request, response: Response, next: NextFunction) => {
    let authNum = request.query.authNum;
    let email = request.query.email;
    console.log(authNum,email);
    connection.query("SELECT authNum FROM crcdb.userdata WHERE email = ?",[email],
    function(err:Error, results:any,fields:any) {
        if(err) {
            console.log(err);
            response.json({success:false,code:-100,message:'cannot connect db'});;
        } else {
            console.log(results);
                if(results[0].authNum == authNum) {
                    connection.query("UPDATE crcdb.userdata SET auth = ? WHERE email = ?",[1,email],
                    function(err:Error, results:any,fields:any) {
                        if(err) {
                            console.log(err);
                            response.json({success:false,code:-100,message:'cannot connect db'});
                        }
                    });
                    response.json({success:true,code:0,message:'correct authNum'});
                } else {
                    response.json({success:false,code:-500,message:'Wrong authNum'});
                }
            }
            
    });
});


export = register;