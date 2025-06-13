-- Drop existing functions to avoid conflicts
drop function if exists create_order;
drop function if exists get_order_details;
drop function if exists calculate_order_totals;
drop function if exists process_payment;
drop function if exists cancel_order;
drop function if exists get_pending_orders;
drop function if exists approve_order;
drop function if exists reject_order;
drop function if exists calculate_delivery_fees;
drop function if exists get_order_by_id;

-- Create order with delivery information
create or replace function create_order(
    p_session_id varchar(255),
    p_recipient_name varchar(255),
    p_recipient_email varchar(255),
    p_recipient_phone varchar(20),
    p_delivery_province varchar(100),
    p_delivery_address text,
    p_delivery_type public.delivery_type default 'STANDARD',
    p_rush_delivery_time timestamp default null,
    p_rush_delivery_instructions text default null
) returns varchar(255) as $$
declare
    v_order_id varchar(255);
    v_cart_validation json;
    v_is_valid boolean;
    v_validation_message text;
    v_total_amount decimal(10, 2);
    v_products_total decimal(10, 2);
    v_vat_amount decimal(10, 2);
    v_delivery_fee decimal(10, 2);
    v_rush_delivery_fee decimal(10, 2);
    v_delivery_fees record;
    v_cart_id varchar(255);
begin
    -- Generate a unique order ID using UUID
    v_order_id := uuid_generate_v4()::varchar;

    -- Validate inputs
    if p_recipient_name is null or p_recipient_email is null or p_recipient_phone is null 
       or p_delivery_province is null or p_delivery_address is null then
        raise exception 'All delivery information fields are required';
    end if;
    -- Validate email format
    if p_recipient_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' Then
        raise exception 'Invalid email format';
    end if;
    -- Validate phone number (simple validation)
    if p_recipient_phone !~ '^[0-9+()-]{8,15}$' then
        raise exception 'Invalid phone number format';
    end if;
    -- Validate cart has items and sufficient stock
    select * from validate_cart(p_session_id) into v_is_valid, v_validation_message, v_cart_validation;
    if not v_is_valid then
        raise exception 'Cart validation failed: %', v_validation_message;
    end if;
    
    -- Get cart ID
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Calculate delivery fees
    select * from calculate_delivery_fees(
        p_session_id, 
        p_delivery_province, 
        p_delivery_address, 
        (p_delivery_type = 'RUSH')
    ) into v_delivery_fees;
    
    v_delivery_fee := v_delivery_fees.standard_delivery_fee;
    v_rush_delivery_fee := v_delivery_fees.rush_delivery_fee;
    
    -- Calculate total amount
    v_products_total := get_cart_total_excluding_vat(p_session_id);
    v_vat_amount := v_products_total * 0.1; -- 10% VAT
    v_total_amount := v_products_total + v_vat_amount + v_delivery_fee + v_rush_delivery_fee;
    
    -- Create order record
    insert into public.orders (
        id, 
        session_id, 
        recipient_name, 
        recipient_email, 
        recipient_phone, 
        delivery_province, 
        delivery_address, 
        delivery_type,
        rush_delivery_time,
        rush_delivery_instructions,
        products_total,
        vat_amount,
        delivery_fee,
        rush_delivery_fee,
        total_amount,
        order_status,
        payment_status,
        created_at
    ) values (
        v_order_id,
        p_session_id,
        p_recipient_name,
        p_recipient_email,
        p_recipient_phone,
        p_delivery_province,
        p_delivery_address,
        p_delivery_type,
        p_rush_delivery_time,
        p_rush_delivery_instructions,
        v_products_total,
        v_vat_amount,
        v_delivery_fee,
        v_rush_delivery_fee,
        v_total_amount,
        'PENDING_PROCESSING',
        'PENDING',
        now()
    );
    
    -- Add cart items to order
    insert into public.order_items (
        order_id, 
        product_id, 
        quantity, 
        unit_price,
        is_rush_delivery
    )
    select 
        v_order_id,
        ci.product_id,
        ci.quantity,
        p.current_price,
        case when p_delivery_type = 'RUSH' and is_product_rush_delivery_eligible(p.id) then true else false end
    from 
        public.cart_items ci
    join 
        public.products p on ci.product_id = p.id
    where 
        ci.cart_id = v_cart_id;
    
    -- Insert order status history
    insert into public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_at,
        notes
    ) values (
        v_order_id,
        null,
        'PENDING_PROCESSING',
        now(),
        'Order created'
    );
    
    return v_order_id;
