const { Pool } = require("pg");
let pool = new Pool();

const Create = require("../db/create");
const BL_API = require("./api");
const Inventory_item = require("../db/models/inventory_item");
const Crud = require("../db/utils/crud");


module.exports = async function main(){
    clean_address_name()
    clean_inventory_item();
    clean_item();
    clean_order();
    clean_order_cost();
    clean_order_disp_cost();
    clean_order_payment();
    clean_shipping_address();
}

function clean_address_name(){
    Crud.DELETE("address_name",[
        {full:null},
        {first:null},
        {last:null}
    ]);
}

function clean_inventory_item(){
    Crud.DELETE("inventory_item",[
        { color_id: null },
        { color_name: null },
        { quantity:null},
        { new_or_used: null },
        { completeness: null },
        { unit_price: null},
        { bind_id: null },
        { description: null },
        { remarks: null },
        { bulk: null },
        { is_retain: null },
        { is_stock_room: null },
        { stock_room_id: null },
        { date_created: null },
        { my_cost: null },
        { sale_rate: null },
        { tier_quantity1: null },
        { tier_quantity2: null },
        { tier_quantity3: null },
        { tier_price1: null },
        { tier_price2: null },
        { tier_price3: null },
        { my_weight: null },
    ]);
}

function clean_item(){
    Crud.DELETE("item",[
        { no: null },
        { name: null },
        { type: null },
        { category_id: null }
    ]);
}

function clean_order(){
    Crud.DELETE("order",[
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

function clean_order_cost(){
    Crud.DELETE("order_cost",[
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

function clean_order_disp_cost(){
    Crud.DELETE("order_disp_cost",[
        {"currency_code":null},
        {"subtotal":null},
        {"grand_toorder?.payment?.currency_codetal":null},
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

function clean_order_payment(){
    Crud.DELETE("order_disp_cost",[
        {"method":null},
        {"currency_code":null},
        {"date_paid":null},
        {"status":null}
    ]);
}

function clean_shipping_address(){
    Crud.DELETE("shipping_address",[
        {"full":null},
        {"address1":null},
        {"address2":null},
        {"country_code":null},
        {"city":null},
        {"state":null},
        {"postal_code":null}
    ]);
}