const OAuth = require('oauth');
const { Pool } = require("pg");
const Crud = require('./utils/crud');
let pool = new Pool();

async function address_name(
    full,
    first,
    last
) {
    const client = await pool.connect();
    let text = `SELECT fyrebrick_id FROM address_name WHERE 
    "full" = $1 AND
    "first" = $2 AND 
    "last" = $3`;
    let values = [...arguments];
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //none found creating address_name
        let prep_address_name = {
            text:`
            INSERT INTO address_name (
                "full",
                "first",
                "last"
            ) VALUES ($1,$2,$3)
            RETURNING fyrebrick_id
            `,
            values:[
                ...arguments
            ]
        }
        
        let db_address_name = (await client.query(prep_address_name.text,prep_address_name.values)).rows[0];
        client.release();
        return db_address_name.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("address_name",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    let sqlVal =  rows[0].fyrebrick_id;
    client.release();
    return sqlVal;
}

async function shipping_address(
    full,
    address1,
    address2,
    country_code,
    city,
    state,
    postal_code,
    address_name_fyrebrick_id
){
    const client = await pool.connect();
    let text = `SELECT fyrebrick_id FROM shipping_address WHERE 
        "full" = $1 AND
        address1 = $2 AND
        address2 = $3 AND 
        country_code = $4 AND
        city = $5 AND 
        "state" = $6 AND 
        postal_code = $7 AND
        address_name_fyrebrick_id = $8
    `;
    let values = [...arguments];
    let rows = (await client.query(text,values)).rows;
    if(rows.length==0){
        //create shipping_address
        let prep_shipping_address = {
            text:`
            INSERT INTO shipping_address (
                "full",
                address1,
                address2,
                country_code,
                city,
                "state",
                postal_code,
                address_name_fyrebrick_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING fyrebrick_id
            `,
            values:[...arguments]
        }
        
        let db_shipping_address = (await client.query(prep_shipping_address.text,prep_shipping_address.values)).rows[0];
        client.release();
        return db_shipping_address.fyrebrick_id;
    }else if (rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("shipping_address",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    let sqlVal = rows[0].fyrebrick_id;
    client.release();
    return sqlVal;

}

async function order_cost(
    currency_code,
    subtotal,
    grand_total,
    salestax_collected_by_bl,
    final_total,
    etc1,
    etc2,
    insurance,
    shipping,
    credit,
    coupon,
    vat_rate,
    vat_amount
){
    const client = await pool.connect();
    let text = `SELECT fyrebrick_id  FROM order_cost WHERE
    currency_code = $1 AND 
    subtotal = $2 AND
    grand_total = $3 AND
    salestax_collected_by_bl = $4 AND
    final_total = $5 AND
    etc1 = $6 AND
    etc2 = $7 AND
    insurance = $8 AND
    shipping = $9 AND
    credit = $10 AND
    coupon = $11 AND 
    vat_rate = $12 AND
    vat_amount = $13
    `;
    let values = [...arguments];
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_order_cost = {
            text: `
            INSERT INTO "order_cost" (
                currency_code,
                subtotal,
                grand_total,
                salestax_collected_by_bl,
                final_total,
                etc1,
                etc2,
                insurance,
                shipping,
                credit,
                coupon,
                vat_rate,
                vat_amount
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING fyrebrick_id
            `,
            values: [...arguments]
        };
        
        let db_order_cost = (await client.query(prep_order_cost.text,prep_order_cost.values)).rows[0];
        client.release();
        return db_order_cost.fyrebrick_id;
    }else if (rows.length===1){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("order_cost",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    let sqlVal = rows[0].fyrebrick_id;
    client.release();
    return sqlVal;
}

async function order_payment(
    method,
    currency_code,
    date_paid,
    status
    ){
        const client = await pool.connect();
        let text = `
        SELECT fyrebrick_id FROM order_payment WHERE 
        method = $1 AND
        currency_code = $2 AND
        date_paid = $3 AND
        "status" = $4
        `
        let values = [...arguments];
        let rows = (await client.query(text,values)).rows;
        if(rows.length===0){
            //create 
            let prep_order_payment = {
                text: `
                    INSERT INTO order_payment (
                        method,
                        currency_code,
                        date_paid,
                        "status"
                    ) VALUES ($1,$2,$3,$4)
                    RETURNING fyrebrick_id
                `,
                values:[...arguments]
            };
            
            let db_order_payment = (await client.query(prep_order_payment.text,prep_order_payment.values)).rows[0];
            client.release();
            return db_order_payment.fyrebrick_id;
        }else if (rows.length>=2){
            let deletingRows = rows.filter((r,i)=>i!==0);
            rows = rows.slice(1)
            for await (let deletingRow of deletingRows){
               await Crud.DELETE("order_payment",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
            }
        }
        let sqlVal =  rows[0].fyrebrick_id;
        return sqlVal;
    }

async function order_disp_cost(
    currency_code,
    subtotal,
    grand_total,
    salesTax_collected_by_bl,
    final_total,
    etc1,
    etc2,
    insurance,
    shipping,
    credit,
    coupon,
    vat_rate,
    vat_amount
){
    const client = await pool.connect();
    let text = `SELECT fyrebrick_id FROM order_disp_cost WHERE
    currency_code = $1 AND
    subtotal = $2 AND
    grand_total = $3 AND
    salesTax_collected_by_bl = $4 AND
    final_total = $5 AND
    etc1 = $6 AND
    etc2 = $7 AND
    insurance = $8 AND
    shipping = $9 AND
    credit = $10 AND
    coupon = $11 AND 
    vat_rate = $12 AND
    vat_amount = $13`
    let values = [...arguments];
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_order_disp_cost = {
            text : `INSERT INTO order_disp_cost (
                currency_code,
                subtotal,
                grand_total,
                salesTax_collected_by_bl,
                final_total,
                etc1,
                etc2,
                insurance,
                shipping,
                credit,
                coupon,
                vat_rate,
                vat_amount
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING fyrebrick_id
            `,
            values:[...arguments]
        }
        
        let db_order_disp_cost = (await client.query(prep_order_disp_cost.text,prep_order_disp_cost.values)).rows[0];
        client.release();
        return db_order_disp_cost.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("order_disp_cost",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    let sqlVal = rows[0].fyrebrick_id;
    return sqlVal;
}

async function order_shipping(
    method,
    method_id,
    tracking_no,
    tracking_link,
    date_shipped,
    shipping_address_fyrebrick_id
){
    const client = await pool.connect();
    let text = `SELECT fyrebrick_id FROM order_shipping WHERE
    method = $1 AND
    "method_id" = $2 AND
    tracking_no = $3 AND
    tracking_link = $4 AND
    date_shipped = $5 AND 
    shipping_address_fyrebrick_id = $6
    `;
    let values = [...arguments];
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_order_shipping = {
            text: `
            INSERT INTO order_shipping (
                method,
                "method_id",
                tracking_no,
                tracking_link,
                date_shipped,
                shipping_address_fyrebrick_id
            ) VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING fyrebrick_id
            `,
            values:[...arguments]
        };
        
        let db_order_shipping = (await client.query(prep_order_shipping.text,prep_order_shipping.values)).rows[0];
        client.release();
        return db_order_shipping.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("order_shipping",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    client.release();
    return rows[0].fyrebrick_id;
}

async function order(
    tagCount,
    tagsCaseSensitive,
    description,
    orders_checked,
    orders_total,
    order_id,
    date_ordered,
    date_status_changed,
    seller_name,
    store_name,
    buyer_name,
    buyer_email,
    buyer_order_count,
    require_insurance,
    status,
    is_invoiced,
    is_filed,
    drive_thru_sent,
    salesTax_collected_by_bl,
    vat_collected_by_bl,
    remarks,
    total_count,
    unique_count,
    total_weight,
    order_payment_fyrebrick_id,
    order_cost_fyrebrick_id,
    order_disp_cost_fyrebrick_id,
    order_shipping_fyrebrick_id,
    order_tags_fyrebrick_id
){
    let text = `SELECT fyrebrick_id FROM "order" WHERE
    tagCount = $1 AND
    tagsCaseSensitive = $2 AND
    "description" = $3 AND
    orders_checked = $4 AND
    orders_total = $5 AND
    order_id = $6 AND
    date_ordered = $7 AND
    date_status_changed = $8 AND
    seller_name = $9 AND
    store_name = $10 AND
    buyer_name = $11 AND
    buyer_email = $12 AND
    buyer_order_count = $13 AND
    require_insurance = $14 AND
    "status" = $15 AND
    is_invoiced = $16 AND
    is_filed = $17 AND
    drive_thru_sent = $18 AND
    salesTax_collected_by_bl = $19 AND
    vat_collected_by_bl = $20 AND
    remarks = $21 AND
    total_count = $22 AND
    unique_count = $23 AND
    total_weight = $24 AND
    order_payment_fyrebrick_id = $25 AND
    order_cost_fyrebrick_id = $26 AND
    order_disp_cost_fyrebrick_id = $27 AND
    order_shipping_fyrebrick_id = $28 AND
    order_tags_fyrebrick_id = $29
    `
    let values = [...arguments];
    const client = await pool.connect();
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_order = {
            text : `
            INSERT INTO "order" (
                tagCount,
                tagsCaseSensitive,
                "description",
                orders_checked,
                orders_total,
                order_id,
                date_ordered,
                date_status_changed,
                seller_name,
                store_name,
                buyer_name,
                buyer_email,
                buyer_order_count,
                require_insurance,
                "status",
                is_invoiced,
                is_filed,
                drive_thru_sent,
                salesTax_collected_by_bl,
                vat_collected_by_bl,
                remarks,
                total_count,
                unique_count,
                total_weight,
                order_payment_fyrebrick_id,
                order_cost_fyrebrick_id,
                order_disp_cost_fyrebrick_id,
                order_shipping_fyrebrick_id,
                order_tags_fyrebrick_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
            RETURNING fyrebrick_id
            `,
            values : [...arguments]
        }
        
        let db_order = (await client.query(prep_order.text,prep_order.values)).rows[0];
        client.release();
        return db_order.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("order",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    client.release();
    return rows[0].fyrebrick_id;
}

async function item(
    no,
    name,
    type,
    category_id
){
    let text = `SELECT fyrebrick_id FROM item WHERE
    "no" = $1 AND
    "name" = $2 AND
    "type" = $3 AND
    category_id = $4
    `;
    let values = [...arguments];
    const client = await pool.connect();
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_item = {
            text : `
            INSERT INTO item (
                "no",
                "name",
                "type",
                category_id
            ) VALUES ($1,$2,$3,$4)
            RETURNING fyrebrick_id
            `,
            values : [...arguments]
        }
        
        let db_item = (await client.query(prep_item.text,prep_item.values)).rows[0];
        client.release();
        return db_item.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
            await Crud.DELETE("item",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    client.release();
    return rows[0].fyrebrick_id;
}

async function order_tags(
    tags
){
    let text = `SELECT fyrebrick_id FROM order_tags WHERE
    tags = $1
    `;
    let values = [...arguments];
    const client = await pool.connect();
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_order_tags = {
            text: `
            INSERT INTO order_tags (
                tags
            ) VALUES ($1)
            RETURNING fyrebrick_id
            `,
            values:[...arguments]
        };
        
        let db_order_tags = (await client.query(prep_order_tags.text,prep_order_tags.values)).rows[0];
        client.release();
        return db_order_tags.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("order_tags",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    client.release();
    return rows[0].fyrebrick_id;
}

async function inventory_item(
    color_id,
    color_name,
    quantity,
    new_or_used,
    completeness,
    unit_price,
    bind_id,
    description,
    remarks,
    bulk,
    is_retain,
    is_stock_room,
    stock_room_id,
    date_created,
    my_cost,
    sale_rate,
    tier_quantity1,
    tier_quantity2,
    tier_quantity3,
    tier_price1,
    tier_price2,
    tier_price3,
    my_weight,
    inventory_id,
){
    let text = `SELECT fyrebrick_id FROM inventory_item WHERE
    color_id = $1 AND
    color_name = $2 AND
    "quantity" = $3 AND
    new_or_used = $4 AND
    completeness = $5 AND
    unit_price = $6 AND
    bind_id = $7 AND
    "description" = $8 AND
    remarks = $9 AND
    bulk = $10 AND
    is_retain = $11 AND
    is_stock_room = $12 AND
    stock_room_id = $13 AND
    date_created = $14 AND
    my_cost = $15 AND
    sale_rate = $16 AND
    tier_quantity1 = $17 AND
    tier_quantity2 = $18 AND
    tier_quantity3 = $19 AND
    tier_price1 = $20 AND
    tier_price2 = $21 AND
    tier_price3 = $22 AND
    my_weight = $23 AND
    inventory_id = $24
    `;
    let values = [...arguments];
    const client = await pool.connect();
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_inventory_item = {
            text: `
            INSERT INTO inventory_item (
                color_id,
                color_name,
                "quantity",
                new_or_used,
                completeness,
                unit_price,
                bind_id,
                "description",
                remarks,
                bulk,
                is_retain,
                is_stock_room,
                stock_room_id,
                date_created,
                my_cost,
                sale_rate,
                tier_quantity1,
                tier_quantity2,
                tier_quantity3,
                tier_price1,
                tier_price2,
                tier_price3,
                my_weight,
                inventory_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
            RETURNING fyrebrick_id
            `,
            values:[...arguments]
        };
        
        let db_inventory_item = (await client.query(prep_inventory_item.text,prep_inventory_item.values)).rows[0];
        client.release();
        return db_inventory_item.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("inventory_item",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    client.release();
    return rows[0].fyrebrick_id;
}

async function order_item(
    quantity,
    inventory_item_fyrebrick_id,
    item_fyrebrick_id,
    batch,
    order_fyrebrick_id
){
    let text = `SELECT fyrebrick_id FROM order_item WHERE
    "quantity" = $1 AND
    inventory_item_fyrebrick_id = $2 AND
    item_fyrebrick_id = $3 AND
    batch = $4 AND
    order_fyrebrick_id = $5
    `;
    let values = [...arguments];
    const client = await pool.connect();
    let rows = (await client.query(text,values)).rows;
    if(rows.length===0){
        //create
        let prep_order_item = {
            text: `
            INSERT INTO order_item (
                "quantity",
                inventory_item_fyrebrick_id,
                item_fyrebrick_id,
                batch,
                order_fyrebrick_id
            ) VALUES ($1,$2,$3,$4,$5)
            RETURNING fyrebrick_id
            `,
            values:[...arguments]
        };
        
        let db_order_item = (await client.query(prep_order_item.text,prep_order_item.values)).rows[0];
        client.release();
        return db_order_item.fyrebrick_id;
    }else if(rows.length>=2){
        let deletingRows = rows.filter((r,i)=>i!==0);
        rows = rows.slice(1)
        for await (let deletingRow of deletingRows){
           await Crud.DELETE("order_item",[{fyrebrick_id:deletingRow.fyrebrick_id}]);
        }
    }
    client.release();
    return rows[0].fyrebrick_id;
}

module.exports = {
    address_name,
    shipping_address,
    order_cost,
    order_payment,
    order_disp_cost,
    order_shipping,
    order,
    order_tags,
    inventory_item,
    item,
    order_item
}

function fix_dubble(fyrebrick_id_array, table){
    // this function resolves the doules in a table
}