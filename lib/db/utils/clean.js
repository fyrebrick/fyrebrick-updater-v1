const Crud = require("./crud");

const inventory_item = () => {
    Crud.delete("inventory_item",[
        {consumer_key:null},
        {color_id:null},
        {color_name:null},
        {quantity:null},
        {new_or_used:null},
        {completeness:null},
        {unit_price:null},
        {bind_id:null},
        {description:null},
        {remarks:null},
        {bulk:null},
        {is_retain:null},
        {is_stock_room:null},
        {stock_room_id:null},
        {date_created:null},
        {my_cost:null},
        {sale_rate:null},
        {tier_quantity1:null},
        {tier_quantity2:null},
        {tier_quantity3:null},
        {tier_price2:null},
        {tier_price3:null},
        {my_weight:null},
        {inventory_id:null}
    ]);
}

