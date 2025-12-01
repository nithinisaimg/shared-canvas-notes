import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
const DB_NAME = process.env.MONGO_DB_NAME || "shared-canvas-notes";
const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true,
  }),
);
app.use(express.json());

let db;

async function start() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    db = client.db(DB_NAME);
    console.log(`✅ Connected to MongoDB at ${MONGO_URI}, db: ${DB_NAME}`);

    const notesCollection = db.collection("notes");

    // Health check
    app.get("/health", (req, res) => {
      res.json({ status: "ok", mongo: "connected", db: DB_NAME });
    });

    // Get a note by name
    app.get("/notes/:noteName", async (req, res) => {
      try {
        const noteName = req.params.noteName;
        const note = await notesCollection.findOne({ noteName });

        if (!note) {
          return res.status(404).json({ message: "Note not found" });
        }

        return res.json({
          noteName: note.noteName,
          content: note.content || "",
          updatedAt: note.updatedAt,
        });
      } catch (err) {
        console.error("Error loading note from MongoDB:", err);
        return res.status(500).json({ message: "Error loading note" });
      }
    });

    // Create/update a note
    app.put("/notes/:noteName", async (req, res) => {
      try {
        const noteName = req.params.noteName;
        const body = req.body || {};
        const content = typeof body.content === "string" ? body.content : "";

        const updatedAt = new Date().toISOString();

        await notesCollection.updateOne(
          { noteName },
          {
            $set: {
              noteName,
              content,
              updatedAt,
            },
            $setOnInsert: {
              createdAt: updatedAt,
            },
          },
          { upsert: true },
        );

        return res.json({ noteName, content, updatedAt });
      } catch (err) {
        console.error("Error saving note to MongoDB:", err);
        return res.status(500).json({ message: "Error saving note" });
      }
    });

    app
      .listen(PORT, () => {
        console.log(`🚀 API server running on http://localhost:${PORT}`);
      })
      .on("error", (err) => {
        console.error("❌ Server error:", err);
      });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

start();


