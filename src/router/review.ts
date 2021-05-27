import express, { Request, Response, NextFunction } from "express";
import request from "request";

const review = express.Router();

review.get('/',(request:Request, res:Response, next:NextFunction) => {
    console.log('get')
});

review.post('/',(request:Request, res:Response, next:NextFunction) => {
    console.log('post')
});

export = review;