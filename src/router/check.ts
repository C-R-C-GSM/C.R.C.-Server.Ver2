import express, { Request, Response, NextFunction } from "express";
import request from 'request';
import jwt,{Secret} from "jsonwebtoken";

const check = express.Router();
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
let oneData:JSON;
let twoData:JSON;
let threeData:JSON;

check.post('/come_student', (req:Request, res:Response) => {
    total_num +=1;
    student_id = req.body.student_num;
    console.log(student_id);
    res.json({Done:"Done"});
    if(student_id.substring(0,1) == "1") {
        connection.query("UPDATE crcdb.student1 SET student_check = ? WHERE certify = ?",[1,student_id],
        function(err:Error,results:any, fields:any) {
            if(err) console.log(err)
            else {
                console.log('삐빅 1번!')
            }
        });
    } else if(student_id.substring(0,1) == "2") {
        connection.query("UPDATE crcdb.student2 SET student_check = ? WHERE certify = ?",[1,student_id],
        function(err:Error,results:any, fields:any) {
            if(err) console.log(err)
            else {
                console.log('삐빅 2번!')
            }
        });
    } else {
        connection.query("UPDATE crcdb.student3 SET student_check = ? WHERE certify = ?",[1,student_id],
        function(err:Error,results:any, fields:any) {
            if(err) console.log(err)
            else {
                console.log('삐빅 3번!')
            }
        });
    }
});

check.get('/reset_student', (req:Request, res:Response) => { //서버 킬때마다 초기화 시키게 만들 예정
    let Token:any = req.get('Token');
    let secretKey:Secret|any =  process.env.JWT_SECRET;
    try {
        let decoded:any =  jwt.verify(Token,secretKey);
        if(decoded.role == 1) {
            connection.query("UPDATE crcdb.student3 SET student_check = 0",
            function(err:Error,results:any, fields:any) {
                if(err) res.json({success:false,code:-100,message:'cannot connect db'});
                else {
                    connection.query("UPDATE crcdb.student2 SET student_check = 0",
                    function(err:Error,results:any, fields:any) {
                        if(err) res.json({success:false,code:-100,message:'cannot connect db'});
                        else {
                            connection.query("UPDATE crcdb.student1 SET student_check = 0",
                            function(err:Error,results:any, fields:any) {
                                if(err) res.json({success:false,code:-100,message:'cannot connect db'});
                                else {
                                    res.json({success:true,code:0,message:'reset successs'});
                                }
                            });
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
})
  

check.get('/total', (req:Request, res:Response) => {
    let Token:any = req.get('Token');
    let secretKey:Secret|any =  process.env.JWT_SECRET;
    try {
        let decoded:any =  jwt.verify(Token,secretKey);
    } catch (err) {
        console.log(err)
        res.json({success:false,code:-401,message:'expired token'});
    }
    res.json({success:true, code:0,message:'total_data_send',total_num:total_num})
});

check.get('/one', (req:Request, res:Response) => {
    let Token:any = req.get('Token');
    let secretKey:Secret|any =  process.env.JWT_SECRET;
    try {
        let decoded:any =  jwt.verify(Token,secretKey);
        connection.query("SELECT student_data,student_name,student_check FROM crcdb.student1",
        function(err:Error,results:any, fields:any) {
            if(err) res.json({success:false,code:-100,message:'cannot connect db'});
            else {
                res.json({success:true, code:0, message:'check success',data:results})
            }
        });
    } catch (err) {
        console.log(err)
        res.json({success:false,code:-401,message:'expired token'});
    }


});

check.get('/two', (req:Request, res:Response) => {
    let Token:any = req.get('Token');
    let secretKey:Secret|any =  process.env.JWT_SECRET;
    try {
        let decoded:any =  jwt.verify(Token,secretKey);
        connection.query("SELECT student_data,student_name,student_check FROM crcdb.student2",
    function(err:Error,results:any, fields:any) {
        if(err) res.json({success:false,code:-100,message:'cannot connect db'});
        else {
            res.json({success:true, code:0, message:'check success',data:results})
        }
    });
    } catch (err) {
        console.log(err)
        res.json({success:false,code:-401,message:'expired token'});
    }
    

});

check.get('/three', (req:Request, res:Response) => {
    let Token:any = req.get('Token');
    let secretKey:Secret|any =  process.env.JWT_SECRET;
    try {
        let decoded:any =  jwt.verify(Token,secretKey);
        connection.query("SELECT student_data,student_name,student_check FROM crcdb.student3",
    function(err:Error,results:any, fields:any) {
        if(err) res.json({success:false,code:-100,message:'cannot connect db'});
        else {
            res.json({success:true, code:0, message:'check success',data:results})
        }
    });
    } catch (err) {
        console.log(err)
        res.json({success:false,code:-401,message:'expired token'});
    }
    

});


export = check;