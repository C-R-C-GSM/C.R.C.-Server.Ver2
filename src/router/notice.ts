import express, { Request, Response, NextFunction } from "express";
import request from 'request';
import jwt,{Secret}from "jsonwebtoken";

const notice = express.Router();
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
  console.log('asdf')
  let Token:any = req.get('Token');
  let secretKey:Secret|any =  process.env.JWT_SECRET;
  try {
      let decoded:any =  jwt.verify(Token,secretKey);
      connection.query("SELECT * FROM crcdb.notice", function(err:Error,results:any, fields:any) {
        if(err) {
            res.json({success:false,code:-100, message:'cant connect db'});
        } else {
            res.json({success:true,code:0,message:'notice list check',notice_list:results})
        }
    })
  } catch (err) {
      console.log(err)
      res.json({success:false,code:-401,message:'expired token'});
  }
        
});

notice.post('/register', (req:Request, res:Response) => {
  let Token:any = req.get('Token');
  let secretKey:Secret|any =  process.env.JWT_SECRET;
  try {
      let decoded:any =  jwt.verify(Token,secretKey);
      if(decoded.role == 1) {
        connection.query("SELECT * FROM crcdb.notice", function(err:Error,results:any, fields:any) {
          if(err) {
              res.json({success:false,code:-100, message:'cant connect db'});
          } else {
            let title:string = req.body.title;
            let content:string = req.body.content;
            let today = new Date();
            let time = today.toLocaleString().substring(0,today.toLocaleString().indexOf(' ')-1);
        
            connection.query("INSERT INTO crcdb.notice(notice_title,notice_content,notice_time) VALUES(?,?,?)",[title,content,time],
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
      } else {
        res.json({success:false,code:-600,message:'wrong role'});
      }
  } catch (err) {
      console.log(err)
      res.json({success:false,code:-401,message:'expired token'});
  }
});


export = notice;