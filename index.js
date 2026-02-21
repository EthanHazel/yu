import configManager from "./src/back/config-manager.js";
import startScheduler from "./src/back/scheduler.js";
import startAPI from "./src/back/api.js";

console.log("You Up? - Created by Ethan Hazel");
console.log("Version " + process.env.npm_package_version + "\n");
(async () => {
  console.log("> Loading config...");
  await configManager.init();

  startScheduler();
  startAPI();
})();
