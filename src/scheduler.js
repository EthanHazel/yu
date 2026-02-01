import Alarm from "../config/alarms.json" with { type: "json" };

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
  const now = new Date();
  today = DAYS[now.getDay()];

  console.log("Current day:", FORMAL_DAYS[today]);

  const alarms = Alarm[today] ?? [];
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
    console.log("No alarm for today 💤");
    return;
  }

  console.log("Alarms for today:", alarmList.length);
  alarmList.forEach((a) => console.log(`> ID ${a.id} at ${a.time}`));
}

function _runCheck() {
  const now = new Date();

  // Day rollover
  const currentDay = DAYS[now.getDay()];
  if (currentDay !== today) _updateAlarms();

  const nowSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  for (const alarm of alarmList) {
    if (!alarm.triggered && alarm.seconds === nowSeconds) {
      alarm.triggered = true;
      console.log(`> Launching alarm ${alarm.id}`);
      launch(alarm.id);
    }
  }
}

export default function startScheduler() {
  _updateAlarms();

  const delay = 1000 - (Date.now() % 1000);
  setTimeout(() => {
    _runCheck();
    setInterval(_runCheck, 1000);
  }, delay);
}
