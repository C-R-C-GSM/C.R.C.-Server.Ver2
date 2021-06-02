import express, { Request, Response, NextFunction } from "express";

const review = express.Router();

const mysql = require('mysql');
require('dotenv').config();
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
    res.status(200).json({success:true});
});

review.post('/',(request:Request, res:Response, next:NextFunction) => {
    let review_star = request.body.review_star;
    let title = request.body.title;
    let content = request.body.content;
    let name = request.body.name;

    connection.query("INSERT INTO crcdb.reviewdata(review_star,title,content,name) VALUES(?,?,?,?)",[review_star,title,content,name],
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.send("DB ERROR").json({success:false});
            console.log(err)
        } else {
            res.send("리뷰 등록!").json({success:true})
        }
    })
});

review.delete('/',(request:Request, res:Response, next:NextFunction) => {
    let name = request.body.name;
    
    connection.query("SELECT reviewid FROM crcdb.reviewdata WHERE name = ?",[name],
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.send("DB ERROR").json({success:false});
            console.log(err);
        } else {
            connection.query("DELETE FROM crcdb.reviewdata WHERE reviewid = ?",[results[0].reviewid],
            function(err1:Error,results1:any,fields1:any) {
                if(err1) {
                    res.send("DB ERROR").json({success:false});
                    console.log(err1);
                }else {
                    res.status(200).send("삭제되었습니다.").json({success:true})
                }
            })
            
        }
    });
    
});

export = review;