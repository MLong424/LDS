drop function if exists create_payment_transaction;
drop function if exists update_payment_status;
drop function if exists get_payment_by_id;
drop function if exists process_payment_transaction;
drop function if exists get_payment_status_history;
drop function if exists get_payments_by_order;
drop function if exists can_refund_payment;
drop function if exists is_payment_completed;
drop function if exists get_payment_refunds;

-- Create a payment transaction (wrapper for compatibility)
create or replace function create_payment_transaction(
    p_payment_id varchar(255),
    p_order_id varchar(255),
    p_amount decimal(10, 2),
    p_payment_method public.payment_method,
    p_transaction_content text default null,
    p_provider_data jsonb default null
) returns varchar(255) as $$
begin
    insert into public.payments (
        id,
        order_id,
        amount,
        payment_status,
        payment_method,
        transaction_content,
        provider_data,
        created_at,
        updated_at
    ) values (
        p_payment_id,
        p_order_id,
        p_amount,
        'PENDING',
        p_payment_method,
        p_transaction_content,
        p_provider_data,
        now(),
        now()
    );
    
    return p_payment_id;
end;
$$ language plpgsql;

-- Update payment status (wrapper for compatibility)
create or replace function update_payment_status(
    p_payment_id varchar(255),
    p_status public.payment_status
) returns boolean as $$
declare
    v_rows_affected integer;
begin
    update public.payments 
    set payment_status = p_status, updated_at = now()
    where id = p_payment_id;
    
    get diagnostics v_rows_affected = row_count;
    
    return v_rows_affected > 0;
end;
$$ language plpgsql;

-- Get payment by ID
create or replace function get_payment_by_id(
    p_payment_id varchar(255)
) returns table (
    payment_id varchar(255),
    order_id varchar(255),
    payment_amount decimal(10, 2),
    payment_status public.payment_status,
    payment_method public.payment_method,
    transaction_id varchar(255),
    transaction_datetime timestamp,
    transaction_content text,
    provider_data jsonb,
    created_at timestamp,
    updated_at timestamp
) as $$
begin
    return query
    select 
        p.id as payment_id,
        p.order_id,
        p.amount as payment_amount,
        p.payment_status,
        p.payment_method,
        p.transaction_id,
        p.transaction_datetime,
        p.transaction_content,
        p.provider_data,
        p.created_at,
        p.updated_at
    from public.payments p
    where p.id = p_payment_id;
end;
$$ language plpgsql;

-- Process payment using the existing function (wrapper for compatibility)
create or replace function process_payment_transaction(
    p_order_id varchar(255),
    p_payment_method public.payment_method,
    p_transaction_id varchar(255),
    p_transaction_datetime timestamp,
    p_transaction_content text,
    p_provider_data jsonb default null
) returns varchar(255) as $$
begin
    -- Use the existing process_payment function
    return process_payment(
        p_order_id,
        p_payment_method,
        p_transaction_id,
        p_transaction_datetime,
        p_transaction_content,
        p_provider_data
    );
end;
$$ language plpgsql;

-- Get payment status history
create or replace function get_payment_status_history(
    p_payment_id varchar(255)
) returns table (
    history_id integer,
    payment_id varchar(255),
    old_status public.payment_status,
    new_status public.payment_status,
    changed_at timestamp,
    changed_by varchar(255),
    notes text
) as $$
begin
    return query
    select 
        psh.id as history_id,
        psh.payment_id,
        psh.old_status,
        psh.new_status,
        psh.changed_at,
        psh.changed_by,
        psh.notes
    from public.payment_status_history psh
    where psh.payment_id = p_payment_id
    order by psh.changed_at desc;
end;
$$ language plpgsql;

-- Get payments by order ID
create or replace function get_payments_by_order(
    p_order_id varchar(255)
) returns table (
    payment_id varchar(255),
    order_id varchar(255),
    payment_amount decimal(10, 2),
    payment_status public.payment_status,
    payment_method public.payment_method,
    transaction_id varchar(255),
    transaction_datetime timestamp,
    transaction_content text,
    provider_data jsonb,
    created_at timestamp,
    updated_at timestamp
) as $$
begin
    return query
    select 
        p.id as payment_id,
        p.order_id,
        p.amount as payment_amount,
        p.payment_status,
        p.payment_method,
        p.transaction_id,
        p.transaction_datetime,
        p.transaction_content,
        p.provider_data,
        p.created_at,
        p.updated_at
    from public.payments p
    where p.order_id = p_order_id
    order by p.created_at desc;
end;
$$ language plpgsql;

-- Validate payment refund eligibility
create or replace function can_refund_payment(
    p_payment_id varchar(255)
) returns boolean as $$
declare
    v_payment_status public.payment_status;
begin
    select payment_status into v_payment_status
    from public.payments
    where id = p_payment_id;
    
    -- Can only refund completed payments
    return v_payment_status = 'COMPLETED';
end;
$$ language plpgsql;

-- Check if payment is completed
create or replace function is_payment_completed(
    p_payment_id varchar(255)
) returns boolean as $$
declare
    v_payment_status public.payment_status;
begin
    select payment_status into v_payment_status
    from public.payments
    where id = p_payment_id;
    
    return v_payment_status = 'COMPLETED';
end;
$$ language plpgsql;

-- Get refunds for a payment
create or replace function get_payment_refunds(
    p_payment_id varchar(255)
) returns table (
    refund_id varchar(255),
    payment_id varchar(255),
    refund_amount decimal(10, 2),
    refund_status varchar(50),
    refund_datetime timestamp,
    refund_reason text,
    refund_transaction_id varchar(255)
) as $$
begin
    return query
    select 
        r.id as refund_id,
        r.payment_id,
        r.amount as refund_amount,
        r.status as refund_status,
        r.refund_datetime,
        r.refund_reason,
        r.refund_transaction_id
    from public.refunds r
    where r.payment_id = p_payment_id
    order by r.refund_datetime desc;
end;
$$ language plpgsql;