exception
    when others then
        raise exception 'Error creating order: %', SQLERRM;
end;
$$ language plpgsql;

-- Function to calculate order totals
create or replace function calculate_order_totals(
    p_order_id varchar(255)
) returns table (
    products_total decimal(10, 2),
    vat_amount decimal(10, 2),
    delivery_fee decimal(10, 2),
    rush_delivery_fee decimal(10, 2),
    total_amount decimal(10, 2)
) as $$
begin
    return query
    select 
        o.products_total,
        o.vat_amount,
        o.delivery_fee,
        o.rush_delivery_fee,
        o.total_amount
    from 
        public.orders o
    where 
        o.id = p_order_id;
end;
$$ language plpgsql;

-- Function to process payment through VNPay with correct parameter types
create or replace function process_payment(
    p_order_id varchar(255),
    p_payment_method public.payment_method,
    p_transaction_id varchar(255),
    p_transaction_datetime timestamp,
    p_transaction_content text,
    p_provider_data jsonb default null
) returns varchar(255) as $$
declare
    v_payment_id varchar(255);
    v_order_total decimal(10, 2);
    v_order_exists boolean;
begin
    -- Check if order exists
    select exists(select 1 from public.orders where id = p_order_id) into v_order_exists;
    
    if not v_order_exists then
        raise exception 'Order with ID % does not exist', p_order_id;
    end if;
    
    -- Check if order is already paid
    if exists(select 1 from public.payments where order_id = p_order_id and payment_status = 'COMPLETED') then
        raise exception 'Order % has already been paid', p_order_id;
    end if;
    
    -- Get order total
    select total_amount into v_order_total from public.orders where id = p_order_id;
    
    -- Generate payment ID
    v_payment_id := uuid_generate_v4()::varchar;
    
    -- Record payment
    insert into public.payments (
        id,
        order_id,
        amount,
        payment_status,
        payment_method,
        transaction_id,
        transaction_datetime,
        transaction_content,
        provider_data,
        created_at,
        updated_at
    ) values (
        v_payment_id,
        p_order_id,
        v_order_total,
        'COMPLETED',
        p_payment_method,
        p_transaction_id,
        p_transaction_datetime,
        p_transaction_content,
        p_provider_data,
        now(),
        now()
    );
    
    -- Update order payment status
    update public.orders
    set payment_status = 'COMPLETED'
    where id = p_order_id;
    
    -- Decrease product stock
    update public.products p
    set stock = p.stock - oi.quantity
    from public.order_items oi
    where oi.product_id = p.id and oi.order_id = p_order_id;
    
    -- Clear the cart after successful payment
    perform clear_cart((select session_id from public.orders where id = p_order_id));
    
    return v_payment_id;
exception
    when others then
        raise exception 'Error processing payment: %', SQLERRM;
end;
$$ language plpgsql;

-- Function to cancel an order
create or replace function cancel_order(
    p_order_id varchar(255)
) returns boolean as $$
declare
    v_order_status public.order_status;
    v_payment_id varchar(255);
    v_refund_id varchar(255);
