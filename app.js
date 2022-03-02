require("dotenv").config();

const updateOrders = require("./lib/bricklink/updateOrders.js");
const updateInventory = require("./lib/bricklink/updateInventory.js");
const cleanup = require("./lib/bricklink/cleanup.js");
const schedule = require("node-schedule");
const {cleanupDaily} = require("./lib/db/utils/updateApiCall");
const fs = require('fs');
const path = require('path');

(async () => {
  const Crud = require("./lib/db/utils/crud");
  let users = (await Crud.select("user"));
  let currentlyUpdatingUsersInventoryItems = [];
  let currentlyUpdatingUsersOrders = [];
  let timing = {
    orders:process.env.CRON_ORDERS || "*/2 * * * *",
    inventory:process.env.CRON_INVENTORY || "*/10 * * * *",
    cleaning:process.env.CRON_CLEANING || "0 0 * * *"
  }
  console.clear();
  const logo = fs.readFileSync(path.resolve('./logo.txt')).toString();
  const widthOfLogo = logo.split("\n").map(line => line.length).reduce((a,b) => a>b?a:b);
  const widthOfConsole = process.stdout.columns;
  if((widthOfLogo+2) <= widthOfConsole){
    const sidePadding = Math.floor((widthOfConsole - widthOfLogo)/2);
    const paddedLogo = logo.split("\n").map(line => " ".repeat(sidePadding) + line).join("\n");
    console.log(paddedLogo);
  }else{
    console.log("FYREBRICK UPDATER v1\n");
  }
  
  console.log("=".repeat(widthOfConsole)+"\n");
  console.log("Cron schedules set:");
  for (let key in timing) {
    console.log("‣",key,timing[key]);
  }
  console.log("\n");
  cleanup();
  schedule.scheduleJob("0 0 * * *", async () => {
    cleanupDaily();
  });
  
  //UPDATING INVENTORY
  schedule.scheduleJob(timing.inventory, async () => {
    for(let user of users){
      if(!currentlyUpdatingUsersInventoryItems.includes(user.consumer_key)){
        currentlyUpdatingUsersInventoryItems.push(user.consumer_key);
        await updateInventory(user.fyrebrick_id,user);
        currentlyUpdatingUsersInventoryItems = currentlyUpdatingUsersInventoryItems.filter(u => u !== user.consumer_key); //remove current user from the list
      }
    }
  });

  //UPDATING ORDERS
  schedule.scheduleJob(timing.orders, async () => {
    for(let user of users){
      if(!currentlyUpdatingUsersOrders.includes(user.consumer_key)){
        currentlyUpdatingUsersOrders.push(user.consumer_key);
        await updateOrders(user.fyrebrick_id,user)
        currentlyUpdatingUsersOrders = currentlyUpdatingUsersOrders.filter(u => u !== user.consumer_key); 
      }
  }
  });

  schedule.scheduleJob(timing.cleaning, async () => {
    cleanup();
  });

})();
