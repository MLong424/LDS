-- Drop existing functions and procedures to avoid conflicts
drop function if exists create_session;
drop function if exists get_or_create_session;
drop function if exists get_cart_by_session;
drop function if exists add_to_cart;
drop function if exists update_cart_item;
drop function if exists remove_from_cart;
drop function if exists get_cart_contents;
drop function if exists validate_cart;
drop function if exists clear_cart;
drop function if exists clean_expired_sessions;

-- Session Management Function - Creates a new session
create or replace function create_session() 
returns varchar(255) as $$
declare
    v_session_id varchar(255);
begin
    -- Generate a new session ID
    v_session_id := uuid_generate_v4()::varchar;
    
    -- Insert new session with appropriate timeout (24 hours from now)
    insert into public.sessions (
        id, 
        created_at, 
        last_activity
    ) values (
        v_session_id, 
        now(), 
        now()
    );
    
    -- Create an empty cart for this session
    insert into public.carts (
        session_id
    ) values (
        v_session_id
    );
    
    return v_session_id;
end;
$$ language plpgsql;

-- Function to get an existing session or create a new one
create or replace function get_or_create_session(
    p_session_id varchar(255) default null
) returns varchar(255) as $$
declare
    v_session_id varchar(255);
begin
    -- Check if session exists and is not expired
    if p_session_id is not null then
        update public.sessions
        set last_activity = now()
        where id = p_session_id 
        and last_activity > (now() - interval '24 hours')
        returning id into v_session_id;
    end if;
    
    -- If no valid session found, create a new one
    if v_session_id is null then
        v_session_id := create_session();
    end if;
    
    return v_session_id;
end;
$$ language plpgsql;

-- Function to get cart ID for a session
create or replace function get_cart_by_session(
    p_session_id varchar(255)
) returns varchar(255) as $$
declare
    v_cart_id varchar(255);
begin
    -- Update session's last activity timestamp
    update public.sessions
    set last_activity = now()
    where id = p_session_id
    and last_activity > (now() - interval '24 hours');
    
    -- If row was updated, session is valid
    if found then
        -- Get cart ID
        select session_id into v_cart_id
        from public.carts
        where session_id = p_session_id;
        
        -- If cart doesn't exist, create a new one
        if v_cart_id is null then
            insert into public.carts (session_id)
            values (p_session_id)
            returning session_id into v_cart_id;
        end if;
    else
        raise exception 'Session has expired or is invalid';
    end if;
    
    return v_cart_id;
end;
$$ language plpgsql;

-- Function to add item to cart
create or replace function add_to_cart(
    p_session_id varchar(255),
    p_product_id integer,
    p_quantity integer
) returns boolean as $$
declare
    v_cart_id varchar(255);
    v_available_stock integer;
    v_current_quantity integer;
begin
    -- Validate inputs
    if p_quantity <= 0 then
        raise exception 'Quantity must be greater than zero';
    end if;
    
    -- Get and validate product stock
    select stock into v_available_stock
    from public.products
    where id = p_product_id;
    
    if v_available_stock is null then
        raise exception 'Product with ID % does not exist', p_product_id;
    end if;
    
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Check if the product is already in the cart
    select quantity into v_current_quantity
    from public.cart_items
    where cart_id = v_cart_id and product_id = p_product_id;
    
    -- Calculate total requested quantity
    if v_current_quantity is not null then
        -- Check stock with existing quantity + new quantity
        if (v_current_quantity + p_quantity) > v_available_stock then
            raise exception 'Not enough stock. Current cart: %, Requested: %, Available: %', 
                v_current_quantity, p_quantity, v_available_stock;
        end if;
        
        -- Update quantity
        update public.cart_items
        set quantity = quantity + p_quantity
        where cart_id = v_cart_id and product_id = p_product_id;
    else
        -- Check stock for new item
        if p_quantity > v_available_stock then
            raise exception 'Not enough stock. Requested: %, Available: %', 
                p_quantity, v_available_stock;
        end if;
        
        -- Add new item to cart
        insert into public.cart_items (
            cart_id, 
            product_id, 
            quantity
        ) values (
            v_cart_id, 
            p_product_id, 
            p_quantity
        );
    end if;
    
    return true;
end;
$$ language plpgsql;

-- Function to update cart item quantity
create or replace function update_cart_item(
    p_session_id varchar(255),
    p_product_id integer,
    p_quantity integer
) returns boolean as $$
declare
    v_cart_id varchar(255);
    v_available_stock integer;
