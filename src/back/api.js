import express from "express";
import fs from "fs/promises";
import path from "path";
import cors from "cors";
import "dotenv/config";

import launch from "./launch.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev
      `http://localhost:${process.env.YU_FRONT_PORT}`,
      `http://192.168.50.200:5173`, // Vite dev local network
    ],
  }),
);

app.use(express.json());

const CONFIG_DIR = path.resolve("config");

async function _readJSON(file) {
  const data = await fs.readFile(path.join(CONFIG_DIR, file), "utf-8");
  return JSON.parse(data);
}

async function _writeJSON(file, data) {
  await fs.writeFile(
    path.join(CONFIG_DIR, file),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

// Get all config in one file
app.get("/api/config", async (req, res) => {
  try {
    const [alarms, content, settings] = await Promise.all([
      _readJSON("alarms.json"),
      _readJSON("content.json"),
      _readJSON("settings.json"),
    ]);

    res.json({
      alarms,
      content,
      settings,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single config file
app.get("/api/config/:name", async (req, res) => {
  try {
    const data = await _readJSON(`${req.params.name}.json`);
    res.json(data);
  } catch {
    res.status(404).json({ error: "Config not found" });
  }
});

// Write single config file
app.post("/api/config/:name", async (req, res) => {
  try {
    await _writeJSON(`${req.params.name}.json`, req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Run launch command on a specific TV
app.post("/api/launch/:contentId/:tvId", async (req, res) => {
  try {
    await launch(req.params.contentId, req.params.tvId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default function startAPI(port = process.env.YU_BACK_PORT) {
  app.listen(port, () =>
    console.log(`\n> Config API running on http://localhost:${port}`),
  );
}
