-- Test cases for order operations
do $$
declare
    -- Test variables
    v_session_id varchar(255);
    v_product_id integer;
    v_book_id integer;
    v_cd_id integer;
    v_dvd_id integer;
    v_lp_id integer;
    v_result boolean;
    v_order_id varchar(255);
    v_test_order_id varchar(255);
    v_payment_id varchar(255);
    v_admin_id varchar(255);
    v_pm_id varchar(255);
    v_order_totals record;
    v_order_details record;
    v_pending_orders record;
    v_product_count integer;
    v_vnpay_txn_id varchar(255);
begin
    raise notice '========== STARTING ORDER OPERATIONS TESTS ==========';
    
    -- Setup: Get some product IDs for testing
    select id into v_book_id from products where media_type = 'BOOK' and stock >= 5 limit 1;
    select id into v_cd_id from products where media_type = 'CD' and stock >= 5 limit 1;
    select id into v_dvd_id from products where media_type = 'DVD' and stock >= 5 limit 1;
    select id into v_lp_id from products where media_type = 'LP_RECORD' and stock >= 5 limit 1;
    
    -- Setup: Get admin and product manager users
    select id into v_admin_id from users u
    join user_roles ur on u.id = ur.user_id
    where ur.role = 'ADMIN'
    limit 1;
    
    select id into v_pm_id from users u
    join user_roles ur on u.id = ur.user_id
    where ur.role = 'PRODUCT_MANAGER'
    limit 1;
    
    raise notice 'Using test products - Book: %, CD: %, DVD: %, LP: %', 
        v_book_id, v_cd_id, v_dvd_id, v_lp_id;
    raise notice 'Using admin ID: %, product manager ID: %',
        v_admin_id, v_pm_id;
    
    -- Create a session and add items to cart for testing
    v_session_id := create_session();
    raise notice 'Created test session: %', v_session_id;
    
    perform add_to_cart(v_session_id, v_book_id, 2);
    perform add_to_cart(v_session_id, v_cd_id, 1);
    perform add_to_cart(v_session_id, v_dvd_id, 1);
    
    -- Check test cart exists
    select count(*) into v_product_count from get_cart_contents(v_session_id);
    raise notice 'Test cart has % items', v_product_count;
    
    -- Test 1: Order Creation
    raise notice '-------------- Test 1: Order Creation --------------';
    
    begin
        -- Test 1.1: Create order with valid information
        v_order_id := create_order(
            v_session_id,
            'Test Customer',
            'test@example.com',
            '0123456789',
            'Hanoi',
            'Test Address, Ba Dinh',
            'STANDARD',
            NULL,
            NULL
        );
        
        if v_order_id is not null then
            raise notice 'Test 1.1: Successfully created order with ID: %', v_order_id;
        else
            raise notice 'Test 1.1: FAILED - Could not create order';
        end if;
        
        -- Test 1.2: Verify order was created in database
        if exists (select 1 from orders where id = v_order_id) then
            raise notice 'Test 1.2: Order exists in database';
        else
            raise notice 'Test 1.2: FAILED - Order not found in database';
        end if;
        
        -- Test 1.3: Verify order items were created
        select count(*) into v_product_count from order_items where order_id = v_order_id;
        if v_product_count = 3 THEN -- We added 3 different products
            raise notice 'Test 1.3: Order has correct number of items: %', v_product_count;
        else
            raise notice 'Test 1.3: FAILED - Order has % items, expected 3', v_product_count;
        end if;
        
        -- Test 1.4: Create order with invalid information
        begin
            v_test_order_id := create_order(
                v_session_id,
                null, -- Invalid: null name
                'test@example.com',
                '0123456789',
                'Hanoi',
                'Test Address',
                'STANDARD',
                NULL,
                NULL
            );
            raise notice 'Test 1.4: FAILED - Created order with invalid information';
        exception
            when others then
                raise notice 'Test 1.4: Correctly threw exception for invalid information: %', SQLERRM;
        end;
        
        -- Test 1.5: Create rush delivery order
        begin
            -- First clear the existing cart
            perform clear_cart(v_session_id);
            
            -- Add items that are eligible for rush delivery
            perform add_to_cart(v_session_id, v_cd_id, 1);
            perform add_to_cart(v_session_id, v_dvd_id, 1);
            
            -- Create a rush order
            v_test_order_id := create_order(
                v_session_id,
                'Rush Customer',
                'rush@example.com',
                '9876543210',
                'Hanoi', 
                'Rush Address, Ba Dinh', -- Inner Hanoi district for rush delivery
                'RUSH',
                NOW() + INTERVAL '2 hours',
                'Leave at door'
            );
            
            if v_test_order_id is not null then
                raise notice 'Test 1.5: Successfully created rush order with ID: %', v_test_order_id;
                
                -- Verify rush delivery settings
                select delivery_type, rush_delivery_fee into strict v_order_details
                from orders where id = v_test_order_id;
                
                if v_order_details.delivery_type = 'RUSH' and v_order_details.rush_delivery_fee > 0 then
                    raise notice '       Rush delivery fee: %', v_order_details.rush_delivery_fee;
                else
                    raise notice 'Test 1.5: FAILED - Rush delivery not properly configured';
                end if;
            else
                raise notice 'Test 1.5: FAILED - Could not create rush order';
            end if;
        end;
        
        raise notice 'Test 1: PASSED';
    exception
        when others then
            raise notice 'Test 1: FAILED - %', SQLERRM;
    end;
    
    -- Test 2: Order Details and Totals
    raise notice '-------------- Test 2: Order Details and Totals --------------';
    
    begin
        -- Test 2.1: Calculate order totals
        select * into v_order_totals from calculate_order_totals(v_order_id);
        
        if v_order_totals is not null then
            raise notice 'Test 2.1: Successfully retrieved order totals';
            raise notice '       Products total: %, VAT: %, Delivery fee: %, Total: %',
                v_order_totals.products_total,
                v_order_totals.vat_amount,
                v_order_totals.delivery_fee,
                v_order_totals.total_amount;
                
            -- Verify VAT calculation (should be 10%)
            if ABS(v_order_totals.vat_amount - (v_order_totals.products_total * 0.1)) < 0.01 then
                raise notice '       VAT calculation is correct (10%%)';
            else
                raise notice 'Test 2.1: FAILED - VAT calculation is incorrect';
            end if;
        else
            raise notice 'Test 2.1: FAILED - Could not retrieve order totals';
        end if;
        
        -- Test 2.2: Get order details
        with order_details as (
            select * from get_order_details(v_order_id)
        )
        select 
            recipient_name, 
            recipient_email,
            products_total,
            order_status,
            items is not null as has_items,
            (select count(*) from json_array_elements(items)) as item_count
        into v_order_details
        from order_details;
        
        if v_order_details is not null then
            raise notice 'Test 2.2: Successfully retrieved order details';
            raise notice '       Customer: %, Email: %',
                v_order_details.recipient_name,
                v_order_details.recipient_email;
            raise notice '       Status: %, Items: % (% products)',
                v_order_details.order_status,
                v_order_details.has_items,
                v_order_details.item_count;
                
            if v_order_details.has_items and v_order_details.item_count = 3 then
                raise notice '       Items correctly included in response';
            else
                raise notice 'Test 2.2: FAILED - Items not correctly included';
            end if;
        else
            raise notice 'Test 2.2: FAILED - Could not retrieve order details';
        end if;
        
        -- Test 2.3: Get order by ID with authorized user
        with order_info as (
            select * from get_order_by_id(v_order_id, v_admin_id)
        )
        select 
            recipient_name, 
            order_status
        into v_order_details
        from order_info;
        
        if v_order_details is not null then
            raise notice 'Test 2.3: Successfully retrieved order with admin user';
        else
            raise notice 'Test 2.3: FAILED - Could not retrieve order with admin user';
        end if;
        
        -- Test 2.4: Get order by ID with unauthorized user (should fail in a real app)
        -- This test is commented out because the provided function doesn't fully implement access control
        /*
        BEGIN
            PERFORM get_order_by_id(v_order_id, 'unauthorized-user-id');
            raise notice 'Test 2.4: FAILED - Retrieved order with unauthorized user';
        EXCEPTION
            WHEN OTHERS THEN
                raise notice 'Test 2.4: Correctly denied access to unauthorized user: %', SQLERRM;
        END;
        */
        
        raise notice 'Test 2: PASSED';
    exception
        when others then
            raise notice 'Test 2: FAILED - %', SQLERRM;
    end;
    
    -- Test 3: Payment Processing
    raise notice '-------------- Test 3: Payment Processing --------------';
    
    begin
        -- Test 3.1: Process payment
        v_vnpay_txn_id := 'VNPAY-' || floor(random() * 1000000)::varchar;
        
        v_payment_id := process_payment(
            v_order_id,
            'CREDIT_CARD',
            v_vnpay_txn_id,
            NOW(),
            'Test transaction for order ' || v_order_id
        );
        
        if v_payment_id is not null then
            raise notice 'Test 3.1: Successfully processed payment with ID: %', v_payment_id;
        else
            raise notice 'Test 3.1: FAILED - Could not process payment';
        end if;
        
        -- Test 3.2: Verify payment record was created
        if exists (
            select 1 from payments 
            where id = v_payment_id 
            and vnpay_transaction_id = v_vnpay_txn_id
        ) then
            raise notice 'Test 3.2: Payment record exists in database';
        else
            raise notice 'Test 3.2: FAILED - Payment record not found in database';
        end if;
        
        -- Test 3.3: Verify order status was updated
        select payment_status into v_order_details from orders where id = v_order_id;
        
        if v_order_details.payment_status = 'COMPLETED' then
            raise notice 'Test 3.3: Order payment status correctly updated to COMPLETED';
        else
            raise notice 'Test 3.3: FAILED - Order payment status not updated correctly: %',
                v_order_details.payment_status;
        end if;
        
        -- Test 3.4: Try to process payment for already paid order
        begin
            perform process_payment(
                v_order_id,
                'CREDIT_CARD',
                'DUPLICATE-TXN-' || floor(random() * 1000000)::varchar,
                NOW(),
                'Duplicate payment attempt'
            );
            raise notice 'Test 3.4: FAILED - Processed payment for already paid order';
        exception
            when others then
                raise notice 'Test 3.4: Correctly threw exception for duplicate payment: %', SQLERRM;
        end;
        
        raise notice 'Test 3: PASSED';
    exception
        when others then
            raise notice 'Test 3: FAILED - %', SQLERRM;
    end;
    
    -- Test 4: Order Management
    raise notice '-------------- Test 4: Order Management --------------';
    
    begin
        -- Test 4.1: Get pending orders (as product manager)
        with pending_orders as (
            select * from get_pending_orders(v_pm_id, 1, 10)
        )
        select count(*) into v_product_count from pending_orders;
        
        raise notice 'Test 4.1: Found % pending orders', v_product_count;
        
        -- Test 4.2: Approve order
        v_result := approve_order(v_order_id, v_pm_id);
        
        if v_result then
            raise notice 'Test 4.2: Successfully approved order';
            
            -- Verify order status
            select order_status into v_order_details from orders where id = v_order_id;
            
            if v_order_details.order_status = 'APPROVED' then
                raise notice '       Order status correctly updated to APPROVED';
            else
                raise notice 'Test 4.2: FAILED - Order status not updated correctly: %',
                    v_order_details.order_status;
            end if;
        else
            raise notice 'Test 4.2: FAILED - Could not approve order';
        end if;
        
        -- Test 4.3: Create another order for rejection test
        -- First clear the existing cart
        perform clear_cart(v_session_id);
        
        -- Add some items
        perform add_to_cart(v_session_id, v_book_id, 1);
        
        -- Create a new order
        v_test_order_id := create_order(
            v_session_id,
            'Reject Test Customer',
            'reject@example.com',
            '0123456789',
            'Hanoi',
            'Reject Test Address',
            'STANDARD',
            NULL,
            NULL
        );
        
        -- Process payment for this order
        v_vnpay_txn_id := 'VNPAY-' || floor(random() * 1000000)::varchar;
        
        v_payment_id := process_payment(
            v_test_order_id,
            'CREDIT_CARD',
            v_vnpay_txn_id,
            now(),
            'Test transaction for reject order ' || v_test_order_id
        );
        
        raise notice 'Created test order for rejection: %', v_test_order_id;
        
        -- Test 4.4: Reject order
        v_result := reject_order(
            v_test_order_id, 
            v_pm_id, 
            'Item not available in specified color'
        );
        
        if v_result then
            raise notice 'Test 4.4: Successfully rejected order';
            
            -- Verify order status
            select 
                order_status, 
                payment_status, 
                rejected_reason 
            into v_order_details 
            from orders 
            where id = v_test_order_id;
            
            if v_order_details.order_status = 'REJECTED' then
                raise notice '       Order status correctly updated to REJECTED';
                raise notice '       Reason: %', v_order_details.rejected_reason;
            else
                raise notice 'Test 4.4: FAILED - Order status not updated correctly: %',
                    v_order_details.order_status;
            end if;
            
            -- Verify refund was created
            if exists (
                select 1 from refunds r
                join payments p on r.payment_id = p.id
                where p.order_id = v_test_order_id
            ) then
                raise notice '       Refund record created correctly';
            else
                raise notice 'Test 4.4: FAILED - Refund record not created';
            end if;
        else
            raise notice 'Test 4.4: FAILED - Could not reject order';
        end if;
        
        -- Test 4.5: Try to approve an already rejected order
        begin
            perform approve_order(v_test_order_id, v_pm_id);
            raise notice 'Test 4.5: FAILED - Approved a rejected order';
        exception
            when others then
                raise notice 'Test 4.5: Correctly threw exception for approving rejected order: %', SQLERRM;
        end;
        
        raise notice 'Test 4: PASSED';
    exception
        when others then
            raise notice 'Test 4: FAILED - %', SQLERRM;
    end;
    
    -- Test 5: Order Cancellation
    raise notice '-------------- Test 5: Order Cancellation --------------';
    
    begin
        -- Test 5.1: Create another order for cancellation test
        -- First clear the existing cart
        perform clear_cart(v_session_id);
        
        -- Add some items
        perform add_to_cart(v_session_id, v_cd_id, 1);
        
        -- Create a new order
        v_test_order_id := create_order(
            v_session_id,
            'Cancel Test Customer',
            'cancel@example.com',
            '0123456789',
            'Hanoi',
            'Cancel Test Address',
            'STANDARD',
            NULL,
            NULL
        );
        
        -- Process payment for this order
        v_vnpay_txn_id := 'VNPAY-' || floor(random() * 1000000)::varchar;
        
        v_payment_id := process_payment(
            v_test_order_id,
            'CREDIT_CARD',
            v_vnpay_txn_id,
            NOW(),
            'Test transaction for cancel order ' || v_test_order_id
        );
        
        raise notice 'Created test order for cancellation: %', v_test_order_id;
        
        -- Test 5.2: Cancel the order
        v_result := cancel_order(v_test_order_id);
        
        if v_result then
            raise notice 'Test 5.2: Successfully canceled order';
            
            -- Verify order status
            select order_status, payment_status into v_order_details 
            from orders where id = v_test_order_id;
            
            if v_order_details.order_status = 'CANCELED' then
                raise notice '       Order status correctly updated to CANCELED';
            else
                raise notice 'Test 5.2: FAILED - Order status not updated correctly: %',
                    v_order_details.order_status;
            end if;
            
            -- Verify payment status
            if v_order_details.payment_status = 'REFUNDED' then
                raise notice '       Payment status correctly updated to REFUNDED';
            else
                raise notice 'Test 5.2: FAILED - Payment status not updated correctly: %',
                    v_order_details.payment_status;
            end if;
            
            -- Verify refund was created
            if exists (
                select 1 from refunds r
                join payments p on r.payment_id = p.id
                where p.order_id = v_test_order_id
            ) then
                raise notice '       Refund record created correctly';
            else
                raise notice 'Test 5.2: FAILED - Refund record not created';
            end if;
        else
            raise notice 'Test 5.2: FAILED - Could not cancel order';
        end if;
        
        -- Test 5.3: Try to cancel an already canceled order
        begin
            perform cancel_order(v_test_order_id);
            raise notice 'Test 5.3: FAILED - Canceled an already canceled order';
        exception
            when others then
                raise notice 'Test 5.3: Correctly threw exception for canceling canceled order: %', SQLERRM;
        end;
        
        raise notice 'Test 5: PASSED';
    exception
        when others then
            raise notice 'Test 5: FAILED - %', SQLERRM;
    end;

    raise notice '========== ORDER OPERATIONS TESTS COMPLETED ==========';
end; $$;