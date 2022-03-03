const { Pool } = require("pg");
let pool = new Pool();

const Create = require("../db/create");
const BL_API = require("./api");
const Inventory_item = require("../db/models/inventory_item");
const Crud = require("../db/utils/crud");
const progress = require("../utils/progress");


module.exports = async function main(){
    await clean_address_name()
    await clean_inventory_item();
    await clean_item();
    await clean_order();
    await clean_order_cost();
    await clean_order_disp_cost();
    await clean_order_payment();
    await clean_order_shipping();
    await clean_shipping_address()
}

async function clean_order_shipping(){
    await Crud.DELETE("order_shipping",[
        {method:null},
        {method_id:null},
        {tracking_no:null},
        {tracking_link:null},
        {date_shipped:null}
    ]);
}


async function clean_address_name(){
    await Crud.DELETE("address_name",[
        {full:null},
        {first:null},
        {last:null}
    ]);
}

async function clean_inventory_item(){
    await Crud.DELETE("inventory_item",[
        { inventory_id: null }
        // { color_name: null },
        // { quantity:null},
        // { new_or_used: null },
        // { completeness: null },
        // { unit_price: null},
        // { bind_id: null },
        // { description: null },
        // { remarks: null },
        // { bulk: null },
        // { is_retain: null },
        // { is_stock_room: null },
        // { stock_room_id: null },
        // { date_created: null },
        // { my_cost: null },
        // { sale_rate: null },
        // { tier_quantity1: null },
        // { tier_quantity2: null },
        // { tier_quantity3: null },
        // { tier_price1: null },
        // { tier_price2: null },
        // { tier_price3: null },
        // { my_weight: null },
    ]);
}

async function clean_item(){
    await Crud.DELETE("item",[
        { no: null },
        { name: null },
        { type: null }
    ]);
}

async function clean_order(){
    await Crud.DELETE("order",[
        {tagCount:null},
        {tagsCaseSensitive:null},
        {description:null},
        {orders_total:null},
        {date_ordered:null},
        {date_status_changed:null},
        {seller_name:null},
        {store_name:null},
        {buyer_name:null},
        {buyer_email:null},
        {buyer_order_count:null},
        {require_insurance:null},
        {status:null},
        {is_invoiced:null},
        {is_filed:null},
        {drive_thru_sent:null},
        {salesTax_collected_by_bl:null},
        {vat_collected_by_bl:null},
        {remarks:null},
        {total_count:null},
        {unique_count:null},
        {total_weight:null}
    ]);
}

async function clean_order_cost(){
    await Crud.DELETE("order_cost",[
        {"currency_code":null},
        {"subtotal":null},
        {"grand_total":null},
        {"salestax_collected_by_bl":null},
        {"final_total":null},
        {"etc1":null},
        {"etc2":null},
        {"insurance":null},
        {"shipping":null},
        {"credit":null},
        {"coupon":null},
        {"vat_rate":null},
        {"vat_amount":null}
    ]);
}

async function clean_order_disp_cost(){
    await Crud.DELETE("order_disp_cost",[
        {"currency_code":null},
        {"subtotal":null},
        {"grand_total":null},
        {"salestax_collected_by_bl":null},
        {"final_total":null},
        {"etc1":null},
        {"etc2":null},
        {"insurance":null},
        {"shipping":null},
        {"credit":null},
        {"coupon":null},
        {"vat_rate":null},
        {"vat_amount":null}
    ]);
}

async function clean_order_payment(){
    await Crud.DELETE("order_payment",[
        {"method":null},
        {"currency_code":null},
        {"date_paid":null},
        {"status":null}
    ]);
}

async function clean_shipping_address(){
    await Crud.DELETE("shipping_address",[
        {"full":null},
        {"address1":null},
        {"address2":null},
        {"country_code":null},
        {"city":null},
        {"state":null},
        {"postal_code":null}
    ]);
}