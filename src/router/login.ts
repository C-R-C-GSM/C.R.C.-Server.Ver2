import express, { Request, Response, NextFunction } from "express";
import path from "path";

const login = express.Router();
const mysql = require("mysql")
const crypto = require('crypto');

require('dotenv').config();

var connection = mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER ,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

connection.connect();

login.get("/", (request: Request, response: Response, next: NextFunction) => {
    console.log('get success');
});

login.post("/", (req: Request, res: Response, next: NextFunction) => {
    let email:string = req.body.email;
    let password:string = req.body.password;
    let name:string = req.body.name;
    let id:string = req.body.id;
    let student_data:string = req.body.student_data;
    let salt:string;
    let hashedPasswd:string;

  async function hash() {
    salt = await crypto.randomBytes(32).toString()
    hashedPasswd = await crypto.pbkdf2Sync(password, salt, 1, 32, 'sha512').toString('hex');
  }

  hash();
      connection.query("SELECT email FROM crcdb.userdata WHERE email = ?",[email],
      async function(err:Error, results:any,fields:any ) {
          if(err) {
            res.send('Email Select Error. Check DB');
          } else {
              if(results[0]) {
                  res.send("This Email already used. Please use another email");
              } else {
                  connection.query("INSERT INTO crcdb.userdata(id,email,password, name,salt,student_data) VALUES(?,?,?,?,?,?)",
                  [id,email,hashedPasswd,name,salt,student_data],
                  function(err:Error, results:any,fields:any ) {
                      if(err) {
                          res.send('User Data insert Error')
                      } else {
                        res.send("REGISTER SUCCESS")
                      }
                  });
              }
          }
      });
});

export = login;