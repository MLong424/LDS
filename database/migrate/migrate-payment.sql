-- Modify payment_method enum to include more providers
alter type public.payment_method add value 'PAYPAL' after 'VNPAY';
alter type public.payment_method add value 'STRIPE' after 'PAYPAL';
alter type public.payment_method add value 'MOMO' after 'STRIPE';

-- Modify payments table to be provider-agnostic
alter table public.payments 
rename column vnpay_transaction_id to transaction_id;

alter table public.payments 
rename column vnpay_transaction_datetime to transaction_datetime;

alter table public.payments 
rename column vnpay_transaction_content to transaction_content;

-- Add a column for provider-specific data
alter table public.payments 
add column provider_data jsonb default null,
add column updated_at timestamp default now();

-- Modify refunds table to be provider-agnostic
alter table public.refunds
rename column vnpay_refund_transaction_id to refund_transaction_id;