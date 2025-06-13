-- Drop existing schema
drop schema if exists public cascade;
create schema public;

-- Enhanced enums
create type public.user_role as enum('ADMIN', 'PRODUCT_MANAGER', 'CUSTOMER');
create type public.order_status as enum('PENDING_PROCESSING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELED');
create type public.payment_status as enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
create type public.payment_method as enum('CREDIT_CARD', 'VNPAY', 'PAYPAL', 'STRIPE', 'MOMO');
create type public.inventory_change_type as enum('RESTOCK', 'SALE');
create type public.media_type as enum('BOOK', 'CD', 'LP_RECORD', 'DVD');
create type public.cover_type as enum('PAPERBACK', 'HARDCOVER');
create type public.disc_type as enum('BLU_RAY', 'HD_DVD', 'STANDARD');
create type public.delivery_type as enum('STANDARD', 'RUSH');

-- User Management
create table public.users (
    id varchar(255) not null,
    username varchar(255) not null unique,
    password varchar(255) not null,
    email varchar(255) not null unique,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    is_blocked boolean not null default false,
    password_reset_token varchar(255),
    password_reset_expiry timestamp,
    created_at timestamp not null default now(),
    constraint pk_users primary key (id)
);

-- User roles (allowing multiple roles per user)
create table public.user_roles (
    user_id varchar(255) not null,
    role public.user_role not null,
    constraint pk_user_roles primary key (user_id, role),
    constraint fk_user_id foreign key (user_id) references users(id) on delete cascade
);

-- Products (base table with common attributes)
create table public.products (
    id serial,
    title varchar(255) not null,
    barcode varchar(50) unique,
    base_value decimal(10, 2) not null,  -- Product value without VAT
    current_price decimal(10, 2) not null, -- Current selling price without VAT
    stock integer not null default 0,
    media_type public.media_type not null,
    product_description text not null,
    dimensions varchar(100),
    weight decimal(10, 2),  -- Weight in kg
    warehouse_entry_date date,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    constraint pk_products primary key (id),
    -- Price must be between 30% and 150% of base value
    constraint chk_price_range check (current_price >= base_value * 0.3 and current_price <= base_value * 1.5),
    check (base_value >= 0),
    check (current_price >= 0),
    check (weight > 0)
);

-- Book-specific attributes
create table public.books (
    product_id integer not null,
    authors text[] not null,
    cover_type public.cover_type not null,
    publisher varchar(255) not null,
    publication_date date not null,
    pages integer,
    language varchar(50),
    genre varchar(100),
    constraint pk_books primary key (product_id),
    constraint fk_product_id foreign key (product_id) references products(id) on delete cascade
);

-- CD-specific attributes
create table public.cds (
    product_id integer not null,
    artists text[] not null,
    record_label varchar(255) not null,
    tracklist text[] not null,
    genre varchar(100) not null,
    release_date date,
    constraint pk_cds primary key (product_id),
    constraint fk_product_id foreign key (product_id) references products(id) on delete cascade
);

-- LP Record-specific attributes
create table public.lp_records (
    product_id integer not null,
    artists text[] not null,
    record_label varchar(255) not null,
    tracklist text[] not null,
    genre varchar(100) not null,
    release_date date,
    constraint pk_lp_records primary key (product_id),
    constraint fk_product_id foreign key (product_id) references products(id) on delete cascade
);

-- DVD-specific attributes
create table public.dvds (
    product_id integer not null,
    disc_type public.disc_type not null,
    director varchar(255) not null,
    runtime integer not null, -- In minutes
    studio varchar(255) not null,
    language varchar(50) not null,
    subtitles TEXT[],
    release_date DATE,
    genre VARCHAR(100),
    constraint pk_dvds primary key (product_id),
    constraint fk_product_id foreign key (product_id) references products(id) on delete cascade
);

-- Product price history
create table public.product_price_history (
    id serial not null,
    product_id integer not null,
    old_price decimal(10, 2) not null,
    new_price decimal(10, 2) not null,
    changed_by varchar(255) not null,
    changed_at timestamp not null default now(),
    constraint pk_product_price_history primary key (id),
    constraint fk_product_id foreign key (product_id) references products(id),
    constraint fk_changed_by foreign key (changed_by) references users(id)
);

