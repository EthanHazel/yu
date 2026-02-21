import fs from "fs";

import configManager from "./config-manager.js";

import launch from "./launch.js";

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const FORMAL_DAYS = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

let today = null;
let alarmList = [];

// Convert "HH", "HH:MM", or "HH:MM:SS" → seconds since midnight
function _parseTimeToSeconds(time) {
  const parts = time.split(":").map(Number);

  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;

  return h * 3600 + m * 60 + s;
}

function _updateAlarms() {
  const Alarms = configManager.get("alarms");
  const Settings = configManager.get("settings");

  if (!Alarms || !Settings) {
    console.warn("> Config not ready yet");
    return;
  }

  const now = new Date();
  today = DAYS[now.getDay()];

  console.log("Current day:", FORMAL_DAYS[today]);

  const allAlarms = Alarms.enabled;

  if (today === Settings.weekStartDay) {
    // Move non repeating alarms to disabled
    for (const alarmId in allAlarms) {
      if (!allAlarms[alarmId].repeat) {
        Alarms.disabled[alarmId] = allAlarms[alarmId];
        delete Alarms.enabled[alarmId];
        console.log(`> Moving alarm ${alarmId} to disabled`);
        // Save to file
        fs.writeFile("./config/alarms.json", JSON.stringify(Alarms)).then(
          () => {
            console.log("> Updated alarms.json");
          },
        );
      }
    }
  }
  const alarms = Object.values(allAlarms).filter((a) => a.days.includes(today));

  try {
    alarmList = alarms.map((a) => ({
      ...a,
      seconds: _parseTimeToSeconds(a.time),
      triggered: false,
    }));
  } catch (e) {
    console.error(e);
    return;
  }

  if (alarmList.length === 0) {
    console.log("No alarms for today 💤");
    return;
  }

  console.log("Alarms for today:", alarmList.length);
  alarmList.forEach((a) =>
    console.log(`> Content ID ${a.contentId} at ${a.time} for TV ${a.tvId}`),
  );
}

function _runCheck() {
  const now = new Date();

  // Day rollover
  const currentDay = DAYS[now.getDay()];
  if (currentDay !== today) {
    _updateAlarms();
  }

  const nowSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  for (const alarm of alarmList) {
    if (!alarm.triggered && alarm.seconds === nowSeconds) {
      alarm.triggered = true;
      console.log(`> Launching alarm ${alarm.contentId}`);
      launch(alarm.contentId, alarm.tvId);
    }
  }
}

export default function startScheduler() {
  _updateAlarms();

  configManager.on("alarms:updated", () => {
    console.log("> Scheduler reacting to alarms update");
    _updateAlarms();
  });

  configManager.on("settings:updated", () => {
    console.log("> Scheduler reacting to settings update");
    _updateAlarms();
  });

  const delay = 1000 - (Date.now() % 1000);

  setTimeout(() => {
    _runCheck();
    setInterval(_runCheck, 1000);
  }, delay);
}
