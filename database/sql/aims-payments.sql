-- Drop existing functions to avoid conflicts
drop function if exists record_payment_transaction;
drop function if exists record_vnpay_transaction;
drop function if exists refund_payment;
drop function if exists get_payment_transaction_info;
drop function if exists get_payment_by_transaction_id;

-- Function to record VNPay transaction information
create or replace function record_payment_transaction(
    p_payment_id varchar(255),
    p_transaction_id varchar(255),
    p_transaction_datetime timestamp with time zone,
    p_transaction_content text,
    p_transaction_status varchar(50),
    p_provider_data jsonb default null
) returns boolean as $$
begin
    -- Update payment with transaction information
    update public.payments
    set 
        transaction_id = p_transaction_id,
        transaction_datetime = p_transaction_datetime,
        transaction_content = p_transaction_content,
        provider_data = coalesce(provider_data, '{}'::jsonb) || coalesce(p_provider_data, '{}'::jsonb),
        payment_status = 
            case 
                when p_transaction_status = 'SUCCESS' then 'COMPLETED'::public.payment_status
                when p_transaction_status = 'FAILED' then 'FAILED'::public.payment_status
                ELSE payment_status
            end,
        updated_at = now()
    where id = p_payment_id;
    
    -- Check if the payment was updated
    if not found then
        raise exception 'Payment with ID % not found', p_payment_id;
    end if;
    
    return true;
exception
    when others then
        raise exception 'Error recording payment transaction: %', sqlerrm;
        return false;
end;
$$ language plpgsql;

-- Backward compatibility function for VNPAY
create or replace function record_vnpay_transaction(
    p_payment_id varchar(255),
    p_transaction_id varchar(255),
    p_transaction_datetime timestamp with time zone,
    p_transaction_content text,
    p_transaction_status varchar(50)
) returns boolean as $$
begin
    -- Call the new generic function
    return record_payment_transaction(
        p_payment_id,
        p_transaction_id,
        p_transaction_datetime,
        p_transaction_content,
        p_transaction_status,
        jsonb_build_object('provider', 'VNPAY')
    );
end;
$$ language plpgsql;

-- Function to refund a payment through VNPay
create or replace function refund_payment(
    p_payment_id varchar(255),
    p_reason text,
    p_refund_transaction_id varchar(255) default null,
    p_provider_data jsonb default null
) returns varchar(255) as $$
declare
    v_refund_id varchar(255);
    v_payment_status public.payment_status;
    v_payment_amount decimal(10, 2);
    v_order_id varchar(255);
begin
    -- Check if payment exists and can be refunded
    select payment_status, amount, order_id
    into v_payment_status, v_payment_amount, v_order_id
    from public.payments
    where id = p_payment_id;
    
    if v_payment_status is null then
        raise exception 'Payment with ID % not found', p_payment_id;
    end if;
    
    if v_payment_status != 'COMPLETED' then
        raise exception 'Cannot refund payment with status %', v_payment_status;
    end if;
    
    -- Generate refund ID
    v_refund_id := uuid_generate_v4()::varchar;
    
    -- Record refund
    insert into public.refunds (
        id,
        payment_id,
        amount,
        status,
        refund_datetime,
        refund_reason,
        refund_transaction_id
    ) values (
        v_refund_id,
        p_payment_id,
        v_payment_amount,
        'COMPLETED',
        now(),
        p_reason,
        p_refund_transaction_id
    );
    
    -- Update payment status and provider data
    update public.payments
    set 
        payment_status = 'REFUNDED',
        provider_data = coalesce(provider_data, '{}'::jsonb) || 
                       coalesce(p_provider_data, '{}'::jsonb) || 
                       jsonb_build_object('refund_reason', p_reason, 'refund_datetime', now()),
        updated_at = now()
    where id = p_payment_id;
    
    -- Update order payment status
    update public.orders
    set payment_status = 'REFUNDED'
    where id = v_order_id;
    
    return v_refund_id;
exception
    when others then
        raise exception 'Error refunding payment: %', sqlerrm;
end;
$$ language plpgsql;

-- Function to get payment transaction information for customer
create or replace function get_payment_transaction_info(
    p_order_id varchar(255)
) returns table (
    payment_id varchar(255),
    transaction_id varchar(255),
    transaction_datetime timestamp with time zone,
    transaction_content text,
    payment_status public.payment_status,
    payment_method public.payment_method,
    payment_amount decimal(10, 2),
    provider_data jsonb,
    refund_info json
) as $$
begin
    return query
    select 
        p.id as payment_id,
        p.transaction_id,
        p.transaction_datetime,
        p.transaction_content,
        p.payment_status,
        p.payment_method,
        p.amount as payment_amount,
        p.provider_data,
        (
            select json_agg(json_build_object(
                'refund_id', r.id,
                'amount', r.amount,
                'status', r.status,
                'refund_datetime', r.refund_datetime,
                'refund_reason', r.refund_reason,
                'refund_transaction_id', r.refund_transaction_id
            ))
            from public.refunds r
            where r.payment_id = p.id
        ) as refund_info
    from 
        public.payments p
    where 
        p.order_id = p_order_id;
