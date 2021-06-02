import express, { Request, Response, NextFunction } from "express";

const login = express.Router();
const mysql = require("mysql")
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

var connection = mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER ,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

connection.connect();

login.get("/", (request: Request, response: Response, next: NextFunction) => {
    console.log('get success');
});


login.post("/", (req: Request, res: Response, next: NextFunction) => {
    console.log('login post')
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
            res.send('Email Select Error. Check DB').json({success:false});
          } else {
              if(results[0]) {
                  res.send("This Email already used.").json({success:false});
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
                    res.json({success:false})
                    console.log(error);
                    } else {
                    console.log('send success');
                    connection.query("INSERT INTO crcdb.userdata(email,password,name,salt,student_data,authNum) VALUES(?,?,?,?,?,?)",
                    [email,hashedPasswd,name,salt,student_data,authNum],
                    function(err:Error, results:any,fields:any ) {
                        if(err) {
                            res.send('User Data insert Error').json({success:false});
                            console.log(err)
                        } else {
                          
                          res.send("회원가입 성공했습니다. 해당 이메일을 확인해주세요").json({success:true})
                        }
                    });
                    }
                    smtpTransport.close();
                });
              }
          }
      });
});

export = login;