-- Product edit history
create table public.product_edit_history (
    id serial not null,
    product_id integer not null,
    operation_type varchar(50) not null, -- ADD, EDIT, DELETE
    changed_by varchar(255) not null,
    changed_at timestamp not null default now(),
    operation_details jsonb, -- Store details of what was changed
    constraint pk_product_edit_history primary key (id),
    constraint fk_product_id foreign key (product_id) references products(id),
    constraint fk_changed_by foreign key (changed_by) references users(id)
);

-- Session-based cart system (no login required)
create table public.sessions (
    id varchar(255) not null,
    created_at timestamp not null default now(),
    last_activity timestamp not null default now(),
    constraint pk_sessions primary key (id)
);

create table public.carts (
    session_id varchar(255) not null,
    created_at timestamp not null default now(),
    constraint pk_carts primary key (session_id),
    constraint fk_session_id foreign key (session_id) references sessions(id) on delete cascade
);

create table public.cart_items (
    cart_id varchar(255) not null,
    product_id integer not null,
    quantity integer not null default 1,
    created_at timestamp not null default now(),
    constraint pk_cart_items primary key (cart_id, product_id),
    constraint fk_cart_id foreign key (cart_id) references carts(session_id),
    constraint fk_product_id foreign key (product_id) references products(id),
    check (quantity > 0)
);

-- Enhanced orders with delivery information
create table public.orders (
    id varchar(255) not null,
    session_id varchar(255) not null,
    recipient_name varchar(255) not null,
    recipient_email varchar(255) not null,
    recipient_phone varchar(20) not null,
    delivery_province varchar(100) not null,
    delivery_address text not null,
    delivery_type public.delivery_type not null default 'STANDARD',
    rush_delivery_time timestamp,
    rush_delivery_instructions text,
    products_total decimal(10, 2) not null, -- Total price of products excluding VAT
    vat_amount decimal(10, 2) not null, -- 10% VAT
    delivery_fee decimal(10, 2) not null,
    rush_delivery_fee decimal(10, 2) default 0,
    total_amount decimal(10, 2) not null, -- Total including products with VAT and delivery fees
    order_status public.order_status not null default 'PENDING_PROCESSING',
    payment_status public.payment_status not null default 'PENDING',
    created_at timestamp not null default now(),
    rejected_reason text,
    constraint pk_orders primary key (id),
    constraint fk_session_id foreign key (session_id) references sessions(id),
    check (products_total >= 0),
    check (vat_amount >= 0),
    check (delivery_fee >= 0),
    check (rush_delivery_fee >= 0),
    check (total_amount >= 0)
);

create table public.order_items (
    order_id varchar(255) not null,
    product_id integer not null,
    quantity integer not null default 1,
    unit_price decimal(10, 2) not null, -- Price at time of order
    is_rush_delivery boolean not null default false,
    constraint pk_order_items primary key (order_id, product_id),
    constraint fk_order_id foreign key (order_id) references orders(id),
    constraint fk_product_id foreign key (product_id) references products(id),
    check (quantity > 0),
    check (unit_price >= 0)
);

create table public.order_status_history (
    id serial primary key,
    order_id varchar(255) not null,
    old_status public.order_status,
    new_status public.order_status,
    changed_at timestamp default current_timestamp,
    changed_by varchar(255), -- User ID if available
    notes TEXT,
    constraint fk_order_id foreign key (order_id) references public.orders(id)
);

-- Enhanced payment tracking with VNPay integration
create table public.payments (
    id varchar(255) not null,
    order_id varchar(255) not null,
    amount decimal(10, 2) not null,
    payment_status public.payment_status not null,
    payment_method public.payment_method not null,
    transaction_id varchar(255),
    transaction_datetime TIMESTAMP,
    transaction_content TEXT,
    provider_data jsonb default null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    constraint pk_payments primary key (id),
    constraint fk_order_id foreign key (order_id) references orders(id),
    check (amount > 0)
);

-- Refund tracking
create table public.refunds (
    id varchar(255) not null,
    payment_id varchar(255) not null,
    amount decimal(10, 2) not null,
    status varchar(50) not null,
    refund_transaction_id varchar(255),
    refund_datetime timestamp not null default now(),
    refund_reason TEXT,
    constraint pk_refunds primary key (id),
    constraint fk_payment_id foreign key (payment_id) references payments(id),
    check (amount > 0)
);

-- Indexes for performance optimization
create index idx_products_media_type on products(media_type);
create index idx_order_status on orders(order_status);
create index idx_payment_status on payments(payment_status);
create index idx_order_created_at on orders(created_at);
create index idx_product_title on products(title);