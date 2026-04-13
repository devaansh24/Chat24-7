import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname=path.dirname(fileURLToPath(import.meta.url))
const db=new Database(path.join(__dirname,"../chat.db"));

db.pragma("journal_mode= WAL");
db.pragma("foreign_keys=ON");

db.exec(`
      CREATE TABLE IF NOT EXISTS users(
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      email     TEXT UNIQUE NOT NULL,
      username  TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
      
      );



      CREATE TABLE IF NOT EXISTS rooms(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      create_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))

      );


      CREATE TABLE IF NOT EXISTS messages(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER REFERENCES rooms(id),
      user_id INTEGER REFERENCES users(id),
      username TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
      
      );
    
    `);

    export default db;
