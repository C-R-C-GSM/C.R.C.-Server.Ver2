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

suggest.get('/',(req:Request,res:Response,next:NextFunction) => {
    console.log('suggest get');
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

suggest.post('/',(req:Request,res:Response,next:NextFunction) => {
    let title = req.body.title;
    let content = req.body.content;
    let name = req.body.name;

    connection.query("INSERT INTO crcdb.suggest(title,content,name) VALUES(?,?,?)",
        [title,content,name],
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
    if(req.body.empathy) {
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
    } else {
        res.json({success:false,code:-1,message:'empathy가 존재하지 않습니다.'})
    }
});

suggest.post('/reply',(req:Request,res:Response,next:NextFunction) => {
    if(req.body.reply) {
        connection.query("UPDATE crcdb.suggest SET reply = ? WHERE suggestid = ?",[req.body.reply,req.body.suggestid],
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

export = suggest;