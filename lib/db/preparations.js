const fs = require('fs');
const path = require('path');
const { queryFile} = require('./index.js');

async function main(){
    //get the full path for the file
    console.log("starting preparations");
    //loading models
    const models = fs.readFileSync(path.resolve('./lib/db/sql/models.sql')).toString();
    await queryFile(models);
    console.log("models loaded");
    return;
}

module.exports = main;