end;
$$ language plpgsql;

-- Function to get payment by transaction ID
create or replace function get_payment_by_transaction_id(
    p_transaction_id varchar(255)
) returns table (
    payment_id varchar(255),
    order_id varchar(255),
    payment_status public.payment_status,
    payment_amount decimal(10, 2),
    payment_method public.payment_method,
    transaction_datetime timestamp with time zone,
    transaction_content text,
    provider_data jsonb
) as $$
begin
    return query
    select 
        p.id as payment_id,
        p.order_id,
        p.payment_status,
        p.amount as payment_amount,
        p.payment_method,
        p.transaction_datetime,
        p.transaction_content,
        p.provider_data
    from 
        public.payments p
    where 
        p.transaction_id = p_transaction_id;
end;
$$ language plpgsql;

-- Create payment_status_history table if not exists
drop table if exists public.payment_status_history cascade;
create table if not exists public.payment_status_history (
    id serial primary key,
    payment_id varchar(255) not null,
    old_status public.payment_status,
    new_status public.payment_status not null,
    changed_at timestamp not null default now(),
    changed_by varchar(255),
    notes text,
    constraint fk_payment_id foreign key (payment_id) 
        references public.payments (id) on delete cascade
);

-- Trigger function to log payment status changes
create or replace function log_payment_status_change()
returns trigger as $$
begin
    -- Only proceed if status changed
    if old.payment_status <> new.payment_status then
        -- Insert into payment status history table
        insert into public.payment_status_history (
            payment_id,
            old_status,
            new_status,
            changed_at,
            notes
        ) values (
            new.id,
            old.payment_status,
            new.payment_status,
            now(),
            'Payment status changed'
        );
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Create trigger for payment status history
drop trigger if exists trg_payment_status_change on public.payments;
create trigger trg_payment_status_change
after update of payment_status on public.payments
for each row
execute function log_payment_status_change();

-- Function to update order status after payment
create or replace function update_order_after_payment()
returns trigger as $$
begin
    -- if payment status changed to COMPLETED
    if new.payment_status = 'COMPLETED' and old.payment_status <> 'COMPLETED' then
        -- Update order payment status
        update public.orders
        set payment_status = 'COMPLETED'
        where id = new.order_id;
        
        -- Insert order status history
        insert into public.order_status_history (
            order_id,
            old_status,
            new_status,
            changed_at,
            notes
        ) 
        select 
            new.order_id,
            order_status,
            order_status, -- keeping the same status, just logging payment completion
            now(),
            'Payment completed with transaction ID: ' || NEW.transaction_id
        from 
            public.orders
        where 
            id = new.order_id;
    
    -- if payment status changed to REFUNDED
    elsif new.payment_status = 'REFUNDED' and old.payment_status <> 'REFUNDED' then
        -- Update order payment status
        update public.orders
        set payment_status = 'REFUNDED'
        where id = new.order_id;
        
        -- Insert order status history
        insert into public.order_status_history (
            order_id,
            old_status,
            new_status,
            changed_at,
            notes
        ) 
        select 
            new.order_id,
            order_status,
            order_status, -- keeping the same status, just logging refund
            now(),
            'Payment refunded'
        from 
            public.orders
        where 
            id = new.order_id;
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Create trigger for updating order after payment changes
drop trigger if exists trg_update_order_after_payment on public.payments;
create trigger trg_update_order_after_payment
after update of payment_status on public.payments
for each row
execute function update_order_after_payment();

-- Function to get all payment info for an order
create or replace function get_full_order_payment_info(
    p_order_id varchar(255)
) returns table (
    order_id varchar(255),
    order_status public.order_status,
    payment_status public.payment_status,
    total_amount decimal(10, 2),
    payment_info json,
    refund_info json
) as $$
begin
    return query
    select 
        o.id as order_id,
        o.order_status,
        o.payment_status,
        o.total_amount,
        (
            select json_agg(json_build_object(
                'payment_id', p.id,
                'amount', p.amount,
                'payment_status', p.payment_status,
                'payment_method', p.payment_method,
                'transaction_id', p.transaction_id,
                'transaction_datetime', p.transaction_datetime,
                'transaction_content', p.transaction_content,
                'provider_data', p.provider_data,
                'created_at', p.created_at
            ))
            from public.payments p
            where p.order_id = o.id
        ) as payment_info,
        (
            select json_agg(json_build_object(
                'refund_id', r.id,
                'payment_id', r.payment_id,
                'amount', r.amount,
                'status', r.status,
                'refund_datetime', r.refund_datetime,
                'refund_reason', r.refund_reason,
                'refund_transaction_id', r.refund_transaction_id
            ))
            from public.refunds r
            join public.payments p on r.payment_id = p.id
            where p.order_id = o.id
        ) as refund_info
    from 
        public.orders o
    where 
        o.id = p_order_id;
end;
$$ language plpgsql;