require("dotenv").config();

const updateOrders = require("./lib/bricklink/updateOrders.js");
const updateInventory = require("./lib/bricklink/updateInventory.js");
const cleanup = require("./lib/bricklink/cleanup.js");
const schedule = require("node-schedule");
const cliProgress = require('cli-progress');

(async () => {
  const Crud = require("./lib/db/utils/crud");
  console.log("Started FYREBRICK UPDATER V1");
  let users = (await Crud.select("user"));
  let currentlyUpdatingUsersInventoryItems = [];
  let currentlyUpdatingUsersOrders = [];
  let multiBar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} {percentage}% | ETA: {eta}s | {value}/{total} | {description}'
  }, cliProgress.Presets.shades_grey);
  let timing = {
    orders:process.env.CRON_ORDERS || "*/2 * * * *",
    inventory:process.env.CRON_INVENTORY || "*/10 * * * *",
    cleaning:process.env.CRON_CLEANING || "0 0 * * *"
  }
  console.log("Cron schedules set:");
  for (let key in timing) {
    console.log(key,timing[key]);
  }
  console.log("");
  
  //UPDATING INVENTORY
  schedule.scheduleJob(timing.inventory, async () => {
    for(let user of users){
      if(!currentlyUpdatingUsersInventoryItems.includes(user.consumer_key)){
        currentlyUpdatingUsersInventoryItems.push(user.consumer_key);
        // console.log("updating inventory for user "+user.username);
        await updateInventory(user.fyrebrick_id,multiBar,user);
        currentlyUpdatingUsersInventoryItems = currentlyUpdatingUsersInventoryItems.filter(u => u !== user.consumer_key); //remove current user from the list
      }
    }
  });

  //UPDATING ORDERS
  schedule.scheduleJob(timing.orders, async () => {
    for(let user of users){
      if(!currentlyUpdatingUsersOrders.includes(user.consumer_key)){
        currentlyUpdatingUsersOrders.push(user.consumer_key);
        await updateOrders(user.fyrebrick_id,multiBar,user);
        currentlyUpdatingUsersOrders = currentlyUpdatingUsersOrders.filter(u => u !== user.consumer_key); 
      }
  }
  });

  schedule.scheduleJob(timing.cleaning, async () => {
    // console.log("cleaning");
    cleanup();
  });
  


})();
