const Create = require("../db/create");
const BL_API = require("./api");
const Crud = require("../db/utils/crud");
const { Pool } = require('pg')
const pool = new Pool()
const cliProgress = require('cli-progress');

module.exports = async function main(fyrebrick_id,multiBar,user){
    let data = await BL_API.get("https://api.bricklink.com/api/store/v1/inventories",fyrebrick_id); // [{inventory_id, item:{no,name,type,category},color_id,color_name,quantity,new_or_used,completeness,unit_price,bind_id,description,remarks,bulk,is_retain,is_stock_room,date_created,my_cost,sale_rate,tier_quantity1,tier_price1,tier_quantity2,tier_price2,tier_quantity3,tier_price3,my_weight}]
    let totalItems = data.length;
    let currentProccessed = 0;
    let progressBar = multiBar.create(totalItems, currentProccessed,{description:"Update inventory for "+user.username});
    let array_of_up_to_date_inventory_ids = [];
    for (const i of data){
        // console.log("updating inventory item id "+i?.inventory_id+" - "+i?.item?.no+"("+i?.color_name+")");
        let bl = {inventory_id:i?.inventory_id,color_id:i?.color_id,color_name:i?.color_name,quantity:i?.quantity??0,new_or_used:i?.new_or_used,completeness:i?.completeness,unit_price:i?.unit_price,bind_id:i?.bind_id,description:i?.description,remarks:i?.remarks,bulk:i?.bulk,is_retain:i?.is_retain,is_stock_room:i?.is_stock_room,stock_room_id:i?.stock_room_id,date_created:i?.date_created,my_cost:i?.my_cost,sale_rate:i?.sale_rate,tier_quantity1:i?.tier_quantity1,tier_price1:i?.tier_price1,tier_quantity2:i?.tier_quantity2,tier_price2:i?.tier_price2,tier_quantity3:i?.tier_quantity3,tier_price3:i?.tier_price3,my_weight:i?.my_weight};
        let db = await find_inventory_item(bl);
        if(db.length===0){ //not found -> create
            await Create.inventory_item(bl.color_id,bl.color_name,bl.quantity??0,bl.new_or_used,bl.completeness,bl.unit_price,bl.bind_id,bl.description,bl.remarks,bl.bulk,bl.is_retain,bl.is_stock_room,bl.stock_room_id,bl.date_created,bl.my_cost,bl.sale_rate,bl.tier_quantity1,bl.tier_quantity2,bl.tier_quantity3,bl.tier_price1,bl.tier_price2,bl.tier_price3,bl.my_weight,bl.inventory_id);
        }else{ //found update ->
            await Crud.select('inventory_item',[
                {inventory_id:i?.inventory_id},
                {color_id:bl?.color_id},
                {color_name:bl?.color_name},
                {quantity:bl?.quantity??0},
                {new_or_used:bl?.new_or_used},
                {completeness:bl?.completeness},
                {unit_price:bl?.unit_price},
                {bind_id:bl?.bind_id},
                {description:bl?.description},
                {remarks:bl?.remarks},
                {bulk:bl?.bulk},
                {is_retain:bl?.is_retain},
                {is_stock_room:bl?.is_stock_room},
                {stock_room_id:bl?.stock_room_id},
                {date_created:bl?.date_created},
                {my_cost:bl?.my_cost},
                {sale_rate:bl?.sale_rate},
                {tier_quantity1:bl?.tier_quantity1},
                {tier_price1:bl?.tier_price1},
                {tier_quantity2:bl?.tier_quantity2},
                {tier_price2:bl?.tier_price2},
                {tier_quantity3:bl?.tier_quantity3},
                {tier_price3:bl?.tier_price3},
                {my_weight:bl?.my_weight}
            ],db.fyrebrick_id);
        }
        array_of_up_to_date_inventory_ids.push(i?.inventory_id);

        //item update or create
        let bl_i = {no:i?.item?.no,name:i?.item?.name,type:i?.item?.type,category_id:i?.item?.category_id};
        let db_i = await Crud.select("item",
            [
                {no:bl_i?.no},
                {name:bl_i?.name},
                {type:bl_i?.type},
                {category_id:bl_i?.category_id}
            ]);
        if(db_i.length===0){ //not found -> create
            await Create.item(bl_i.no,bl_i.name,bl_i.type,bl_i.category_id);
        }
        progressBar.increment();
        currentProccessed++;
        if(totalItems===currentProccessed){
            progressBar.stop();
            let all_inventory_items = await Crud.select("inventory_item");
            progressBar.start(all_inventory_items.length, 0);
            for await(const i of all_inventory_items){
                if(!i?.inventory_id && !array_of_up_to_date_inventory_ids.includes(i?.inventory_id)){
                    const client = await pool.connect();
                    let values = [i?.fyrebrick_id];
                    let sql = "DELETE FROM inventory_item WHERE fyrebrick_id = $1";
                    await client.query(sql, values);
                    client.release();
                }
                progressBar.increment();
            }
            progressBar.stop();
        }
    }
}

