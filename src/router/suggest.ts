import { config } from 'dotenv';
import express,{Request, Response, NextFunction} from 'express';

const suggest = express.Router();

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

suggest.get('/',(req:Request,res:Response,next:NextFunction) => {
    console.log('suggest get')
});

suggest.post('/',(req:Request,res:Response,next:NextFunction) => {
    let title = req.body.title;
    let content = req.body.content;
    let name = req.body.name;

    connection.query("INSERT INTO crcdb.userdata(title,content,name) VALUES(?,?,?)",
        [title,content,name],
        function(err:Error, results:any,fields:any ) {
            if(err) {
                res.send('DB error');
                console.log(err)
            } else {
            
            res.send("글 작성을 완료했습니다")
            }
        });
});

export = suggest;