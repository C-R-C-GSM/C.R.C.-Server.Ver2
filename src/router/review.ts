import express, { Request, Response, NextFunction } from "express";

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

review.get('/',(request:Request, res:Response, next:NextFunction) => {
    console.log('get');
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
        res.json({success:false,code:-401,message:'expired token'});
    } else {
        res.json({success:true,code:0,message:'token check success'});
        console.log('토큰 아직 있네요');
    }
});

review.post('/',(request:Request, res:Response, next:NextFunction) => {
    let review_star = request.body.review_star;
    let title = request.body.title;
    let content = request.body.content;
    let name = request.body.name;

    connection.query("INSERT INTO crcdb.reviewdata(review_star,title,content,name) VALUES(?,?,?,?)",[review_star,title,content,name],
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.json({success:false,code:-100,message:'cannot connect db'});
            console.log(err)
        } else {
            res.json({success:true,code:0,message:'register review'})
        }
    })
});

export = review;