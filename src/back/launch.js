import configManager from "./config-manager.js";

import fetch from "node-fetch";
import "dotenv/config";

import fetchVideo from "./fetch.js";

async function _post(path, ip, log) {
  console.log(`> ${log} : ${path}`);
  await fetch(`http://${ip}:8060${path}`, { method: "POST" });
}

export default async function launch(id, tv) {
  try {
    const Settings = configManager.get("settings");
    if (!id) throw new Error("No content ID given");
    if (typeof id !== "string") throw new Error("Content ID isn't a string");
    if (!Settings?.tvs[tv]?.powerOnTimeout)
      throw new Error("Power on timeout is missing in settings for TV: " + tv);

    const powerOnTimeout = parseInt(Settings.tvs[tv].powerOnTimeout);

    console.log("\n-------------------");

    const contentId = await fetchVideo(id);
    console.log("> Fetched Video ID: ", contentId);

    await _post("/keypress/PowerOn", Settings.tvs[tv].ip, "Powering on Roku");

    console.log(
      `> Timing out for ${powerOnTimeout / 1000} seconds to allow Roku to power on`,
    );

    await new Promise((r) => setTimeout(r, powerOnTimeout));

    await _post(
      `/launch/837?contentId=${contentId}`,
      Settings.tvs[tv].ip,
      "Launching video",
    );

    console.log("✅ Successfully launched video");
    console.log("-------------------");
  } catch (e) {
    console.error(e);
  }
}
