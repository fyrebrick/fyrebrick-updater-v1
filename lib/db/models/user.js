const { Pool } = require('pg')
const pool = new Pool()

async function selectUser(props){
    let sql = 'SELECT * FROM "user" WHERE '
    let keys = props.map(prop => Object.keys(prop)[0])
    for(let i = 0; i < keys.length; i++){
        sql += `"${keys[i]}" = $${i+1}`
        if(i < keys.length - 1)sql += ' AND '
    }
    let values = props.map(p=>Object.values(p)[0]);
    const client = await pool.connect();
    let rows = (await client.query(sql, values)).rows;
    client.release();
    return rows
}

module.exports = {
    selectUser
};