import {Request,Router,Response} from 'express';
import db from "../db"
import {AuthRequest,requireAuth} from "../middleware/auth"

const router=Router();

type RoomRow = {
    id: number;
    name: string;
    create_by: number;
    created_at: string;
};

//Get /api/rooms

router.get("/",(_req:Request,res:Response)=>{

   const rooms=db.prepare("Select id, name, create_by,created_at FROM rooms ORDER BY created_at DESC")
   .all()
    res.json(rooms);
})

//Post /api/rooms

router.post("/",requireAuth,(req:AuthRequest,res:Response)=>{
    //for creating rooms

    const {name}=req.body;

    if(!name){
        res.status(400).json({error:"Room name is required"})
        return
    }

    try{
        const stmt=db.prepare(
            "INSERT INTO rooms(name,create_by) VALUES(?,?)"
        );
        const result=stmt.run(name,req.user?.id)

        const room=db
            .prepare("SELECT id, name, create_by, created_at FROM rooms WHERE id = ?")
            .get(result.lastInsertRowid) as RoomRow | undefined;

        if(!room){
            res.status(500).json({error:"Failed to load created room"});
            return;
        }

        res.status(201).json(room);
    }catch(err: unknown){
        const errorMessage = err instanceof Error ? err.message : "";

        if(errorMessage.includes("UNIQUE constraint failed")){
            res.status(409).json({error:"Room name already exists"});
        }else{
            res.status(500).json({error:"Server Error"})
        }
    }

    
})

export default router;
