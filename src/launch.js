import Settings from "../config/settings.json" with { type: "json" };

import fetch from "node-fetch";
import "dotenv/config";

import fetchVideo from "./fetch.js";

async function _post(path, log) {
  console.log(`> ${log} : ${path}`);
  await fetch(`http://${process.env.ROKU}:8060${path}`, { method: "POST" });
}

export default async function launch(id) {
  try {
    if (!id) throw new Error("No content ID given");
    if (typeof id !== "string") throw new Error("Content ID isn't a string");
    if (!Settings?.powerOnTimout)
      throw new Error("Power on timeout is missing in settings");
    if (typeof Settings.powerOnTimout !== "number")
      throw new Error(
        "Power on timeout isn't a number: " + Settings.powerOnTimout,
      );

    console.log("\n-------------------");

    const contentId = await fetchVideo(id);
    console.log("> Fetched Video ID: ", contentId);

    await _post("/keypress/PowerOn", "Powering on Roku");
    console.log(
      `> Timing out for ${Settings.powerOnTimout / 1000} seconds to allow Roku to power on (Length can be adjusted in settings)`,
    );
    await new Promise((r) => setTimeout(r, Settings.powerOnTimout));

    await _post(`/launch/837?contentId=${contentId}`, "Launching video");

    console.log("✅ Successfully launched video");
    console.log("-------------------");
  } catch (e) {
    console.error(e);
  }
}