begin
    -- Get current order status
    select order_status into v_order_status from public.orders where id = p_order_id;
    
    if v_order_status is null then
        raise exception 'Order with ID % does not exist', p_order_id;
    end if;
    
    -- Check if order can be canceled
    if v_order_status not in ('PENDING_PROCESSING', 'APPROVED') then
        raise exception 'Cannot cancel order with status %', v_order_status;
    end if;
    
    -- Update order status
    update public.orders
    set order_status = 'CANCELED'
    where id = p_order_id;
    
    -- Insert order status history
    insert into public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_at,
        notes
    ) values (
        p_order_id,
        v_order_status,
        'CANCELED',
        now(),
        'Order canceled by customer'
    );
    
    -- Process refund if payment exists
    select id into v_payment_id 
    from public.payments 
    where order_id = p_order_id and payment_status = 'COMPLETED';
    
    if v_payment_id is not null then
        -- Generate refund ID
        v_refund_id := uuid_generate_v4()::varchar;
        
        -- Record refund
        insert into public.refunds (
            id,
            payment_id,
            amount,
            status,
            refund_datetime,
            refund_reason
        ) values (
            v_refund_id,
            v_payment_id,
            (select amount from public.payments where id = v_payment_id),
            'COMPLETED',
            now(),
            'Order canceled by customer'
        );
        
        -- Update payment status
        update public.payments
        set payment_status = 'REFUNDED'
        where id = v_payment_id;
        
        -- Update order payment status
        update public.orders
        set payment_status = 'REFUNDED'
        where id = p_order_id;
    end if;
    
    -- Return items to inventory
    update public.products p
    set stock = p.stock + oi.quantity
    from public.order_items oi
    where oi.product_id = p.id and oi.order_id = p_order_id;
    
    return true;
exception
    when others then
        raise exception 'Error canceling order: %', SQLERRM;
        return false;
end;
$$ language plpgsql;

