const { Pool } = require('pg')
const pool = new Pool()

async function select(table,props=[]){
    try{
    let sql = 'SELECT * FROM "'+table+'"';
    let values;
    if(props.length>=1){
        sql+=' WHERE ';;
        let keys = props.map(prop => Object.keys(prop)[0]??null)
        for(let i = 0; i < keys.length; i++){
            sql += `"${String(keys[i]).toLowerCase()}" = $${i+1}`
            if(i < keys.length - 1)sql += ' AND '
        }
         values = props.map(p=>Object.values(p)[0])??null;
    }
    // console.log(sql);
    const client = await pool.connect();
    // console.log(sql);
    let rows = [];
    if(props.length>=1){
        // console.log(values);
        rows = (await client.query(sql, values)).rows;
    }else{
        rows = (await client.query(sql)).rows;
    }
    client.release();
    if(rows.length===0){
        // throw "Niets gekregen";
    }
    return rows;
    }catch(e){
        console.log(`\nselect(${table},${JSON.stringify(props)})`,e);
        if(e?.code==='42804'){
            //redo
            return await select(table,props);
        }
        return []; //because we check on lenght
    }
}

async function update(table,props,fyrebrick_id){
    let sql = "";
    let values = [];
    try{
        sql = 'UPDATE "'+table+'" SET '
        let keys = props.map(prop => Object.keys(prop)[0]??null)
        for(let i = 0; i < keys.length; i++){
            sql += `"${String(keys[i]).toLowerCase()}" = $${i+1}`
            if(i < keys.length - 1)sql += ' , ' //not AND
        }
        sql += ' WHERE "fyrebrick_id" = $'+(keys.length+1)
        values = props.map(p=>Object.values(p)[0]??null);
        // console.log(sql,values);
        const client = await pool.connect();
        values.push(fyrebrick_id);
        sql+=" RETURNING fyrebrick_id;"
        let rows = (await client.query(sql, values)).rows;
        client.release();
        return rows;
    }catch(e){
        console.log(`\nupdate(${table},${JSON.stringify(props)},${fyrebrick_id})`,e);
        console.log(sql,values);
        if(e?.code==='42804'){
            //redo
            return await update(table,props,fyrebrick_id)
        }
        return []; //because we check on lenght
    }
}

async function DELETE(table,props=[]){
    try{
    let sql = 'DELETE FROM "'+table+'"';
    let values;
    if(props.length>=1){
        sql+=' WHERE ';;
        let keys = props.map(prop => Object.keys(prop)[0]??null)
        for(let i = 0; i < keys.length; i++){
            sql += `"${String(keys[i]).toLowerCase()}" = $${i+1}`
            if(i < keys.length - 1)sql += ' AND '
        }
         values = props.map(p=>Object.values(p)[0])??null;
    }
    const client = await pool.connect();
    if(props.length>=1){
        await client.query(sql, values)
    }else{
        await client.query(sql)
    }
    client.release();
    return [];
    }catch(e){
        console.log(`\nDELETE(${table},${JSON.stringify(props)})`,e);
        if(e?.code==='42804'){
            //redo
            return await DELETE(table,props);
        }
        return []; //because we check on lenght
    }
}

module.exports = {
    update,
    select,
    DELETE
}