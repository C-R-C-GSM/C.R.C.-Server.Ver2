import express, { Request, Response, NextFunction } from "express";
import request from 'request';

const check = express.Router();
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

let total_num:number = 0;
let student_id:string;
check.post('/come_student', (req:Request, res:Response) => {
    total_num +=1;
    student_id = req.body.student_id;

    if(student_id.substring(0,1) == "1") {
        connection.query("UPDATE crcdb.1student SET check1 = ? WHERE certify1 = ?",[1,student_id],
        function(err:Error,results:any, fields:any) {
            if(err) console.log(err)
            else {
                console.log('success to change')
            }
        });
    } else if(student_id.substring(0,1) == "2") {
        connection.query("UPDATE crcdb.2student SET check2 = ? WHERE certify2 = ?",[1,student_id],
        function(err:Error,results:any, fields:any) {
            if(err) console.log(err)
            else {
                console.log('success to change')
            }
        });
    } else {
        connection.query("UPDATE crcdb.3student SET check3 = ? WHERE certify3 = ?",[1,student_id],
        function(err:Error,results:any, fields:any) {
            if(err) console.log(err)
            else {
                console.log('success to change')
            }
        });
    }
});


  

check.post('/total', (req:Request, res:Response) => {
    res.json({success:true, code:0,message:'total_data_send',total_num:total_num})
});

check.get('/one', (req:Request, res:Response) => {
  connection.query("SELECT * FROM crcdb.1student",
  function(err:Error,results:any, fields:any) {
      if(err) res.json({success:false,code:-100,message:'cannot connect db'});
      else {
          res.json({success:true, code:0, message:'check success'})
      }
  });
});

check.get('/two', (req:Request, res:Response) => {
    connection.query("SELECT * FROM crcdb.2student",
    function(err:Error,results:any, fields:any) {
        if(err) res.json({success:false,code:-100,message:'cannot connect db'});
        else {
            res.json({success:true, code:0, message:'check success'})
        }
    });
});

check.get('/three', (req:Request, res:Response) => {
    connection.query("SELECT * FROM crcdb.3student",
    function(err:Error,results:any, fields:any) {
        if(err) res.json({success:false,code:-100,message:'cannot connect db'});
        else {
            res.json({success:true, code:0, message:'check success'})
        }
    });
});


export = check;