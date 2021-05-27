import express, { Request, Response, NextFunction } from "express";

const login = express.Router();
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

login.get("/", (request: Request, response: Response, next: NextFunction) => {
    console.log('get success');
});

login.post("/", (request: Request, response: Response, next: NextFunction) => {
    
});

export = login;