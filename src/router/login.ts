import express, { Request, Response, NextFunction } from "express";

const login = express.Router();
const mysql = require("mysql")
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');
require('dotenv').config();

var connection = mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER ,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

connection.connect();


login.post('/', function(req:Request,res: Response,next:NextFunction) {
    let email:string = req.body.email;
    let password = req.body.password;
    let key:number;
    connection.query("SELECT userid FROM crcdb.userdata WHERE email = ?",[email],
    function(err:Error, results:any,fields:any) {
      if(err) {
        res.json({success:false,code:-100,message:'cannot connect db'});
        console.log(err);
      } else {
        if(results[0].userid) {
          key = results[0].userid;
        } else {
          res.json({success:false,code:202,message:'cannot find this email'})
        }
      }
    })
    connection.query("SELECT password,salt FROM crcdb.userdata WHERE email = ?",[email],
    function(err:Error, results:any,fields:any) {
      if(err) {
        res.json({success:false,code:-100,message:'cannot connect db'});
        console.log(err)
      } else {
        let dbpasswd = crypto.pbkdf2Sync(password, results[0].salt, 1, 32, 'sha512').toString('hex')
        if(results[0].password == dbpasswd) {
          const refreshToken = jwt.sign({}, 
          process.env.JWT_SECRET, { 
          expiresIn: '14d',
          issuer: 'C.R.C_SERVER' 
          });
            connection.query("UPDATE crcdb.userdata SET refresh = ? WHERE email =?;",[refreshToken,email],
            function(err:Error, results:any,fields:any) {
              if(err) {
                res.json({success:false,code:-100,message:'cannot connect db'});;
                console.log(err)
              } else {
                try {
                  const accessToken = jwt.sign({ key }, 
                    process.env.JWT_SECRET, { 
                      expiresIn: '1h',
                      issuer: 'C.R.C_SERVER' 
                    });
                    res.json({accessToken:accessToken,success:true,code:0,message:'토큰 발급 및 로그인 성공'})
                } catch (error) {
                  res.json({success:false,code:-400,message:'token error'})
                }
                
              }
            });
            
        } else {
          res.json({success:false,code:-300,message:'wrong password'})
        }
      }
    });
  });


export = login;