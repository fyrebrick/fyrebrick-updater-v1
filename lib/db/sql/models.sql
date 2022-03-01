DROP TABLE IF EXISTS item, inventory_item, "order", order_tags, order_payment,
 order_shipping, shipping_address, address_name, order_cost, 
order_disp_cost, order_item, store, "user", order_has_order_item;

CREATE TABLE IF NOT EXISTS item ( 
    "no" TEXT NULL,
    "name" TEXT NULL,
    "type" TEXT NULL,
    category_id NUMERIC NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);

CREATE TABLE IF NOT EXISTS inventory_item (
    consumer_key TEXT NULL,
    color_id SMALLINT NULL,
    color_name TEXT NULL,
    "quantity" NUMERIC NULL,
    new_or_used TEXT NULL,
    completeness TEXT NULL,
    unit_price TEXT NULL,
    bind_id NUMERIC NULL,
    "description" TEXT NULL,
    remarks TEXT NULL,
    bulk NUMERIC NULL,
    is_retain BOOLEAN NULL,
    is_stock_room BOOLEAN NULL,
    stock_room_id TEXT NULL,
    date_created TIMESTAMP NULL,
    my_cost TEXT NULL,
    sale_rate NUMERIC NULL,
    tier_quantity1 NUMERIC NULL,
    tier_quantity2 NUMERIC NULL,
    tier_quantity3 NUMERIC NULL,
    tier_price1 TEXT NULL,
    tier_price2 TEXT NULL,
    tier_price3 TEXT NULL,
    my_weight TEXT NULL,
    inventory_id INTEGER NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);

-- child of order
CREATE TABLE IF NOT EXISTS order_tags(
    tags TEXT[] NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);

-- child of order
CREATE TABLE IF NOT EXISTS order_payment(
    method TEXT NULL,
    currency_code TEXT NULL,
    date_paid TIMESTAMP NULL,
    "status" TEXT NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);

-- child of shipping_address
CREATE TABLE IF NOT EXISTS address_name(
    "full" TEXT NULL,
    "first" TEXT NULL,
    "last" TEXT NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);

-- child of order_shipping
CREATE TABLE IF NOT EXISTS shipping_address(
    "full" TEXT NULL,
    address1 TEXT NULL,
    address2 TEXT NULL,
    country_code VARCHAR(3) NULL,
    city TEXT NULL,
    "state" TEXT NULL,
    postal_code TEXT NULL,
    address_name_fyrebrick_id INTEGER NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id),
    FOREIGN KEY (address_name_fyrebrick_id) REFERENCES address_name (fyrebrick_id)
);

-- child of order
CREATE TABLE IF NOT EXISTS order_shipping(
    method TEXT NULL,
    "method_id" NUMERIC NULL,
    tracking_no TEXT NULL,
    tracking_link TEXT NULL,
    date_shipped TIMESTAMP NULL,
    shipping_address_fyrebrick_id INTEGER NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id),
    FOREIGN KEY (shipping_address_fyrebrick_id) REFERENCES shipping_address (fyrebrick_id)
);

-- child of order
CREATE TABLE IF NOT EXISTS order_cost(
    currency_code TEXT NULL,
    subtotal TEXT NULL,
    grand_total TEXT NULL,
    salesTax_collected_by_bl TEXT NULL,
    final_total TEXT NULL,
    etc1 TEXT NULL,
    etc2 TEXT NULL,
    insurance TEXT NULL,
    shipping TEXT NULL,
    credit TEXT NULL,
    coupon TEXT NULL,
    vat_rate TEXT NULL,
    vat_amount TEXT NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);

--child of order
CREATE TABLE IF NOT EXISTS order_disp_cost(
    currency_code TEXT NULL,
    subtotal TEXT NULL,
    grand_total TEXT NULL,
    salesTax_collected_by_bl TEXT NULL,
    final_total TEXT NULL,
    etc1 TEXT NULL,
    etc2 TEXT NULL,
    insurance TEXT NULL,
    shipping TEXT NULL,
    credit TEXT NULL,
    coupon TEXT NULL,
    vat_rate TEXT NULL,
    vat_amount TEXT NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);