async function find_inventory_item(bl){
        let db = await Crud.select('inventory_item',[
            {inventory_id:bl.inventory_id}
        ]);
        if(db.length>=1){
            return db[0];
        }
        db = await Crud.select('inventory_item',[
            {color_id:bl?.color_id},
            {color_name:bl?.color_name},
            {quantity:bl?.quantity},
            {new_or_used:bl?.new_or_used},
            {completeness:bl?.completeness},
            {unit_price:bl?.unit_price},
            {bind_id:bl?.bind_id},
            {description:bl?.description},
            {remarks:bl?.remarks},
            {bulk:bl?.bulk},
            {is_retain:bl?.is_retain},
            {is_stock_room:bl?.is_stock_room},
            {stock_room_id:bl?.stock_room_id},
            {date_created:bl?.date_created},
            {my_cost:bl?.my_cost},
            {sale_rate:bl?.sale_rate},
            {tier_quantity1:bl?.tier_quantity1},
            {tier_price1:bl?.tier_price1},
            {tier_quantity2:bl?.tier_quantity2},
            {tier_price2:bl?.tier_price2},
            {tier_quantity3:bl?.tier_quantity3},
            {tier_price3:bl?.tier_price3},
            {my_weight:bl?.my_weight}
        ]);
        if(db.length>=1){return db[0];}
        db = await Crud.select('inventory_item',[
            {color_id:bl?.color_id},
            {color_name:bl?.color_name},
            // {quantity:bl?.quantity},
            {new_or_used:bl?.new_or_used},
            {completeness:bl?.completeness},
            {unit_price:bl?.unit_price},
            {bind_id:bl?.bind_id},
            {description:bl?.description},
            {remarks:bl?.remarks},
            {bulk:bl?.bulk},
            {is_retain:bl?.is_retain},
            {is_stock_room:bl?.is_stock_room},
            {stock_room_id:bl?.stock_room_id},
            {date_created:bl?.date_created},
            {my_cost:bl?.my_cost},
            {sale_rate:bl?.sale_rate},
            {tier_quantity1:bl?.tier_quantity1},
            {tier_price1:bl?.tier_price1},
            {tier_quantity2:bl?.tier_quantity2},
            {tier_price2:bl?.tier_price2},
            {tier_quantity3:bl?.tier_quantity3},
            {tier_price3:bl?.tier_price3},
            {my_weight:bl?.my_weight}
        ]);
        if(db.length>=1){return db[0];}
        db = await Crud.select('inventory_item',[
            {color_id:bl?.color_id},
            {color_name:bl?.color_name},
            // {quantity:bl?.quantity},
            {new_or_used:bl?.new_or_used},
            {completeness:bl?.completeness},
            // {unit_price:bl?.unit_price},
            {bind_id:bl?.bind_id},
            {description:bl?.description},
            {remarks:bl?.remarks},
            {bulk:bl?.bulk},
            {is_retain:bl?.is_retain},
            {is_stock_room:bl?.is_stock_room},
            {stock_room_id:bl?.stock_room_id},
            {date_created:bl?.date_created},
            {my_cost:bl?.my_cost},
            {sale_rate:bl?.sale_rate},
            {tier_quantity1:bl?.tier_quantity1},
            {tier_price1:bl?.tier_price1},
            {tier_quantity2:bl?.tier_quantity2},
            {tier_price2:bl?.tier_price2},
            {tier_quantity3:bl?.tier_quantity3},
            {tier_price3:bl?.tier_price3},
            {my_weight:bl?.my_weight}
        ]);
        if(db.length>=1){return db[0];}
        db = await Crud.select('inventory_item',[
            {color_id:bl?.color_id},
            {color_name:bl?.color_name},
            // {quantity:bl?.quantity},
            {new_or_used:bl?.new_or_used},
            {completeness:bl?.completeness},
            {unit_price:bl?.unit_price},
            {bind_id:bl?.bind_id},
            // {description:bl?.description},
            {remarks:bl?.remarks},
            {bulk:bl?.bulk},
            {is_retain:bl?.is_retain},
            {is_stock_room:bl?.is_stock_room},
            {stock_room_id:bl?.stock_room_id},
            {date_created:bl?.date_created},
            {my_cost:bl?.my_cost},
            {sale_rate:bl?.sale_rate},
            {tier_quantity1:bl?.tier_quantity1},
            {tier_price1:bl?.tier_price1},
            {tier_quantity2:bl?.tier_quantity2},
            {tier_price2:bl?.tier_price2},
            {tier_quantity3:bl?.tier_quantity3},
            {tier_price3:bl?.tier_price3},
            {my_weight:bl?.my_weight}
        ]);
        if(db.length>=1){return db[0];}
        db = await Crud.select('inventory_item',[
            {color_id:bl?.color_id},
            {color_name:bl?.color_name},
            // {quantity:bl?.quantity},
            {new_or_used:bl?.new_or_used},
            {completeness:bl?.completeness},
            {unit_price:bl?.unit_price},
            {bind_id:bl?.bind_id},
            {description:bl?.description},
            // {remarks:bl?.remarks},
            {bulk:bl?.bulk},
            {is_retain:bl?.is_retain},
            {is_stock_room:bl?.is_stock_room},
            {stock_room_id:bl?.stock_room_id},
            {date_created:bl?.date_created},
            {my_cost:bl?.my_cost},
            {sale_rate:bl?.sale_rate},
            {tier_quantity1:bl?.tier_quantity1},
            {tier_price1:bl?.tier_price1},
            {tier_quantity2:bl?.tier_quantity2},
            {tier_price2:bl?.tier_price2},
            {tier_quantity3:bl?.tier_quantity3},
            {tier_price3:bl?.tier_price3},
            {my_weight:bl?.my_weight}
        ]);
        if(db.length>=1){return db[0];}
        db = await Crud.select('inventory_item',[
            {color_id:bl?.color_id},
            {color_name:bl?.color_name},
            // {quantity:bl?.quantity},
            {new_or_used:bl?.new_or_used},
            {completeness:bl?.completeness},
            // {unit_price:bl?.unit_price},
            {bind_id:bl?.bind_id},
            // {description:bl?.description},
            {remarks:bl?.remarks},
            {bulk:bl?.bulk},
            {is_retain:bl?.is_retain},
            {is_stock_room:bl?.is_stock_room},
            {stock_room_id:bl?.stock_room_id},
            {date_created:bl?.date_created},
            {my_cost:bl?.my_cost},
            {sale_rate:bl?.sale_rate},
            {tier_quantity1:bl?.tier_quantity1},
            {tier_price1:bl?.tier_price1},
            {tier_quantity2:bl?.tier_quantity2},
            {tier_price2:bl?.tier_price2},
            {tier_quantity3:bl?.tier_quantity3},
            {tier_price3:bl?.tier_price3},
            {my_weight:bl?.my_weight}
        ]);
        if(db.length>=1){return db[0];}
        db = await Crud.select('inventory_item',[
            {color_id:bl?.color_id},
            {color_name:bl?.color_name},
            // {quantity:bl?.quantity},
            {new_or_used:bl?.new_or_used},
            {completeness:bl?.completeness},
            // {unit_price:bl?.unit_price},
            {bind_id:bl?.bind_id},
            // {description:bl?.description},
            // {remarks:bl?.remarks},
            {bulk:bl?.bulk},
            {is_retain:bl?.is_retain},
            {is_stock_room:bl?.is_stock_room},
            {stock_room_id:bl?.stock_room_id},
            {date_created:bl?.date_created},
            {my_cost:bl?.my_cost},
            {sale_rate:bl?.sale_rate},
            {tier_quantity1:bl?.tier_quantity1},
            {tier_price1:bl?.tier_price1},
            {tier_quantity2:bl?.tier_quantity2},
            {tier_price2:bl?.tier_price2},
            {tier_quantity3:bl?.tier_quantity3},
            {tier_price3:bl?.tier_price3},
            {my_weight:bl?.my_weight}
        ]);
        if(db.length>=1){return db[0];}
        return [];
}