import { config } from 'dotenv';
import express,{Request, Response, NextFunction} from 'express';
import jwt, { Secret } from 'jsonwebtoken'

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

suggest.get('/check',(req:Request,res:Response,next:NextFunction) => {
    let Token:any = req.get('Token');
    let decoded = jwt.decode(Token);
    console.log(decoded)
    if(!decoded) {
        res.json({success:false,code:-401,message:'expired token'});
    } else {
        connection.query("SELECT * FROM crcdb.suggest",
        async function(err:Error,results:any,fields:any) {
            suggest_data = await results;
        })
        res.json({success:true,code:0,message:'token check success',suggest_data:suggest_data});
        console.log('토큰 아직 있네요');
    }
});

suggest.post('/register',(req:Request,res:Response,next:NextFunction) => {
    let title = req.body.title;
    let content = req.body.content;
    let name = req.body.name;
    let when = req.body.when;
    let nickname = req.body.nickname
    let today = new Date();
    let time = today.toLocaleString().substring(0,today.toLocaleString().indexOf('├')-1);
    connection.query("INSERT INTO crcdb.suggest(title,content,name,time,when,nickname) VALUES(?,?,?,?,?,?)",
        [title,content,name,time,when,nickname],
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