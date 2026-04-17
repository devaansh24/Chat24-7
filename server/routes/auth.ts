import bcrypt from "bcryptjs";
import {Router,Request,Response} from "express"
import db from "../db";
import { AuthRequest,requireAuth, JWT_SECRET } from "../middleware/auth";
import jwt from "jsonwebtoken";

type UserRow = {
    id: number;
    email: string;
    username: string;
    password: string;
};

const router= Router();

//register

//creates a new user account 

router.post("/register", async(req:Request ,res:Response)=>{
    const {email,username, password}=req.body;

    // validation

    if(!email || !username || !password){
        res.status(400).json({error:"All fields are required"});
        return;
    }

    try{

        const hashedPassword=await bcrypt.hash(password,10);

        //insert new user into the database

        const stmt=db.prepare(
            "INSERT INTO users(email,username,password) VALUES(?,?,?)"
        );

        const result=stmt.run(email,username,hashedPassword);

        //create a jwt token containing the users basic info


        const token=jwt.sign(
            {

                id:result.lastInsertRowid,email,username},
                JWT_SECRET,
            {expiresIn:'7d'}
        );

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:'lax',
        })

        res.status(201).json({id:result.lastInsertRowid,email,username});

    }catch(err: unknown){
        const errorMessage = err instanceof Error ? err.message : "";

        if(errorMessage.includes("UNIQUE constraint failed")){
            res.status(409).json({error:"Email and username already taken"});
        }else{
            res.status(500).json({error:"Server error"})
        }
    }

})

//Login

//post/auth/login
//logs in an existing user


router.post("/login",async(req:Request,res:Response)=>{
    const{email,password}=req.body;


    if(!email || !password){
        res.status(400).json({error:"Email and Password are required"});
        return;
    }

    //Look up the user by email

    const user=db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;


    if(!user){
        res.status(401).json({error:"Invalid Credentials"});
        return;
    }

    //Compare the plain text password against the stored hash

    const valid = await bcrypt.compare(password,user.password);

    if(!valid){
        res.status(401).json({error:"Invalid credentials"});
        return;
    }

    //Issue a new JWT

    const token =jwt.sign(

        {id:user.id, email:user.email,username:user.username},
        JWT_SECRET,
        {expiresIn:'7d'}
    )

    res.cookie("token",token,{
        httpOnly:true,
        maxAge:7*24*60*60*1000,
        sameSite:'lax'
    });

    res.json({
id:user.id,email:user.email,username:user.username
    })

    
})
//LOGOUT

    //POST/AUTH/lOGOUT

    //Clears the cookies


    router.post("/logout",(_req:Request,res:Response)=>{
        res.clearCookie("token");
        res.json({"message":"Logged out"})
    });

    //Me

    //Get /API/AUTH/ME

    //Returs the currently logged user

    router.get("/me",requireAuth, (req:AuthRequest,res:Response)=>{
        res.json(req.user);
    })

export default router;
