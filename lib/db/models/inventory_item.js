const { Client } = require('pg')
const client = new Client()
const BL_API = require('../../bricklink/api');
client.connect()

async function select(table,props){
    let sql = 'SELECT * FROM "'+table+'" WHERE '
    let keys = props.map(prop => Object.keys(prop)[0])
    for(let i = 0; i < keys.length; i++){
        sql += `|${keys[i]}" = $${i+1}`
        if(i < keys.length - 1)sql += ' AND '
    }
    let values = props.map(p=>Object.values(p)[0]);
    return (await client.query(sql, values)).rows;
}

async function update(table,props,fyrebrick_id){
    let sql = 'UPDATE "'+table+'" SET '
    let keys = props.map(prop => Object.keys(prop)[0])
    for(let i = 0; i < keys.length; i++){
        sql += `|${keys[i]}" = $${i+1}`
        if(i < keys.length - 1)sql += ' AND '
    }
    sql += ' WHERE "fyrebrick_id" = $'+(keys.length+1)
    let values = props.map(p=>Object.values(p)[0]);
    values.push(fyrebrick_id);
    return (await client.query(sql, values)).rows;
}

//this function fetches the inventory item from bl
async function fetch(inventory_id,user_fyrebrick_id){
    // console.log('fetching inventory item '+inventory_id+' for user '+user_fyrebrick_id);
    let inventory = await BL_API.get("https://api.bricklink.com/api/store/v1/inventories/"+inventory_id,user_fyrebrick_id);
    return inventory;
}

//fetch all
async function fetchAll(user_fyrebrick_id){
    // console.log('fetching all inventory items for user '+user_fyrebrick_id);
    let inventories = await BL_API.get("https://api.bricklink.com/api/store/v1/inventories",user_fyrebrick_id);
    return inventories;
}

module.exports = {
    select,
    fetch,
    update,
    fetchAll
};