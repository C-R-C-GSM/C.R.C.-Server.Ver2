import express, { Request, Response, NextFunction } from "express";
import { connected } from "process";
import request from "request";

const review = express.Router();

const mysql = require('mysql');
require('dotenv').config();
const jwt = require('jsonwebtoken');

var connection = mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER ,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

connection.connect();
let reviewdata_value:JSON;

review.get('/check',(request:Request, res:Response, next:NextFunction) => {
    console.log('post');
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
   let Token = request.get('Token')
    let decoded = jwt.vertify(Token,process.env.JWT_SECRET);
    
    if(!decoded) {
        res.json({success:false,code:-401,message:'expired token'});
    } else {
        connection.query("SELECT * FROM crcdb.reviewdata",
        async function(err:Error,results:any,fields:any) {
            reviewdata_value = await results;
        })
        res.json({success:true,code:0,message:'token check success',review_data:reviewdata_value});
        console.log('토큰 아직 있네요');
    }
});

review.post('/register',(request:Request, res:Response, next:NextFunction) => {
    let Token = request.get('Token');
    let decoded = jwt.vertify(Token,process.env.JWT_SECRET);
    
    if(!decoded) {
        res.json({success:false,code:-401,message:'expired token'});
    } else {
        if(decoded.roll == 0) {
            let review_star = request.body.review_star;
            let title = request.body.title;
            let content = request.body.content;
            let name = request.body.name;
            let when = request.body.when;
            let nickname= request.body.nickname;
            connection.query("INSERT INTO crcdb.reviewdata(review_star,title,content,name,when,nickname) VALUES(?,?,?,?,?,?)",[review_star,title,content,name,when,nickname],
            function(err:Error,results:any,fields:any) {
                if(err) {
                    res.json({success:false,code:-100,message:'cannot connect db'});
                    console.log(err)
                } else {
                    res.json({success:true,code:0,message:'register review'})
                }
            })
        } else {
            res.json({success:false,code:-600, message:'권한 없음'})
        }

    }
});

review.get('/empathy',(req:Request,res:Response,next:NextFunction) => {
    connection.query("SELECT empathy FROM crcdb.reviewdata WHERE reviewid = ?",[req.body.reviewid],
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.json({success:false,code:-100,message:'cannot connect db'});
            console.log(err)
        } else {
            connection.query("UPDATE crcdb.reviewdata SET empathy = ? WHERE reviewid = ?",[results+1,req.body.reviewid],
            function(err1:Error,results1:any,fields1:any) {
                if(err) {
                    res.json({success:false,code:-100,message:'cannot connect db'});
                    console.log(err)
                } else {
                    res.json({success:true,code:0,message:'empathy success'})
                }
            })
        }
    })
});

review.post('/reply',(req:Request,res:Response,next:NextFunction) => {
    if(req.body.reply) {
        connection.query("UPDATE crcdb.reviewdata SET reply = ? WHERE reviewid = ?",[req.body.reply,req.body.reviewid],
        function(err:Error,results:any,fields:any) {
            if(err) {
                res.json({success:false,code:-100,message:'cannot connect db'});
                console.log(err)
            } else {
                res.json({success:true,code:0,message:'reply success'});
            }
        })
    } else {
        res.json({success:false,code:-1,message:'reply가 존재하지 않습니다.'});
    }
});

export = review;