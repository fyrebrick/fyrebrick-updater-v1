/**
 * updateOrders.js
 * --
 * calling this script will update the orders in the database
 * updating only the orders that needs to be updated
 * @param {string} fyrebrick_id - the fyrebrick id of the user
 */

const { Pool } = require("pg");
let pool = new Pool();
const cliProgress = require("cli-progress");
const Create = require("../db/create");
const BL_API = require("./api");
const Inventory_item = require("../db/models/inventory_item");
const Crud = require("../db/utils/crud");

module.exports = async function main(fyrebrick_id,multiBar,user) {
  let data = await BL_API.get(
    "https://api.bricklink.com/api/store/v1/orders",
    fyrebrick_id
  );
  let progressBar = multiBar.create(data.length, 0,{description:"Update orders for "+user.username});
  // console.log("amount of orders: " + data.length);
  for await (let order of data) {
    // console.log("updating order: " + order.order_id);
    const client = await pool.connect();
    let db_order = (
      await client.query('SELECT * FROM "order" WHERE order_id = $1', [
        Number(order.order_id),
      ])
    ).rows[0];
    client.release();

    if (!db_order && order.status !== "PURGED") {
      // console.log("creating new order: " + order.order_id);
      //if the order is not purged by bl and it does not exist yet in the database -> create new order
      await create_new_order(order, fyrebrick_id);
    } else if (db_order) {
      // console.log("updating order: " + order.order_id);
      // order exists in internal database
      if (
        order.status === "PENDING" ||
        order.status === "UPDATED" ||
        order.status === "PROCESSING" ||
        order.status === "READY" ||
        order.status === "PAID" ||
        order.status === "PACKED"
      ) {
        // order is highly doubtfull to be updated
        await update_order(order, db_order, fyrebrick_id);
        await delay(500);
      } else {
        // order is highly unlikely to be updated
        await update_order_with_bl_data(order,db_order);
      }
    }
    progressBar.increment();
  }
  progressBar.stop();
};

