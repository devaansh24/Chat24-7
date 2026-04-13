import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import roomsRouter from "./routes/rooms"
import messageRouter from "./routes/messages"

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express backend!" });
});

app.get("/api/data", (req: Request, res: Response) => {
  res.json({
    data: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ],
  });
});

app.post("/api/echo", (req: Request, res: Response) => {
  const { message } = req.body;
  res.json({ echo: message });
});

app.use("/api/auth", authRouter);
app.use("/api/rooms",roomsRouter)
app.use("/api/rooms",messageRouter)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