begin
    -- Validate inputs
    if p_quantity < 0 then
        raise exception 'Quantity cannot be negative';
    end if;
    
    -- Get and validate product stock
    select stock into v_available_stock
    from public.products
    where id = p_product_id;
    
    if v_available_stock is null then
        raise exception 'Product with ID % does not exist', p_product_id;
    end if;
    
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Check if item exists in cart
    if not exists (
        select 1 from public.cart_items
        where cart_id = v_cart_id and product_id = p_product_id
    ) then
        raise exception 'Product with ID % is not in the cart', p_product_id;
    end if;
    
    -- If quantity is 0, remove item from cart
    if p_quantity = 0 then
        delete from public.cart_items
        where cart_id = v_cart_id and product_id = p_product_id;
        return true;
    end if;
    
    -- Check stock for update
    if p_quantity > v_available_stock then
        raise exception 'Not enough stock. Requested: %, Available: %', 
            p_quantity, v_available_stock;
    end if;
    
    -- Update quantity
    update public.cart_items
    set quantity = p_quantity
    where cart_id = v_cart_id and product_id = p_product_id;
    
    return true;
end;
$$ language plpgsql;

-- Function to remove item from cart
create or replace function remove_from_cart(
    p_session_id varchar(255),
    p_product_id integer
) returns boolean as $$
declare
    v_cart_id varchar(255);
begin
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Remove item from cart
    delete from public.cart_items
    where cart_id = v_cart_id and product_id = p_product_id;
    
    if not found then
        raise exception 'Product with ID % is not in the cart', p_product_id;
    end if;
    
    return true;
end;
$$ language plpgsql;

-- Function to get cart contents with additional details
create or replace function get_cart_contents(
    p_session_id varchar(255)
) returns table (
    product_id integer,
    title varchar(255),
    media_type public.media_type,
    current_price decimal(10,2),
    quantity integer,
    subtotal decimal(10,2),
    available_stock integer,
    stock_status text,
    can_rush_deliver boolean
) as $$
declare
    v_cart_id varchar(255);
begin
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    return query
    select 
        p.id as product_id,
        p.title,
        p.media_type,
        p.current_price,
        ci.quantity,
        (p.current_price * ci.quantity) as subtotal,
        p.stock as available_stock,
        case 
            when p.stock < ci.quantity then 'INSUFFICIENT'
            when p.stock <= 5 then 'LOW'
            else 'AVAILABLE'
        end as stock_status,
        is_product_rush_delivery_eligible(p.id) as can_rush_deliver
    from public.cart_items ci
    join public.products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id
    order by p.title;
end;
$$ language plpgsql;

-- Function to calculate total of cart excluding VAT
create or replace function get_cart_total_excluding_vat(
    p_session_id varchar(255)
) returns decimal(10,2) as $$
declare
    v_cart_id varchar(255);
    v_total decimal(10,2);
begin
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Calculate total excluding VAT
    select coalesce(sum(p.current_price * ci.quantity), 0)
    into v_total
    from public.cart_items ci
    join public.products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id;
    
    return v_total;
end;
$$ language plpgsql;

-- Function to validate cart before checkout
create or replace function validate_cart(
    p_session_id varchar(255)
) returns table (
    is_valid boolean,
    message text,
    invalid_items json
) as $$
declare
    v_cart_id varchar(255);
    v_invalid_items json;
    v_is_valid boolean := true;
    v_message text := 'Cart is valid';
begin
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Check if cart is empty
    if not exists (
        select 1 from public.cart_items
        where cart_id = v_cart_id
    ) then
        return query
        select 
            false, 
            'Cart is empty',
            null::json;
        return;
    end if;
    
    -- Find items with insufficient stock
    select json_agg(json_build_object(
        'product_id', p.id,
        'title', p.title,
        'requested', ci.quantity,
        'available', p.stock
    ))
    into v_invalid_items
    from public.cart_items ci
    join public.products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id
    and ci.quantity > p.stock;
    
    -- Set validity based on invalid items
    if v_invalid_items is not null then
        v_is_valid := false;
        v_message := 'Some items have insufficient stock';
    end if;
    
    return query
    select 
        v_is_valid,
        v_message,
        v_invalid_items;
end;
$$ language plpgsql;

-- Function to clear cart after successful order
create or replace function clear_cart(
    p_session_id varchar(255)
) returns boolean as $$
declare
    v_cart_id varchar(255);