CREATE TABLE IF NOT EXISTS "order" (
    tagCount NUMERIC NULL,
    tagsCaseSensitive BOOLEAN NULL,
    "description" TEXT NULL,
    orders_checked NUMERIC NULL,
    orders_total NUMERIC NULL,
    order_id   INTEGER NULL,
    date_ordered    TIMESTAMP NULL,
    date_status_changed    TIMESTAMP NULL,
    seller_name   TEXT NULL,
    store_name   TEXT NULL,
    buyer_name   TEXT NULL,
    buyer_email   TEXT NULL,
    buyer_order_count   NUMERIC NULL,
    require_insurance   BOOLEAN NULL,
    "status"   TEXT NULL,
    is_invoiced   BOOLEAN NULL,
    is_filed   BOOLEAN NULL,
    drive_thru_sent  BOOLEAN NULL,
    salesTax_collected_by_bl   BOOLEAN NULL,
    vat_collected_by_bl BOOLEAN NULL,
    remarks   TEXT NULL,
    total_count   NUMERIC NULL,
    unique_count  NUMERIC NULL,
    total_weight NUMERIC NULL,
    order_payment_fyrebrick_id INTEGER NULL, -- FOREIGN KEY order_payment (fyrebrick_id)
    order_cost_fyrebrick_id INTEGER NULL, -- FOREIGN KEY order_cost (fyrebrick_id)
    order_disp_cost_fyrebrick_id INTEGER NULL, -- FOREIGN KEY order_cost (fyrebrick_id)
    order_shipping_fyrebrick_id INTEGER NULL, -- FOREIGN KEY order_shipping (fyrebrick_id)
    order_tags_fyrebrick_id INTEGER NULL, -- FOREIGN KEY order_tag (fyrebrick_id)
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id),
    FOREIGN KEY (order_payment_fyrebrick_id) REFERENCES order_payment (fyrebrick_id),
    FOREIGN KEY (order_cost_fyrebrick_id) REFERENCES order_cost (fyrebrick_id),
    FOREIGN KEY (order_disp_cost_fyrebrick_id) REFERENCES order_disp_cost (fyrebrick_id),
    FOREIGN KEY (order_shipping_fyrebrick_id) REFERENCES order_shipping (fyrebrick_id),
    FOREIGN KEY (order_tags_fyrebrick_id) REFERENCES order_tags (fyrebrick_id)
);

CREATE TABLE IF NOT EXISTS order_item(
    "quantity" NUMERIC NULL,
    inventory_item_fyrebrick_id INTEGER NULL, -- child
    item_fyrebrick_id INTEGER NULL, -- child
    batch NUMERIC, -- number of batch order.items[batch],
    order_fyrebrick_id INTEGER NULL, -- FOREIGN KEY order (fyrebrick_id)
    isChecked BOOLEAN NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id),
    FOREIGN KEY (order_fyrebrick_id) REFERENCES "order" (fyrebrick_id),
    FOREIGN KEY (inventory_item_fyrebrick_id) REFERENCES inventory_item (fyrebrick_id),
    FOREIGN KEY (item_fyrebrick_id) REFERENCES item (fyrebrick_id)
);

CREATE TABLE IF NOT EXISTS "user" (
    username TEXT NOT NULL,
    isAcceptedCookies BOOLEAN  DEFAULT FALSE NULL,
    isBlocked BOOLEAN DEFAULT FALSE NULL,
    apiCallAmountDaily NUMERIC DEFAULT 0 NULL,
    apiCallAmountTotal NUMERIC DEFAULT 0 NULL,
    updateInterval NUMERIC DEFAULT 10 NULL,
    googleID TEXT NULL,
    googleEmail TEXT NULL,
    googleAvatar TEXT NULL,
    googleToken TEXT NULL,
    twitterID TEXT NULL,
    twitterAvatar TEXT NULL,
    twitterName TEXT NULL,
    twitterToken TEXT NULL,
    githubID TEXT NULL,
    githubAvatar TEXT NULL,
    githubName TEXT NULL,
    githubToken TEXT NULL,
    creationDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP NULL,
    setupComplete BOOLEAN DEFAULT FALSE NULL,
    CONSUMER_KEY TEXT NOT NULL,
    CONSUMER_SECRET TEXT NOT NULL,
    TOKEN_SECRET TEXT NOT NULL,
    TOKEN_VALUE TEXT NOT NULL,
    fyrebrick_id SERIAL,
    PRIMARY KEY (fyrebrick_id)
);
