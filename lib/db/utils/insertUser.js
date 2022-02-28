const { Pool } = require('pg')
const pool = new Pool()

async function main(username, googleid, googleemail, setupcomplete, consumer_key, consumer_secret, token_secret, token_value){
    //search user
    let prepUser = {
        text:`SELECT username FROM "user" WHERE username = $1`,
        values: [username]
    }
    const client = await pool.connect();
    let rows = (await client.query(prepUser.text,prepUser.values)).rows;
    if(rows.length === 1){
        console.log("Warning! user already exists. skipping");
        return;
    }else if(rows.length > 1){
        console.log("Error! more than one user with same username. skipping");
        return;
    }

    //insert 
    let text = `
    INSERT INTO "user" (
        username,
        googleid,
        googleemail,
        setupcomplete,
        consumer_key,
        consumer_secret,
        token_secret,
        token_value
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING fyrebrick_id
    ;`;
    let values = [
        username,
        googleid,
        googleemail,
        setupcomplete,
        consumer_key,
        consumer_secret,
        token_secret,
        token_value
    ];
    let clientVal = (await client.query(text, values).rows);
    client.release();
    return clientVal;
}

module.exports = main;
