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
let suggest_data: any;
suggest.get('/',(req:Request,res:Response,next:NextFunction) => {
    console.log('suggest get');
    connection.query("SELECT * FROM crcdb.suggest",
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.send("DB ERROR");
            console.log(err);
        } else {
            res.json(suggest_data:results)
        }
    })
});

suggest.post('/',(req:Request,res:Response,next:NextFunction) => {
    let title = req.body.title;
    let content = req.body.content;
    let name = req.body.name;

    connection.query("INSERT INTO crcdb.suggest(title,content,name) VALUES(?,?,?)",
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

suggest.delete('/',(request:Request, res:Response, next:NextFunction) => {
    let name = request.body.name;
    
    connection.query("SELECT reviewid FROM crcdb.suggest WHERE name = ?",[name],
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.send("DB err");
            console.log(err);
        } else {
            connection.query("DELETE FROM crcdb.suggest WHERE reviewid = ?",[results[0].reviewid],
            function(err1:Error,results1:any,fields1:any) {
                if(err1) {
                    res.send("DB err");
                    console.log(err1);
                }else {
                    res.send("성공적으로 삭제되었습니다.")
                }
            })
            
        }
    });
    
});

export = suggest;