async function update_order(
  order,
  db_order,
  fyrebrick_id,
  getBLextraData = true
) {
  if (getBLextraData) {
    order = {
      ...order,
      ...(await BL_API.get(
        "https://api.bricklink.com/api/store/v1/orders/" + order.order_id,
        fyrebrick_id
      )),
    };
  }
  let address_name_fyrebrick_id = await create_or_update_address_name(order);
  let shipping_address_fyrebrick_id = await create_or_update_shipping_address(order,address_name_fyrebrick_id);
  let order_shipping_fyrebrick_id = await create_or_update_order_shipping(order,shipping_address_fyrebrick_id);
  let order_cost_fyrebrick_id = await create_or_update_order_cost(order);
  let order_payment_fyrebrick_id = await create_or_update_order_payment(order);
  let order_disp_cost_fyrebrick_id = await create_or_update_order_disp_cost(order);
  let order_tags_fyrebrick_id = await create_order_tags(order);
  await create_or_update_items(order,fyrebrick_id,db_order.fyrebrick_id);
  await update_order_ids(
    db_order.fyrebrick_id,
    order_shipping_fyrebrick_id,
    order_cost_fyrebrick_id,
    order_payment_fyrebrick_id,
    order_disp_cost_fyrebrick_id,
    order_tags_fyrebrick_id
  );
}
async function create_new_order(order, fyrebrick_id) {
  order = {
    ...order,
    ...(await BL_API.get(
      "https://api.bricklink.com/api/store/v1/orders/" + order.order_id,
      fyrebrick_id
    )),
  };
  let address_name_fyrebrick_id = await create_or_update_address_name(order);
  let shipping_address_fyrebrick_id = await create_or_update_shipping_address(
    order,
    address_name_fyrebrick_id
  );
  let order_shipping_fyrebrick_id = await create_or_update_order_shipping(
    order,
    shipping_address_fyrebrick_id
  );
  let order_cost_fyrebrick_id = await create_or_update_order_cost(order);
  let order_payment_fyrebrick_id = await create_or_update_order_payment(order);
  let order_disp_cost_fyrebrick_id = await create_or_update_order_disp_cost(
    order
  );
  let order_tags_fyrebrick_id = await create_order_tags(order);
  await create_or_update_items(
    order,
    fyrebrick_id
  );
  let order_fyrebrick_id = await create_order(
    order,
    order_payment_fyrebrick_id,
    order_cost_fyrebrick_id,
    order_disp_cost_fyrebrick_id,
    order_shipping_fyrebrick_id,
    order_tags_fyrebrick_id
  );
  return order_items_fyrebrick_id_array;
}
async function update_order_with_bl_data(order, order_db) {
  let address_name_fyrebrick_id = await create_or_update_address_name(order);
  let shipping_address_fyrebrick_id = await create_or_update_shipping_address(
    order,
    address_name_fyrebrick_id
  );
  let order_shipping_fyrebrick_id = await create_or_update_order_shipping(
    order,
    shipping_address_fyrebrick_id
  );
  let order_cost_fyrebrick_id = await create_or_update_order_cost(order);
  let order_payment_fyrebrick_id = await create_or_update_order_payment(order);
  let order_disp_cost_fyrebrick_id = await create_or_update_order_disp_cost(
    order
  );
  let order_tags_fyrebrick_id = await create_order_tags(order);
  //   let order_fyrebrick_id = (await Crud.select("order",[{order_id:Number(order.order_id)}])).rows[0].fyrebrick_id;
  await update_order_ids(
    order_db.fyrebrick_id,
    order_shipping_fyrebrick_id,
    order_cost_fyrebrick_id,
    order_payment_fyrebrick_id,
    order_disp_cost_fyrebrick_id,
    order_tags_fyrebrick_id
  );
  await update_order_props(order_db.fyrebrick_id, order);
}
async function update_order_props(order_fyrebrick_id, order) {
  await Crud.update(
    "order",
    [
      { tagCount: order?.tagCount },
      { tagsCaseSensitive: order?.tagsCaseSensitive },
      { description: order?.description },
      { orders_total: order?.orders_total },
      { date_ordered: order?.date_ordered },
      { date_status_changed: order?.date_status_changed },
      { seller_name: order?.seller_name },
      { store_name: order?.store_name },
      { buyer_name: order?.buyer_name },
      { buyer_email: order?.buyer_email },
      { buyer_order_count: order?.buyer_order_count },
      { require_insurance: order?.require_insurance },
      { status: order?.status },
      { is_invoiced: order?.is_invoiced },
      { is_filed: order?.is_filed },
      { drive_thru_sent: order?.drive_thru_sent },
      { salesTax_collected_by_bl: order?.salesTax_collected_by_bl },
      { vat_collected_by_bl: order?.vat_collected_by_bl },
      { remarks: order?.remarks },
      { total_count: order?.total_count },
      { unique_count: order?.unique_count },
      { total_weight: order?.total_weight },
    ],
    order_fyrebrick_id
  );
}
async function update_order_ids(
  order_fyrebrick_id,
  order_shipping_fyrebrick_id,
  order_cost_fyrebrick_id,
  order_payment_fyrebrick_id,
  order_disp_cost_fyrebrick_id,
  order_tags_fyrebrick_id
) {
  // update the order with these new ids
  await Crud.update(
    "order",
    [
      { order_payment_fyrebrick_id: order_payment_fyrebrick_id },
      { order_cost_fyrebrick_id: order_cost_fyrebrick_id },
      { order_disp_cost_fyrebrick_id: order_disp_cost_fyrebrick_id },
      { order_shipping_fyrebrick_id: order_shipping_fyrebrick_id },
      { order_tags_fyrebrick_id: order_tags_fyrebrick_id },
    ],
    order_fyrebrick_id
  );
}
async function create_or_update_address_name(order) {
  let select_address_name_rows = await Crud.select("address_name", [
    { full: order?.shipping?.address?.name?.full },
    { first: order?.shipping?.address?.name?.first },
    { last: order?.shipping?.address?.name?.last },
  ]);
  let address_name_fyrebrick_id = undefined;
  if (select_address_name_rows.length == 0) {
    //creating a new address_name
    address_name_fyrebrick_id = await Create.address_name(
      order?.shipping?.address?.name?.full,
      order?.shipping?.address?.name?.first,
      order?.shipping?.address?.name?.last
    );
  } else {
    address_name_fyrebrick_id = select_address_name_rows[0].fyrebrick_id;
  }
  return address_name_fyrebrick_id;
}
async function create_or_update_shipping_address(
  order,
  address_name_fyrebrick_id
) {
  let select_shipping_address_rows = await Crud.select("shipping_address", [
    { full: order?.shipping?.address?.full },
    { address1: order?.shipping?.address?.address1 },
    { address2: order?.shipping?.address?.address2 },
    { country_code: order?.shipping?.address?.country_code },
    { city: order?.shipping?.address?.city },
    { state: order?.shipping?.address?.state },
    { postal_code: order?.shipping?.address?.postal_code },
  ]);
  let shipping_address_fyrebrick_id = undefined;
  if (select_shipping_address_rows.length === 0) {
    shipping_address_fyrebrick_id = await Create.shipping_address(
      order?.shipping?.address?.full,
      order?.shipping?.address?.address1,
      order?.shipping?.address?.address2,
      order?.shipping?.address?.country_code,
      order?.shipping?.address?.city,
      order?.shipping?.address?.state,
      order?.shipping?.address?.postal_code,
      address_name_fyrebrick_id
    );
  } else {
    shipping_address_fyrebrick_id =
      select_shipping_address_rows[0].fyrebrick_id;
  }
  return shipping_address_fyrebrick_id;
}
async function create_or_update_order_shipping(
  order,
  shipping_address_fyrebrick_id
) {
  let select_order_shipping_rows = await Crud.select("order_shipping", [
    { method: order?.shipping?.method },
    { method_id: order?.shipping?.method_id },
    { tracking_no: order?.shipping?.tracking_no },
    { tracking_link: order?.shipping?.tracking_link },
    { date_shipped: order?.shipping?.date_shipped },
  ]);
  let order_shipping_fyrebrick_id = undefined;
  if (select_order_shipping_rows.length !== 0) {
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  select_order_shipping_rows = await Crud.select("order_shipping", [
    { method: order?.shipping?.method },
    { method_id: order?.shipping?.method_id },
    { tracking_no: order?.shipping?.tracking_no },
    { tracking_link: order?.shipping?.tracking_link },
  ]);
  if (select_order_shipping_rows.length !== 0) {
    await Crud.update(
      "order_shipping",
      [{ date_shipped: order?.shipping?.date_shipped }],
      select_order_shipping_rows[0].fyrebrick_id
    );
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  select_order_shipping_rows = await Crud.select("order_shipping", [
    { method: order?.shipping?.method },
    { method_id: order?.shipping?.method_id },
    { tracking_no: order?.shipping?.tracking_no },
    { date_shipped: order?.shipping?.date_shipped },
  ]);
  if (select_order_shipping_rows.length !== 0) {
    await Crud.update(
      "order_shipping",
      [{ tracking_link: order?.shipping?.tracking_link }],
      select_order_shipping_rows[0].fyrebrick_id
    );
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  select_order_shipping_rows = await Crud.select("order_shipping", [
    { method: order?.shipping?.method },
    { method_id: order?.shipping?.method_id },
    { tracking_link: order?.shipping?.tracking_link },
    { date_shipped: order?.shipping?.date_shipped },
  ]);
  if (select_order_shipping_rows.length !== 0) {
    await Crud.update(
      "order_shipping",
      [{ tracking_no: order?.shipping?.tracking_no }],
      select_order_shipping_rows[0].fyrebrick_id
    );
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  select_order_shipping_rows = await Crud.select("order_shipping", [
    { method_id: order?.shipping?.method_id },
    { tracking_no: order?.shipping?.tracking_no },
    { tracking_link: order?.shipping?.tracking_link },
    { date_shipped: order?.shipping?.date_shipped },
  ]);
  if (select_order_shipping_rows.length !== 0) {
    await Crud.update(
      "order_shipping",
      [{ method: order?.shipping?.method }],
      select_order_shipping_rows[0].fyrebrick_id
    );
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  select_order_shipping_rows = await Crud.select("order_shipping", [
    { method: order?.shipping?.method },
    { tracking_no: order?.shipping?.tracking_no },
    { date_shipped: order?.shipping?.date_shipped },
  ]);
  if (select_order_shipping_rows.length !== 0) {
    await Crud.update(
      "order_shipping",
      [
        { tracking: order?.shipping?.tracking },
        { method_id: order?.shipping?.method_id },
      ],
      select_order_shipping_rows[0].fyrebrick_id
    );
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  select_order_shipping_rows = await Crud.select("order_shipping", [
    { method: order?.shipping?.method },
    { method_id: order?.shipping?.method_id },
    { date_shipped: order?.shipping?.date_shipped },
  ]);
  if (select_order_shipping_rows.length !== 0) {
    await Crud.update(
      "order_shipping",
      [
        { tracking_no: order?.shipping?.tracking_no },
        { tracking_link: order?.shipping?.tracking_link },
      ],
      select_order_shipping_rows[0].fyrebrick_id
    );
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  select_order_shipping_rows = await Crud.select("order_shipping", [
    { method: order?.shipping?.method },
    { method_id: order?.shipping?.method_id },
  ]);
  if (select_order_shipping_rows.length !== 0) {
    await Crud.update(
      "order_shipping",
      [
        { tracking_no: order?.shipping?.tracking_no },
        { tracking_link: order?.shipping?.tracking_link },
      ],
      select_order_shipping_rows[0].fyrebrick_id
    );
    return select_order_shipping_rows[0].fyrebrick_id;
  }

  order_shipping_fyrebrick_id = await Create.order_shipping(
    order?.shipping?.method,
    order?.shipping?.method_id,
    order?.shipping?.tracking_no,
    order?.shipping?.tracking_link,
    order?.shipping?.date_shipped,
    shipping_address_fyrebrick_id
  );
  return order_shipping_fyrebrick_id;
}
async function create_or_update_order_cost(order) {
  let select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { subtotal: order?.cost?.subtotal },
    { grand_total: order?.cost?.grand_total },
    { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
    { final_total: order?.cost?.final_total },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { insurance: order?.cost?.insurance },
    { shipping: order?.cost?.shipping },
    { credit: order?.cost?.credit },
    { coupon: order?.cost?.coupon },
    { vat_rate: order?.cost?.vat_rate },
    { vat_amount: order?.cost?.vat_amount },
  ]);
  if (select_order_cost_rows.length !== 0) {
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { insurance: order?.cost?.insurance },
    { shipping: order?.cost?.shipping },
    { credit: order?.cost?.credit },
    { coupon: order?.cost?.coupon },
    { vat_rate: order?.cost?.vat_rate },
    { vat_amount: order?.cost?.vat_amount },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { insurance: order?.cost?.insurance },
    { credit: order?.cost?.credit },
    { coupon: order?.cost?.coupon },
    { vat_rate: order?.cost?.vat_rate },
    { vat_amount: order?.cost?.vat_amount },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { shipping: order?.cost?.shipping },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { shipping: order?.cost?.shipping },
    { credit: order?.cost?.credit },
    { coupon: order?.cost?.coupon },
    { vat_rate: order?.cost?.vat_rate },
    { vat_amount: order?.cost?.vat_amount },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { insurance: order?.cost?.insurance },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { insurance: order?.cost?.insurance },
    { shipping: order?.cost?.shipping },
    { coupon: order?.cost?.coupon },
    { vat_rate: order?.cost?.vat_rate },
    { vat_amount: order?.cost?.vat_amount },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { credit: order?.cost?.credit },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { insurance: order?.cost?.insurance },
    { shipping: order?.cost?.shipping },
    { credit: order?.cost?.credit },
    { coupon: order?.cost?.coupon },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { vat_rate: order?.cost?.vat_rate },
        { vat_amount: order?.cost?.vat_amount },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { insurance: order?.cost?.insurance },
    { shipping: order?.cost?.shipping },
    { credit: order?.cost?.credit },
    { coupon: order?.cost?.coupon },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { vat_rate: order?.cost?.vat_rate },
        { vat_amount: order?.cost?.vat_amount },
        { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { shipping: order?.cost?.shipping },
    { credit: order?.cost?.credit },
    { coupon: order?.cost?.coupon },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { vat_rate: order?.cost?.vat_rate },
        { vat_amount: order?.cost?.vat_amount },
        { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
        { insurance: order?.cost?.insurance },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { shipping: order?.cost?.shipping },
    { coupon: order?.cost?.coupon },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { vat_rate: order?.cost?.vat_rate },
        { vat_amount: order?.cost?.vat_amount },
        { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
        { insurance: order?.cost?.insurance },
        { credit: order?.cost?.credit },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  select_order_cost_rows = await Crud.select("order_cost", [
    { currency_code: order?.cost?.currency_code },
    { etc1: order?.cost?.etc1 },
    { etc2: order?.cost?.etc2 },
    { coupon: order?.cost?.coupon },
  ]);
  if (select_order_cost_rows.length !== 0) {
    await Crud.update(
      "order_cost",
      [
        { subtotal: order?.cost?.subtotal },
        { grand_total: order?.cost?.grand_total },
        { final_total: order?.cost?.final_total },
        { vat_rate: order?.cost?.vat_rate },
        { vat_amount: order?.cost?.vat_amount },
        { salestax_collected_by_bl: order?.cost?.salesTax_collected_by_bl },
        { insurance: order?.cost?.insurance },
        { credit: order?.cost?.credit },
        { shipping: order?.cost?.shipping },
      ],
      select_order_cost_rows[0].fyrebrick_id
    );
    return select_order_cost_rows[0].fyrebrick_id;
  }

  let order_cost_fyrebrick_id = await Create.order_cost(
    order?.cost?.currency_code,
    order?.cost?.subtotal,
    order?.cost?.grand_total,
    order?.cost?.salesTax_collected_by_bl,
    order?.cost?.final_total,
    order?.cost?.etc1,
    order?.cost?.etc2,
    order?.cost?.insurance,
    order?.cost?.shipping,
    order?.cost?.credit,
    order?.cost?.coupon,
    order?.cost?.vat_rate,
    order?.cost?.vat_amount
  );
  return order_cost_fyrebrick_id;
}
async function create_or_update_order_payment(order) {
  let select_order_payment_rows = await Crud.select("order_payment", [
    { method: order?.payment?.method },
    { currency_code: order?.payment?.currency_code },
    { date_paid: order?.payment?.date_paid },
    { status: order?.payment?.status },
  ]);
  if (select_order_payment_rows.length !== 0) {
    return select_order_payment_rows[0].fyrebrick_id;
  }

  select_order_payment_rows = await Crud.select("order_payment", [
    { method: order?.payment?.method },
    { currency_code: order?.payment?.currency_code },
    { date_paid: order?.payment?.date_paid },
  ]);
  if (select_order_payment_rows.length !== 0) {
    await Crud.update(
      "order_payment",
      [{ status: order?.payment?.status }],
      select_order_payment_rows[0].fyrebrick_id
    );
    return select_order_payment_rows[0].fyrebrick_id;
  }

  select_order_payment_rows = await Crud.select("order_payment", [
    { method: order?.payment?.method },
    { date_paid: order?.payment?.date_paid },
    { status: order?.payment?.status },
  ]);
  if (select_order_payment_rows.length !== 0) {
    await Crud.update(
      "order_payment",
      [{ currency_code: order?.payment?.currency_code }],
      select_order_payment_rows[0].fyrebrick_id
    );
    return select_order_payment_rows[0].fyrebrick_id;
  }

  select_order_payment_rows = await Crud.select("order_payment", [
    { currency_code: order?.payment?.currency_code },
    { date_paid: order?.payment?.date_paid },
    { status: order?.payment?.status },
  ]);
  if (select_order_payment_rows.length !== 0) {
    await Crud.update(
      "order_payment",
      [{ method: order?.payment?.method }],
      select_order_payment_rows[0].fyrebrick_id
    );
    return select_order_payment_rows[0].fyrebrick_id;
  }

  order_payment_fyrebrick_id = await Create.order_payment(
    order?.payment?.method,
    order?.payment?.currency_code,
    order?.payment?.date_paid,
    order?.payment?.status
  );
  return order_payment_fyrebrick_id;
}
async function create_or_update_order_disp_cost(order) {
  let select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { subtotal: order?.disp_cost?.subtotal },
    { grand_total: order?.disp_cost?.grand_total },
    { salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl },
    { final_total: order?.disp_cost?.final_total },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { insurance: order?.disp_cost?.insurance },
    { shipping: order?.disp_cost?.shipping },
    { credit: order?.disp_cost?.credit },
    { coupon: order?.disp_cost?.coupon },
    { vat_rate: order?.disp_cost?.vat_rate },
    { vat_amount: order?.disp_cost?.vat_amount },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { insurance: order?.disp_cost?.insurance },
    { shipping: order?.disp_cost?.shipping },
    { credit: order?.disp_cost?.credit },
    { coupon: order?.disp_cost?.coupon },
    { vat_rate: order?.disp_cost?.vat_rate },
    { vat_amount: order?.disp_cost?.vat_amount },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { insurance: order?.disp_cost?.insurance },
    { credit: order?.disp_cost?.credit },
    { coupon: order?.disp_cost?.coupon },
    { vat_rate: order?.disp_cost?.vat_rate },
    { vat_amount: order?.disp_cost?.vat_amount },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { shipping: order?.disp_cost?.shipping },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { shipping: order?.disp_cost?.shipping },
    { credit: order?.disp_cost?.credit },
    { coupon: order?.disp_cost?.coupon },
    { vat_rate: order?.disp_cost?.vat_rate },
    { vat_amount: order?.disp_cost?.vat_amount },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { insurance: order?.disp_cost?.insurance },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { insurance: order?.disp_cost?.insurance },
    { shipping: order?.disp_cost?.shipping },
    { coupon: order?.disp_cost?.coupon },
    { vat_rate: order?.disp_cost?.vat_rate },
    { vat_amount: order?.disp_cost?.vat_amount },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { credit: order?.disp_cost?.credit },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { insurance: order?.disp_cost?.insurance },
    { shipping: order?.disp_cost?.shipping },
    { credit: order?.disp_cost?.credit },
    { coupon: order?.disp_cost?.coupon },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { vat_rate: order?.disp_cost?.vat_rate },
        { vat_amount: order?.disp_cost?.vat_amount },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { insurance: order?.disp_cost?.insurance },
    { shipping: order?.disp_cost?.shipping },
    { credit: order?.disp_cost?.credit },
    { coupon: order?.disp_cost?.coupon },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { vat_rate: order?.disp_cost?.vat_rate },
        { vat_amount: order?.disp_cost?.vat_amount },
        {
          salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl,
        },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { shipping: order?.disp_cost?.shipping },
    { credit: order?.disp_cost?.credit },
    { coupon: order?.disp_cost?.coupon },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { vat_rate: order?.disp_cost?.vat_rate },
        { vat_amount: order?.disp_cost?.vat_amount },
        {
          salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl,
        },
        { insurance: order?.disp_cost?.insurance },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { shipping: order?.disp_cost?.shipping },
    { coupon: order?.disp_cost?.coupon },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { vat_rate: order?.disp_cost?.vat_rate },
        { vat_amount: order?.disp_cost?.vat_amount },
        {
          salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl,
        },
        { insurance: order?.disp_cost?.insurance },
        { credit: order?.disp_cost?.credit },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  select_order_disp_cost_rows = await Crud.select("order_disp_cost", [
    { currency_code: order?.disp_cost?.currency_code },
    { etc1: order?.disp_cost?.etc1 },
    { etc2: order?.disp_cost?.etc2 },
    { coupon: order?.disp_cost?.coupon },
  ]);
  if (select_order_disp_cost_rows.length !== 0) {
    await Crud.update(
      "order_disp_cost",
      [
        { subtotal: order?.disp_cost?.subtotal },
        { grand_total: order?.disp_cost?.grand_total },
        { final_total: order?.disp_cost?.final_total },
        { vat_rate: order?.disp_cost?.vat_rate },
        { vat_amount: order?.disp_cost?.vat_amount },
        {
          salestax_collected_by_bl: order?.disp_cost?.salesTax_collected_by_bl,
        },
        { insurance: order?.disp_cost?.insurance },
        { credit: order?.disp_cost?.credit },
        { shipping: order?.disp_cost?.shipping },
      ],
      select_order_disp_cost_rows[0].fyrebrick_id
    );
    return select_order_disp_cost_rows[0].fyrebrick_id;
  }

  let order_disp_cost_fyrebrick_id = await Create.order_disp_cost(
    order?.disp_cost?.currency_code,
    order?.disp_cost?.subtotal,
    order?.disp_cost?.grand_total,
    order?.disp_cost?.salesTax_collected_by_bl,
    order?.disp_cost?.final_total,
    order?.disp_cost?.etc1,
    order?.disp_cost?.etc2,
    order?.disp_cost?.insurance,
    order?.disp_cost?.shipping,
    order?.disp_cost?.credit,
    order?.disp_cost?.coupon,
    order?.disp_cost?.vat_rate,
    order?.disp_cost?.vat_amount
  );
  return order_disp_cost_fyrebrick_id;
}
async function create_order_tags(order) {
  await Create.order_tags(order?.tags);
}
async function create_or_update_items(order, fyrebrick_id, order_fyrebrick_id) {
  order.items = await BL_API.get(
    "https://api.bricklink.com/api/store/v1/orders/" +
      Number(order.order_id) +
      "/items",
    fyrebrick_id
  );
  let order_items_preparation_array = [];
  if (order?.items) {
    await order?.items.forEach(async (batch, batchIndex) => {
      await batch.forEach(async (batch_order_item,batch_order_item_index) => {
        //check if already in db
        if (!batch_order_item?.inventory_id) {
          console.log(
            "Error! batch_order_item does not have inventory_id",
            batch_order_item
          );
          return;
        }
        //check if properties are the same (inventory_item)
        let temp_fyrebrick_inventory_item = await Crud.select("inventory_item", [{inventory_id: batch_order_item.inventory_id,}]);
        let fyrebrick_inventory_item = temp_fyrebrick_inventory_item[0];
        let inventory_item_fyrebrick_id = undefined;
        let temp_inventory_item_quantity = await Crud.select("inventory_item", [{ inventory_id: batch_order_item.inventory_id }])
        let inventory_item_quantity = Number(temp_inventory_item_quantity[0]?.quantity);
        if (!inventory_item_quantity && inventory_item_quantity !== 0) {
          inventory_item_quantity =
            (
              await Inventory_item.fetch(batch_order_item.inventory_id,fyrebrick_id)
              )?.quantity ?? 0;
        }
        
        if (
          !fyrebrick_inventory_item ||
          !fyrebrick_inventory_item.fyrebrick_id
        ) {
          //inventory_item not found, create it
          inventory_item_fyrebrick_id = await Create.inventory_item(
            batch_order_item?.color_id,
            batch_order_item?.color_name,
            inventory_item_quantity, //because this quantity is from the order itself not the inventory item
            batch_order_item?.new_or_used,
            batch_order_item?.completeness,
            batch_order_item?.unit_price,
            batch_order_item?.bind_id,
            batch_order_item?.description,
            batch_order_item?.remarks,
            batch_order_item?.bulk,
            batch_order_item?.is_retain,
            batch_order_item?.is_stock_room,
            batch_order_item?.stock_room_id,
            batch_order_item?.date_created,
            batch_order_item?.my_cost,
            batch_order_item?.sale_rate,
            batch_order_item?.tier_quantity1,
            batch_order_item?.tier_quantity2,
            batch_order_item?.tier_quantity3,
            batch_order_item?.tier_price1,
            batch_order_item?.tier_price2,
            batch_order_item?.tier_price3,
            batch_order_item?.my_weight,
            batch_order_item.inventory_id
          );
        } //check if properties are different
        else if (
          (batch_order_item?.color_id ?? undefined) !==
            fyrebrick_inventory_item.color_id ||
          (batch_order_item?.color_name ?? undefined) !==
            fyrebrick_inventory_item.color_name ||
          (inventory_item_quantity ?? undefined) !==
            Number(fyrebrick_inventory_item.quantity) ||
          (batch_order_item?.new_or_used ?? undefined) !==
            fyrebrick_inventory_item.new_or_used ||
          (batch_order_item?.completeness ?? undefined) !==
            fyrebrick_inventory_item.completeness ||
          (batch_order_item?.unit_price ?? undefined) !==
            fyrebrick_inventory_item.unit_price ||
          (batch_order_item?.bind_id ?? undefined) !==
            fyrebrick_inventory_item.bind_id ||
          (batch_order_item?.description ?? undefined) !==
            fyrebrick_inventory_item.description ||
          (batch_order_item?.remarks ?? undefined) !==
            fyrebrick_inventory_item.remarks ||
          (batch_order_item?.bulk ?? undefined) !==
            fyrebrick_inventory_item.bulk ||
          (batch_order_item?.is_retain ?? undefined) !==
            fyrebrick_inventory_item.is_retain ||
          (batch_order_item?.is_stock_room ?? undefined) !==
            fyrebrick_inventory_item.is_stock_room ||
          (batch_order_item?.stock_room_id ?? undefined) !==
            fyrebrick_inventory_item.stock_room_id ||
          (batch_order_item?.date_created ?? undefined) !==
            fyrebrick_inventory_item.date_created ||
          (batch_order_item?.my_cost ?? undefined) !==
            fyrebrick_inventory_item.my_cost ||
          (batch_order_item?.sale_rate ?? undefined) !==
            fyrebrick_inventory_item.sale_rate ||
          (batch_order_item?.tier_quantity1 ?? undefined) !==
            fyrebrick_inventory_item.tier_quantity1 ||
          (batch_order_item?.tier_quantity2 ?? undefined) !==
            fyrebrick_inventory_item.tier_quantity2 ||
          (batch_order_item?.tier_quantity3 ?? undefined) !==
            fyrebrick_inventory_item.tier_quantity3 ||
          (batch_order_item?.tier_price1 ?? undefined) !==
            fyrebrick_inventory_item.tier_price1 ||
          (batch_order_item?.tier_price2 ?? undefined) !==
            fyrebrick_inventory_item.tier_price2 ||
          ((batch_order_item?.tier_price3 ?? undefined) !==
            fyrebrick_inventory_item.tier_price3 &&
            (batch_order_item?.my_weight ?? undefined) !==
              fyrebrick_inventory_item.my_weight)
        ) {
          //if properties are different, update it
          await Crud.update(
            "inventory_item",
            [
              { color_id: Number(batch_order_item?.color_id) ?? null },
              { color_name: batch_order_item?.color_name },
              { quantity: inventory_item_quantity },
              { new_or_used: batch_order_item?.new_or_used },
              { completeness: batch_order_item?.completeness },
              { unit_price: batch_order_item?.unit_price },
              { bind_id: batch_order_item?.bind_id },
              { description: batch_order_item?.description },
              { remarks: batch_order_item?.remarks },
              { bulk: batch_order_item?.bulk },
              { is_retain: batch_order_item?.is_retain },
              { is_stock_room: batch_order_item?.is_stock_room },
              { stock_room_id: batch_order_item?.stock_room_id },
              { date_created: batch_order_item?.date_created },
              { my_cost: batch_order_item?.my_cost },
              { sale_rate: batch_order_item?.sale_rate },
              { tier_quantity1: batch_order_item?.tier_quantity1 },
              { tier_quantity2: batch_order_item?.tier_quantity2 },
              { tier_quantity3: batch_order_item?.tier_quantity3 },
              { tier_price1: batch_order_item?.tier_price1 },
              { tier_price2: batch_order_item?.tier_price2 },
              { tier_price3: batch_order_item?.tier_price3 },
              { my_weight: batch_order_item?.my_weight },
            ],
            fyrebrick_inventory_item.fyrebrick_id
          );
          inventory_item_fyrebrick_id = fyrebrick_inventory_item.fyrebrick_id;
        } else {
          inventory_item_fyrebrick_id = fyrebrick_inventory_item.fyrebrick_id;
        }
        //item
        let select_item_rows = await Crud.select("item", [
          { no: batch_order_item?.item?.no },
          { name: batch_order_item?.item?.name },
          { type: batch_order_item?.item?.type },
          { category_id: batch_order_item?.item?.category_id },
        ]);
        let item_fyrebrick_id = undefined;

        if (select_item_rows.length === 0) {
          //creating new item if not found
          item_fyrebrick_id = await Create.item(
            batch_order_item?.item?.no,
            batch_order_item?.item?.name,
            batch_order_item?.item?.type,
            batch_order_item?.item?.category_id
          );
        } else if (
          //if found, check properties are not the same
          (batch_order_item?.item?.no ?? undefined) !== select_item_rows[0]?.no ||
          (batch_order_item?.item?.name ?? undefined) !== select_item_rows[0]?.name ||
          (batch_order_item?.item?.type ?? undefined) !== select_item_rows[0]?.type ||
          (batch_order_item?.item?.category_id ?? undefined) ===
            select_item_rows[0]?.category_id
        ) {
          //if properties are not the same, update properties
          await Crud.update(
            "item",
            [
              { no: batch_order_item?.item?.no },
              { name: batch_order_item?.item?.name },
              { type: batch_order_item?.item?.type },
              { category_id: batch_order_item?.item?.category_id },
            ],
            select_item_rows[0].fyrebrick_id
          );
          item_fyrebrick_id = select_item_rows[0].fyrebrick_id;
        } else {
          //properties are the same
          item_fyrebrick_id = select_item_rows[0].fyrebrick_id;
        }
        // console.log("push item_fyrebrick_id", item_fyrebrick_id);
        order_items_preparation_array = [...order_items_preparation_array,
          {
            quantity : batch_order_item?.quantity,
            inventory_item_fyrebrick_id,
            item_fyrebrick_id,
            batchIndex,
          }
        ];
        if(batchIndex  === order.items.length - 1 && batch_order_item_index ===batch.length - 1){
          // console.log("done");
          if(order_items_preparation_array.length!==0){
            await create_order_items(order_items_preparation_array, order_fyrebrick_id);
          }
        }
      });
    });    
  }
}
async function create_order(
  order,
  order_payment_fyrebrick_id,
  order_cost_fyrebrick_id,
  order_disp_cost_fyrebrick_id,
  order_shipping_fyrebrick_id,
  order_tags_fyrebrick_id
) {
  return await Create.order(
    order?.tagCount,
    order?.tagsCaseSensitive,
    order?.description,
    order?.orders_checked,
    order?.orders_total,
    Number(order?.order_id),
    order?.date_ordered,
    order?.date_status_changed,
    order?.seller_name,
    order?.store_name,
    order?.buyer_name,
    order?.buyer_email,
    order?.buyer_order_count,
    order?.require_insurance,
    order?.status,
    order?.is_invoiced,
    order?.is_filed,
    order?.drive_thru_sent,
    order?.salesTax_collected_by_bl,
    order?.vat_collected_by_bl,
    order?.remarks,
    order?.total_count,
    order?.unique_count,
    order?.total_weight,
    order_payment_fyrebrick_id,
    order_cost_fyrebrick_id,
    order_disp_cost_fyrebrick_id,
    order_shipping_fyrebrick_id,
    order_tags_fyrebrick_id
  );
}
async function create_order_items(
  order_items_preparation_array,
  order_fyrebrick_id
) {
  let order_item_fyrebrick_id_array = [];
  await order_items_preparation_array.forEach(
    async (order_item_preparation) => {
      let order_item_fyrebrick_id = await Create.order_item(
        order_item_preparation.quantity,
        order_item_preparation.inventory_item_fyrebrick_id, 
        order_item_preparation.item_fyrebrick_id, 
        order_item_preparation.batchIndex, 
        order_fyrebrick_id
      );
      order_item_fyrebrick_id_array.push(order_item_fyrebrick_id);
    }
  );
  return order_item_fyrebrick_id_array;
}

function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}
