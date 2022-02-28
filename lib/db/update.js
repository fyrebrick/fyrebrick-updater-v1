const OAuth = require('oauth');
const { Pool } = require('pg')
const pool = new Pool()

async function byFyrebrickId(table,array_with_text_and_value,fyrebrick_id){
    let client = await pool.connect();
    let totalRowsUpdating = array_with_text_and_value.length;
    let text=`UPDATE ${table} SET ${(()=>{
        let text = array_with_text_and_value.map((val,index)=>{
            return val.text+" = $"+index+1+" AND"
        })
        return text.substr(0,text.length-4) // remove the last ' AND' 
        })()
    } WHERE fyrebrick_id = 
        $${totalRowsUpdating+1}
    `;
    let values = array_with_text_and_value.map((val)=>val.value);
    let res = await client.query(text,values);
    client.release();
    return res;
}


module.exports ={
    byFyrebrickId
}