begin
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Remove all items from cart
    delete from public.cart_items
    where cart_id = v_cart_id;
    
    return true;
end;
$$ language plpgsql;

-- Session cleanup function - to be called from application or scheduled job
create or replace function clean_expired_sessions() 
returns integer as $$
declare
    v_count integer;
begin
    -- First clean up cart items from expired sessions
    delete from public.cart_items ci
    using public.carts c, public.sessions s
    where ci.cart_id = c.session_id
    and c.session_id = s.id
    and s.last_activity < (now() - interval '24 hours');
    
    -- Then clean up carts
    delete from public.carts c
    using public.sessions s
    where c.session_id = s.id
    and s.last_activity < (now() - interval '24 hours');
    
    -- Finally, clean up the sessions themselves
    with deleted as (
        delete from public.sessions
        where last_activity < (now() - interval '24 hours')
        returning id
    )
    select count(*) into v_count from deleted;
    
    return v_count;
end;
$$ language plpgsql;

-- Function to calculate delivery fees
create or replace function calculate_delivery_fees(
    p_session_id varchar(255),
    p_province varchar(100),
    p_city varchar(100),
    p_is_rush_delivery boolean default false
) returns table (
    standard_delivery_fee decimal(10,2),
    rush_delivery_fee decimal(10,2),
    free_shipping_applied boolean,
    total_order_value decimal(10,2),
    heaviest_item_weight decimal(10,2)
) as $$
declare
    v_cart_id varchar(255);
    v_total_value decimal(10,2) := 0;
    v_standard_fee decimal(10,2) := 0;
    v_rush_fee decimal(10,2) := 0;
    v_free_shipping boolean := false;
    v_heaviest_weight decimal(10,2) := 0;
    v_is_inner_city boolean;
    v_rush_eligible_count integer := 0;
    v_rush_item record;
begin
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Calculate total order value (excluding VAT)
    select coalesce(sum(p.current_price * ci.quantity), 0)
    into v_total_value
    from public.cart_items ci
    join public.products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id;
    
    -- Find heaviest item in the cart
    select max(p.weight)
    into v_heaviest_weight
    from public.cart_items ci
    join public.products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id;
    
    -- Calculate standard delivery fee
    
    -- Check if inner city (Hanoi or Ho Chi Minh)
    v_is_inner_city := (
        (lower(p_province) like '%hanoi%' or lower(p_province) like '%hà nội%') and 
        lower(p_city) not like '%district%' 
    ) or (
        (lower(p_province) like '%ho chi minh%' or lower(p_province) like '%hồ chí minh%') and 
        lower(p_city) not like '%district%'
    );
    
    if v_is_inner_city then
        -- Inner city: 22,000 VND for first 3kg
        v_standard_fee := 22000;
        
        -- Add fee for additional weight if over 3kg
        if v_heaviest_weight > 3 then
            v_standard_fee := v_standard_fee + ceiling((v_heaviest_weight - 3) / 0.5) * 2500;
        end if;
    else
        -- Other locations: 30,000 VND for first 0.5kg
        v_standard_fee := 30000;
        
        -- Add fee for additional weight if over 0.5kg
        if v_heaviest_weight > 0.5 then
            v_standard_fee := v_standard_fee + ceiling((v_heaviest_weight - 0.5) / 0.5) * 2500;
        end if;
    end if;
    
    -- Apply free shipping if order value > 100,000 VND (up to 25,000 VND)
    if v_total_value > 100000 then
        v_free_shipping := true;
        -- Cap the free shipping at 25,000 VND
        v_standard_fee := greatest(v_standard_fee - 25000, 0);
    end if;
    
    -- Calculate rush delivery fee if applicable
    if p_is_rush_delivery and v_is_inner_city and 
       (lower(p_province) like '%hanoi%' or lower(p_province) like '%hà nội%') then
        
        -- Count rush eligible items
        for v_rush_item in 
            select ci.product_id, ci.quantity
            from public.cart_items ci
            join public.products p on ci.product_id = p.id
            where ci.cart_id = v_cart_id
            and is_product_rush_delivery_eligible(p.id) = true
        loop
            v_rush_eligible_count := v_rush_eligible_count + v_rush_item.quantity;
        end loop;
        
        -- 10,000 VND per rush delivery item
        v_rush_fee := v_rush_eligible_count * 10000;
    end if;
    
    return query
    select 
        v_standard_fee,
        v_rush_fee,
        v_free_shipping,
        v_total_value,
        v_heaviest_weight;
end;
$$ language plpgsql;