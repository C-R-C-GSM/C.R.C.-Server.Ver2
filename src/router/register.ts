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
    let accesstoken = request.headers.accessToken;
    let refreshtoken = request.headers.refreshToken;
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
        response.json({success:false,code:-401,message:'expired token'});
    } else {
        response.json({success:true,code:0,message:'token check success'});
        console.log('토큰 아직 있네요');
    }
});

register.post('/', async(req:Request, res:Response) => {
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
                    response.send("인증번호 맞네요!").json({success:true,code:0,message:'correct authNum'});
                } else {
                    response.send("인증번호 맞지 않네유!").json({success:false,code:-500,message:'Wrong authNum'});
                }
            }
            
    });
});


export = register;