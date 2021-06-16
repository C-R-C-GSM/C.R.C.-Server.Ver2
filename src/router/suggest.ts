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
let suggest_data:JSON;

let today = new Date();
let time = today.toLocaleString().substring(0,today.toLocaleString().indexOf(' '));
console.log(time);

suggest.post('/suggest_check',(req:Request,res:Response,next:NextFunction) => {
    console.log('suggest post');
    connection.query("SELECT * FROM crcdb.suggest",
    async function(err:Error,results:any,fields:any) {
        if(err) {
            res.json({success:false,code:-100,message:'cannot connect db'});
            console.log(err);
        } else {
            suggest_data = await results;
            res.json({success:true,code:0,message:'suggest get',suggest_data:suggest_data});
        }
    })
});

suggest.post('/suggest_register',(req:Request,res:Response,next:NextFunction) => {
    let title = req.body.title;
    let content = req.body.content;
    let name = req.body.name;
    let when = req.body.when;
    let today = new Date();   
    let time = today.toLocaleString().substring(0,today.toLocaleString().indexOf('├')-1);
    connection.query("INSERT INTO crcdb.suggest(title,content,name,time,when) VALUES(?,?,?,?,?)",
        [title,content,name,time,when],
        function(err:Error, results:any,fields:any ) {
            if(err) {
                res.json({success:false,code:-100,message:'cannot connect db'});
                console.log(err)
            } else {
            
            res.json({success:true,code:0,message:'success'})
            }
        });
});

suggest.post('/empathy',(req:Request,res:Response,next:NextFunction) => {
    connection.query("SELECT empathy FROM crcdb.suggest WHERE suggestid = ?",[req.body.suggestid],
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.json({success:false,code:-100,message:'cannot connect db'});
            console.log(err)
        } else {
            connection.query("UPDATE crcdb.suggest SET empathy = ? WHERE suggestid = ?",[results+1,req.body.suggestid],
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

suggest.post('/reply',(req:Request,res:Response,next:NextFunction) => {
    connection.query("UPDATE crcdb.suggest SET reply = ? WHERE suggestid = ?",[req.body.reply,req.body.suggestid],
    function(err:Error,results:any,fields:any) {
        if(err) {
            res.json({success:false,code:-100,message:'cannot connect db'});
            console.log(err)
        } else {
            res.json({success:true,code:0,message:'reply success'});
        }
    });
});

export = suggest;