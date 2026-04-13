import {Request,Response,NextFunction} from "express";

import jwt from "jsonwebtoken";


const JWT_SECRET =process.env.JWT_SECRET || "Your secret Key";

export interface AuthRequest extends Request{
    user?:{
        id:number;
        email:string;
        username:string;
    };
}

export function requireAuth(req:AuthRequest,res:Response,next:NextFunction){
const token =req.cookies?.token;


if(!token){

    res.status(401).json({error:"Not authenticated"});
    return;
}

try{
    const payload=jwt.verify(token,JWT_SECRET) as AuthRequest['user'];

    req.user=payload;;

    next();


}catch{
    res.status(401).json({error:"Invalid or expired token"})
}


}

export {JWT_SECRET}