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



let notice_list:JSON;
notice.get('/check', (req:Request, res:Response) => {
    let Token = req.get('Token');
    let decoded = jwt.decode(Token,process.env.JWT_SECRET);
    if(!decoded) {
        res.json({success:false,code:-401,message:'expired token'});
    } else {
        connection.query("SELECT * FROM crcdb.notice", function(err:Error,results:any, fields:any) {
            if(err) {
                res.json({success:false,code:-100, message:'cant connect db'});
            } else {
                res.json({success:true,code:0,message:'notice list check',notice_list:results})
            }
        })
    }
});

notice.post('/register', (req:Request, res:Response) => {
  let Token = req.get('Token');
  let decoded = jwt.decode(Token,process.env.JWT_SECRET);
  let data = Object.keys(decoded);
  let key = data[0];
  let roll = data[1]
  if(!decoded) {
    res.json({success:false,code:-401,message:'expired token'});
  } else {
      if(roll == '0') {
        res.json({success:false,code:-600,message:'wrong roll'});
      } else {
          connection.query("SELECT * FROM crcdb.notice", function(err:Error,results:any, fields:any) {
            if(err) {
                res.json({success:false,code:-100, message:'cant connect db'});
            } else {
              let title:string = req.body.title;
              let content:string = req.body.content;
              let today = new Date();
              let time = today.toLocaleString().substring(0,today.toLocaleString().indexOf(' ')-1);
          
              connection.query("INSERT INTO crcdb.notice(title,content,time) VALUES(?,?,?)",[title,content,time],
              function(err:Error, results:any,fields:any ) {
                  if(err) {
                      res.json({success:false,code:-100,message:'cannot connect db'});
                      console.log(err)
                  } else {
                  res.json({success:true,code:0,message:'notice register'})
                  }
              });
            }
        });
      }
    }
});


export = notice;