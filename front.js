import express from "express";
import path from "path";
const app = express();

const dirname = path.resolve(path.dirname("")); // ???
const port = import.meta.env.YU_FRONT_PORT;

app.get("/", (req, res) =>
  res.sendFile(path.join(dirname, "/src/front/dist/index.html")),
);

app.listen(port, () => console.log("Server listening on port " + port));