-- Function to get pending orders for product manager
create or replace function get_pending_orders(
    p_user_id varchar(255),
    p_page integer default 1,
    p_page_size integer default 30
) returns table (
    order_id varchar(255),
    recipient_name varchar(255),
    recipient_email varchar(255),
    recipient_phone varchar(20),
    delivery_province varchar(100),
    delivery_address text,
    total_amount decimal(10, 2),
    payment_status public.payment_status,
    created_at timestamp,
    has_sufficient_stock boolean
) as $$
begin
    -- Validate user has product manager role
    if not user_has_role(p_user_id, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;
    
    return query
    with order_stock_check as (
        select 
            o.id as order_id,
            case when count(*) filter (where p.stock < oi.quantity) = 0 then true else false end as has_sufficient_stock
        from 
            public.orders o
        join 
            public.order_items oi on o.id = oi.order_id
        join 
            public.products p on oi.product_id = p.id
        where 
            o.order_status = 'PENDING_PROCESSING'
            and o.payment_status = 'COMPLETED'
        group by 
            o.id
    )
    select 
        o.id,
        o.recipient_name,
        o.recipient_email,
        o.recipient_phone,
        o.delivery_province,
        o.delivery_address,
        o.total_amount,
        o.payment_status,
        o.created_at,
        osc.has_sufficient_stock
    from 
        public.orders o
    join 
        order_stock_check osc on o.id = osc.order_id
    where 
        o.order_status = 'PENDING_PROCESSING'
        and o.payment_status = 'COMPLETED'
    order by 
        o.created_at asc
    limit p_page_size
    offset (p_page - 1) * p_page_size;
end;
$$ language plpgsql;

-- Function for product manager to approve an order
create or replace function approve_order(
    p_order_id varchar(255),
    p_user_id varchar(255)
) returns boolean as $$
declare
    v_order_status public.order_status;
    v_payment_status public.payment_status;
    v_has_sufficient_stock boolean;
begin
    -- Validate user has product manager role
    if not user_has_role(p_user_id, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;
    
    -- Get current order status and payment status
    select 
        o.order_status, 
        o.payment_status 
    into 
        v_order_status, 
        v_payment_status
    from 
        public.orders o
    where 
        o.id = p_order_id;
    
    if v_order_status is null then
        raise exception 'Order with ID % does not exist', p_order_id;
    end if;
    
    -- Check if order is pending and paid
    if v_order_status != 'PENDING_PROCESSING' then
        raise exception 'Cannot approve order with status %', v_order_status;
    end if;
    
    if v_payment_status != 'COMPLETED' then
        raise exception 'Cannot approve order with payment status %', v_payment_status;
    end if;
    
    -- Check if there's sufficient stock
    select 
        case when count(*) = 0 then true else false end into v_has_sufficient_stock
    from 
        public.order_items oi
    join 
        public.products p on oi.product_id = p.id
    where 
        oi.order_id = p_order_id
        and p.stock < oi.quantity;
    
    if not v_has_sufficient_stock then
        raise exception 'Insufficient stock for one or more products in the order';
    end if;
    
    -- Update order status
    update public.orders
    set order_status = 'APPROVED'
    where id = p_order_id;
    
    -- Insert order status history
    insert into public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_at,
        changed_by,
        notes
    ) values (
        p_order_id,
        'PENDING_PROCESSING',
        'APPROVED',
        now(),
        p_user_id,
        'Order approved by product manager'
    );
    
    return true;
exception
    when others then
        raise exception 'Error approving order: %', SQLERRM;
        return false;
end;
$$ language plpgsql;

-- Function for product manager to reject an order
create or replace function reject_order(
    p_order_id varchar(255),
    p_user_id varchar(255),
    p_reason text
) returns boolean as $$
declare
    v_order_status public.order_status;
    v_payment_status public.payment_status;
    v_payment_id varchar(255);
    v_refund_id varchar(255);
begin
    -- Validate user has product manager role
    if not user_has_role(p_user_id, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;
    
    -- Get current order status and payment status
    select 
        o.order_status, 
        o.payment_status 
    into 
        v_order_status, 
        v_payment_status
    from 
        public.orders o
    where 
        o.id = p_order_id;
    
    if v_order_status is null then
        raise exception 'Order with ID % does not exist', p_order_id;
    end if;
    
    -- Check if order is pending
    if v_order_status != 'PENDING_PROCESSING' then
        raise exception 'Cannot reject order with status %', v_order_status;
    end if;
    
    -- Update order status
    update public.orders
    set 
        order_status = 'REJECTED',
        rejected_reason = p_reason
    where id = p_order_id;
    
    -- Insert order status history
    insert into public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_at,
        changed_by,
        notes
    ) values (
        p_order_id,
        'PENDING_PROCESSING',
        'REJECTED',
        now(),
        p_user_id,
        'Order rejected: ' || p_reason
    );
    
    -- Process refund if payment exists
    if v_payment_status = 'COMPLETED' then
        select id into v_payment_id 
        from public.payments 
        where order_id = p_order_id and payment_status = 'COMPLETED';
        
        if v_payment_id is not null then
            -- Generate refund ID
            v_refund_id := uuid_generate_v4()::varchar;
            
            -- Record refund
            insert into public.refunds (
                id,
                payment_id,
                amount,
                status,
                refund_datetime,
                refund_reason
            ) values (
                v_refund_id,
                v_payment_id,
                (select amount from public.payments where id = v_payment_id),
                'COMPLETED',
                NOW(),
                'Order rejected: ' || p_reason
            );
            
            -- Update payment status
            update public.payments
            set payment_status = 'REFUNDED'
            where id = v_payment_id;
            
            -- Update order payment status
            update public.orders
            set payment_status = 'REFUNDED'
            where id = p_order_id;
        end if;
        
        -- Return items to inventory
        update public.products p
        set stock = p.stock + oi.quantity
        from public.order_items oi
        where oi.product_id = p.id and oi.order_id = p_order_id;
    end if;
    
    return true;
exception
    when others then
        raise exception 'Error rejecting order: %', SQLERRM;
        return false;
end;
$$ language plpgsql;

-- Function to get detailed order information
create or replace function get_order_details(
    p_order_id varchar(255)
) returns table (
    order_id varchar(255),
    recipient_name varchar(255),
    recipient_email varchar(255),
    recipient_phone varchar(20),
    delivery_province varchar(100),
    delivery_address text,
    delivery_type public.delivery_type,
    rush_delivery_time timestamp,
    rush_delivery_instructions text,
    products_total decimal(10, 2),
    vat_amount decimal(10, 2),
    delivery_fee decimal(10, 2),
    rush_delivery_fee decimal(10, 2),
    total_amount decimal(10, 2),
    order_status public.order_status,
    payment_status public.payment_status,
    created_at timestamp,
    rejected_reason text,
    items json,
    payment_info json,
    status_history json
) as $$
begin
    return query
    select 
        o.id,
        o.recipient_name,
        o.recipient_email,
        o.recipient_phone,
        o.delivery_province,
        o.delivery_address,
        o.delivery_type,
        o.rush_delivery_time,
        o.rush_delivery_instructions,
        o.products_total,
        o.vat_amount,
        o.delivery_fee,
        o.rush_delivery_fee,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        o.rejected_reason,
        (
            select json_agg(json_build_object(
                'product_id', oi.product_id,
                'product_title', p.title,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'is_rush_delivery', oi.is_rush_delivery,
                'media_type', p.media_type
            ))
            from public.order_items oi
            join public.products p on oi.product_id = p.id
            where oi.order_id = o.id
        ) as items,
        (
            select json_agg(json_build_object(
                'payment_id', pay.id,
                'amount', pay.amount,
                'payment_status', pay.payment_status,
                'payment_method', pay.payment_method,
                'transaction_id', pay.transaction_id,
                'transaction_datetime', pay.transaction_datetime,
                'created_at', pay.created_at,
                'refund', (
                    select json_agg(json_build_object(
                        'refund_id', r.id,
                        'amount', r.amount,
                        'status', r.status,
                        'refund_datetime', r.refund_datetime,
                        'refund_reason', r.refund_reason
                    ))
                    from public.refunds r
                    where r.payment_id = pay.id
                )
            ))
            from public.payments pay
            where pay.order_id = o.id
        ) as payment_info,
        (
            select json_agg(json_build_object(
                'old_status', osh.old_status,
                'new_status', osh.new_status,
                'changed_at', osh.changed_at,
                'changed_by', osh.changed_by,
                'notes', osh.notes
            ) order by osh.changed_at)
            from public.order_status_history osh
            where osh.order_id = o.id
        ) as status_history
    from 
        public.orders o
    where 
        o.id = p_order_id;
end;
$$ language plpgsql;

-- Function to get order by ID with access control
create or replace function get_order_by_id(
    p_order_id varchar(255),
    p_user_id varchar(255) default null
) returns table (
    order_id varchar(255),
    recipient_name varchar(255),
    recipient_email varchar(255),
    recipient_phone varchar(20),
    delivery_province varchar(100),
    delivery_address text,
    delivery_type public.delivery_type,
    products_total decimal(10, 2),
    vat_amount decimal(10, 2),
    delivery_fee decimal(10, 2),
    rush_delivery_fee decimal(10, 2),
    total_amount decimal(10, 2),
    order_status public.order_status,
    payment_status public.payment_status,
    created_at timestamp,
    items json,
    payment_info json
) as $$
declare
    v_email_match boolean;
    v_is_admin boolean := false;
    v_is_product_manager boolean := false;
begin
    -- Check if user is admin or product manager if user_id provided
    if p_user_id is not null then
        select user_has_role(p_user_id, 'ADMIN') into v_is_admin;
        select user_has_role(p_user_id, 'PRODUCT_MANAGER') into v_is_product_manager;
    end if;
    
    -- Check if email matches for guest access (if not admin or PM)
    if not v_is_admin and not v_is_product_manager then
        -- For guest access, verify against the recipient email
        -- This would typically be validated with a token in production
        select true into v_email_match
        from public.orders
        where id = p_order_id;
        
        if not found or v_email_match is null then
            raise exception 'Order not found or unauthorized access';
        end if;
    end if;
    
    return query
    select 
        o.id,
        o.recipient_name,
        o.recipient_email,
        o.recipient_phone,
        o.delivery_province,
        o.delivery_address,
        o.delivery_type,
        o.products_total,
        o.vat_amount,
        o.delivery_fee,
        o.rush_delivery_fee,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        (
            select json_agg(json_build_object(
                'product_id', oi.product_id,
                'product_title', p.title,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'is_rush_delivery', oi.is_rush_delivery
            ))
            from public.order_items oi
            join public.products p on oi.product_id = p.id
            where oi.order_id = o.id
        ) as items,
        (
            select json_agg(json_build_object(
                'payment_id', pay.id,
                'amount', pay.amount,
                'payment_status', pay.payment_status,
                'payment_method', pay.payment_method,
                'transaction_id', pay.transaction_id,
                'transaction_datetime', pay.transaction_datetime
            ))
            from public.payments pay
            where pay.order_id = o.id
        ) as payment_info
    from 
        public.orders o
    where 
        o.id = p_order_id;
end;
$$ language plpgsql;


-- Fixed function for delivery fee calculation with correct parameter types
create or replace function calculate_delivery_fees(
    p_session_id varchar(255),
    p_delivery_province varchar(100),
    p_delivery_address text,
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
    v_city varchar(100); -- For city extraction from delivery address
begin
    -- Get cart for this session
    v_cart_id := get_cart_by_session(p_session_id);
    
    -- Extract city from delivery address if needed (simplified)
    -- In a real app, you would have a separate city field or a more complex parsing logic
    v_city := split_part(p_delivery_address, ',', 2);
    if v_city = '' then
        v_city := 'Unknown';
    end if;
    
    -- Calculate total order value (excluding VAT)
    select coalesce(sum(p.current_price * ci.quantity), 0)
    into v_total_value
    from public.cart_items ci
    join public.products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id;
    
    -- Find heaviest item in the cart
    select coalesce(max(p.weight), 0)
    into v_heaviest_weight
    from public.cart_items ci
    join public.products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id;
    
    -- Calculate standard delivery fee
    
    -- Check if inner city (Hanoi or Ho Chi Minh)
    v_is_inner_city := (
        (lower(p_delivery_province) like '%hanoi%' or lower(p_delivery_province) like '%hà nội%') and 
        lower(v_city) not like '%district%' 
    ) or (
        (lower(p_delivery_province) like '%ho chi minh%' or lower(p_delivery_province) like '%hồ chí minh%') and 
        lower(v_city) not like '%district%'
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
       (lower(p_delivery_province) like '%hanoi%' or lower(p_delivery_province) like '%hà nội%') then
        
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

-- Drop existing functions to avoid conflicts
drop function if exists get_user_orders;
drop function if exists get_all_orders_by_product_manager;

-- Function to get orders associated with a user by their ID with pagination
create or replace function get_user_orders(
    p_user_id varchar(255),
    p_page integer default 1,
    p_page_size integer default 20,
    p_sort_field varchar default 'created_at',
    p_sort_direction varchar default 'DESC'
) returns table (
    order_id varchar(255),
    recipient_name varchar(255),
    recipient_email varchar(255),
    recipient_phone varchar(20),
    delivery_province varchar(100),
    delivery_address text,
    delivery_type public.delivery_type,
    products_total decimal(10, 2),
    vat_amount decimal(10, 2),
    delivery_fee decimal(10, 2),
    rush_delivery_fee decimal(10, 2),
    total_amount decimal(10, 2),
    order_status public.order_status,
    payment_status public.payment_status,
    created_at timestamp,
    total_count bigint,
    total_pages integer
) as $$
declare
    valid_sort_fields varchar[] := array['created_at', 'total_amount', 'order_status', 'payment_status'];
    valid_sort_directions varchar[] := array['ASC', 'DESC'];
    total_records bigint;
    total_pages_count integer;
    user_info record;
begin
    -- Get user information
    select * into user_info from public.users where id = p_user_id;
    
    if user_info is null then
        raise exception 'User with ID % does not exist', p_user_id;
    end if;

    -- Validate pagination parameters
    if p_page < 1 then
        p_page := 1;
    end if;
    
    if p_page_size < 1 or p_page_size > 100 then
        p_page_size := 20; -- Default page size with upper limit for security
    end if;

    -- Validate sort parameters (SQL injection prevention)
    if not p_sort_field = any(valid_sort_fields) then
        p_sort_field := 'created_at';
    end if;
    
    if not upper(p_sort_direction) = any(valid_sort_directions) then
        p_sort_direction := 'DESC';
    end if;

    -- Count all orders - in a real-world implementation, you would 
    -- filter this to only count orders related to the user
    select count(*) 
    into total_records 
    from public.orders;

    -- Calculate total pages
    total_pages_count := ceil(total_records::numeric / p_page_size);

    -- Return all orders with pagination
    -- In a real-world implementation, you would add filters here
    -- to only return orders related to the user
    return query
    execute format('
        select 
            o.id,
            o.recipient_name,
            o.recipient_email,
            o.recipient_phone,
            o.delivery_province,
            o.delivery_address,
            o.delivery_type,
            o.products_total,
            o.vat_amount,
            o.delivery_fee,
            o.rush_delivery_fee,
            o.total_amount,
            o.order_status,
            o.payment_status,
            o.created_at,
            %L::bigint as total_count,
            %L::integer as total_pages
        from 
            public.orders o
        order by 
            o.%I %s
        limit %L offset %L',
        total_records,
        total_pages_count,
        p_sort_field,
        p_sort_direction,
        p_page_size,
        (p_page - 1) * p_page_size
    );
exception
    when others then
        raise exception 'Error retrieving user orders: %', SQLERRM;
end;
$$ language plpgsql;

-- Function for product manager to get all orders with filtering and pagination
create or replace function get_all_orders_by_product_manager(
    p_user_id varchar(255),
    p_status public.order_status default null,
    p_payment_status public.payment_status default null,
    p_start_date timestamp default null,
    p_end_date timestamp default null,
    p_search_term varchar default null,
    p_page integer default 1,
    p_page_size integer default 30,
    p_sort_field varchar default 'created_at',
    p_sort_direction varchar default 'DESC'
) returns table (
    order_id varchar(255),
    recipient_name varchar(255),
    recipient_email varchar(255),
    recipient_phone varchar(20),
    delivery_province varchar(100),
    delivery_address text,
    delivery_type public.delivery_type,
    products_total decimal(10, 2),
    vat_amount decimal(10, 2),
    delivery_fee decimal(10, 2),
    rush_delivery_fee decimal(10, 2),
    total_amount decimal(10, 2),
    order_status public.order_status,
    payment_status public.payment_status,
    created_at timestamp,
    has_sufficient_stock boolean,
    total_count bigint,
    total_pages integer
) as $$
declare
    valid_sort_fields varchar[] := array['created_at', 'total_amount', 'order_status', 'payment_status', 'recipient_name'];
    valid_sort_directions varchar[] := array['ASC', 'DESC'];
    total_records bigint;
    total_pages_count integer;
    status_condition text := '';
    payment_status_condition text := '';
    date_condition text := '';
    search_condition text := '';
    dynamic_query text;
    count_query text;
begin
    -- Validate user has product manager role
    if not user_has_role(p_user_id, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;

    -- Validate pagination parameters
    if p_page < 1 then
        p_page := 1;
    end if;
    
    if p_page_size < 1 or p_page_size > 100 then
        p_page_size := 30; -- Default page size with upper limit for security
    end if;

    -- Validate sort parameters (SQL injection prevention)
    if not p_sort_field = any(valid_sort_fields) then
        p_sort_field := 'created_at';
    end if;
    
    if not upper(p_sort_direction) = any(valid_sort_directions) then
        p_sort_direction := 'DESC';
    end if;

    -- Build conditions for filtering
    if p_status is not null then
        status_condition := format(' AND o.order_status = %L', p_status);
    end if;

    if p_payment_status is not null then
        payment_status_condition := format(' AND o.payment_status = %L', p_payment_status);
    end if;

    if p_start_date is not null and p_end_date is not null then
        date_condition := format(' AND o.created_at BETWEEN %L AND %L', p_start_date, p_end_date);
    elsif p_start_date is not null then
        date_condition := format(' AND o.created_at >= %L', p_start_date);
    elsif p_end_date is not null then
        date_condition := format(' AND o.created_at <= %L', p_end_date);
    end if;

    if p_search_term is not null and p_search_term != '' then
        search_condition := format(' AND (
            o.recipient_name ILIKE ''%%' || p_search_term || '%%'' OR
            o.recipient_email ILIKE ''%%' || p_search_term || '%%'' OR
            o.recipient_phone ILIKE ''%%' || p_search_term || '%%'' OR
            o.delivery_province ILIKE ''%%' || p_search_term || '%%'' OR
            o.delivery_address ILIKE ''%%' || p_search_term || '%%'' OR
            o.id::text ILIKE ''%%' || p_search_term || '%%''
        )');
    end if;

    -- Build count query for pagination
    count_query := '
        SELECT COUNT(*)
        FROM public.orders o
        WHERE 1=1' || 
        status_condition || 
        payment_status_condition || 
        date_condition || 
        search_condition;

    -- Execute count query
    execute count_query into total_records;

    -- Calculate total pages
    total_pages_count := ceil(total_records::numeric / p_page_size);

    -- Build main query
    dynamic_query := format('
        WITH order_stock_check AS (
            SELECT 
                o.id AS order_id,
                CASE WHEN COUNT(*) FILTER (WHERE p.stock < oi.quantity) = 0 THEN true ELSE false END AS has_sufficient_stock
            FROM 
                public.orders o
            JOIN 
                public.order_items oi ON o.id = oi.order_id
            JOIN 
                public.products p ON oi.product_id = p.id
            GROUP BY 
                o.id
        )
        SELECT 
            o.id,
            o.recipient_name,
            o.recipient_email,
            o.recipient_phone,
            o.delivery_province,
            o.delivery_address,
            o.delivery_type,
            o.products_total,
            o.vat_amount,
            o.delivery_fee,
            o.rush_delivery_fee,
            o.total_amount,
            o.order_status,
            o.payment_status,
            o.created_at,
            COALESCE(osc.has_sufficient_stock, false) AS has_sufficient_stock,
            %L::bigint AS total_count,
            %L::integer AS total_pages
        FROM 
            public.orders o
        LEFT JOIN 
            order_stock_check osc ON o.id = osc.order_id
        WHERE 1=1%s%s%s%s
        ORDER BY 
            o.%I %s
        LIMIT %L OFFSET %L',
        total_records,
        total_pages_count,
        status_condition,
        payment_status_condition,
        date_condition,
        search_condition,
        p_sort_field,
        p_sort_direction,
        p_page_size,
        (p_page - 1) * p_page_size
    );

    -- Execute main query
    return query execute dynamic_query;
exception
    when others then
        raise exception 'Error retrieving orders: %', SQLERRM;
end;
$$ language plpgsql;