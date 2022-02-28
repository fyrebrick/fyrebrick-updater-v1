const { Pool } = require('pg')
const pool = new Pool()

async function queryFile(sqlString){
    const client = await pool.connect()
    //for each line in the schemas.sql file
    try{
        let queries = sqlString.split(';');
        for await (const query of queries){
            //if the line is not empty
            if(query.length > 0){
                //execute the query
                await client.query(query)
            }
        };
    }catch(e){
        console.log(e);
    }finally{
        client.release();
    }
}

module.exports = {
    queryFile
}