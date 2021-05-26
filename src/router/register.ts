import express, { Request, Response, NextFunction } from "express";

const register = express.Router();

register.get("/", (request: Request, response: Response, next: NextFunction) => {
    console.log('get success');
});

export = register;