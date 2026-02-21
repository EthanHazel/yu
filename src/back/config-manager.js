import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import EventEmitter from "events";

const CONFIG_DIR = path.resolve("config");

class ConfigManager extends EventEmitter {
  constructor() {
    super();

    this.paths = {
      alarms: path.join(CONFIG_DIR, "alarms.json"),
      settings: path.join(CONFIG_DIR, "settings.json"),
      content: path.join(CONFIG_DIR, "content.json"),
    };

    this.data = {
      alarms: null,
      settings: null,
      content: null,
    };

    this._reloadTimers = {};
  }

  async init() {
    await Promise.all([
      this._load("alarms"),
      this._load("settings"),
      this._load("content"),
    ]);

    this._watch("alarms");
    this._watch("settings");
    this._watch("content");

    console.log("> ConfigManager initialized");
  }

  async _load(name) {
    try {
      const file = await fsp.readFile(this.paths[name], "utf-8");
      this.data[name] = JSON.parse(file);
      this.emit(`${name}:updated`, this.data[name]);
      console.log(`> ${name}.json loaded`);
    } catch (e) {
      console.error(`> Failed loading ${name}.json`, e);
    }
  }

  _watch(name) {
    fs.watch(this.paths[name], () => {
      clearTimeout(this._reloadTimers[name]);

      this._reloadTimers[name] = setTimeout(() => {
        console.log(`> ${name}.json changed — reloading`);
        this._load(name);
      }, 100);
    });
  }

  get(name) {
    return this.data[name];
  }

  async save(name, data) {
    await fsp.writeFile(
      this.paths[name],
      JSON.stringify(data, null, 2),
      "utf-8",
    );
  }
}

const configManager = new ConfigManager();
export default configManager;
