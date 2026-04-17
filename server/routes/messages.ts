import {Router,Request,Response} from "express";
import db from "../db";
import {AuthRequest,requireAuth} from '../middleware/auth'

const router = Router();

router.get("/:roomId/messages",(req:Request,res:Response)=>{
    const {roomId}=req.params;

    const messages=db.prepare(
        "SELECT id,room_id,user_id,username,text,created_at FROM messages WHERE room_id=? ORDER BY created_at ASC"
    ).all(roomId)

    res.json(messages)
})

router.post("/:roomId/messages",requireAuth,(req:AuthRequest,res:Response)=>{
  const {roomId}=req.params;
  const{text}=req.body;

  if(!text){
    res.status(400).json({error:"Message is required"})
    return;
  }

  try{
    const stmt=db.prepare(
        "INSERT INTO messages(room_id,user_id,username,text) VALUES(?,?,?,?)"
    );


    const result=stmt.run(
        roomId,
        req.user?.id,
        req.user?.username,
        text
    );

    res.status(201).json({
        id:result.lastInsertRowid,
        room_id:Number(roomId),
        user_id:req.user?.id,
        username:req.user?.username,
        text
    })


  }catch{
    res.status(500).json({error:"Server Error"})
  }


})

export default router
