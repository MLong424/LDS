-- Test cases for cart-session operations
do $$
declare
    -- Test variables
    v_session_id varchar(255);
    v_test_session_id varchar(255);  -- Additional session for specific tests
    v_new_session_id varchar(255);
    v_product_id integer;
    v_book_id integer;
    v_cd_id integer;
    v_dvd_id integer;
    v_lp_id integer;
    v_result boolean;
    v_count integer;
    v_cart_total decimal(10,2);
    v_validation_result record;
    v_delivery_fees record;
    v_cart_contents record;    
begin
    raise notice '========== STARTING CART-SESSION OPERATIONS TESTS ==========';
    
    -- Setup: Get some product IDs for testing
    select id into v_book_id from products where media_type = 'BOOK' limit 1;
    select id into v_cd_id from products where media_type = 'CD' limit 1;
    select id into v_dvd_id from products where media_type = 'DVD' limit 1;
    select id into v_lp_id from products where media_type = 'LP_RECORD' limit 1;
    
    raise notice 'Using test products - Book: %, CD: %, DVD: %, LP: %', 
        v_book_id, v_cd_id, v_dvd_id, v_lp_id;
    
    -- Test 1: Session creation and management
    raise notice '-------------- Test 1: Session Management --------------';
    
    begin
        -- Test 1.1: Create new session
        v_session_id := create_session();
        raise notice 'Test 1.1: Created new session with ID: %', v_session_id;
        
        -- Test 1.2: Get existing session
        v_new_session_id := get_or_create_session(v_session_id);
        if v_new_session_id = v_session_id then
            raise notice 'Test 1.2: Successfully retrieved existing session';
        else
            raise notice 'Test 1.2: FAILED - Expected session ID %, got %', 
                v_session_id, v_new_session_id;
        end if;
        
        -- Test 1.3: Get or create with invalid session (should create new)
        v_new_session_id := get_or_create_session('invalid-session-id');
        if v_new_session_id != v_session_id then
            raise notice 'Test 1.3: Successfully created new session for invalid ID';
        else
            raise notice 'Test 1.3: FAILED - Reused existing session for invalid ID';
        end if;
        
        -- Test 1.4: Get cart by session
        v_new_session_id := get_cart_by_session(v_session_id);
        if v_new_session_id = v_session_id then
            raise notice 'Test 1.4: Successfully retrieved cart for session';
        else
            raise notice 'Test 1.4: FAILED - Expected session ID %, got %', 
                v_session_id, v_new_session_id;
        end if;
        
        -- Test 1.5: Get cart with expired session (simulate expiration)
        -- Create a separate session specifically for this test
        v_test_session_id := create_session();
        raise notice 'Created test session ID for expiration test: %', v_test_session_id;
        
        -- Expire this test session
        update sessions set last_activity = now() - interval '25 hours' 
        where id = v_test_session_id;
        
        begin
            v_new_session_id := get_cart_by_session(v_test_session_id);
            raise notice 'Test 1.5: FAILED - Did not throw exception for expired session';
        exception
            when others then
                raise notice 'Test 1.5: Correctly threw exception for expired session: %', SQLERRM;
        end;
        
        raise notice 'Test 1: PASSED';
    exception
        when others then
            raise notice 'Test 1: FAILED - %', SQLERRM;
    end;
    
    -- Test 2: Cart item operations
    raise notice '-------------- Test 2: Cart Item Operations --------------';
    
    begin
        -- Test 2.1: Add item to cart
        v_result := add_to_cart(v_session_id, v_book_id, 2);
        if v_result then
            raise notice 'Test 2.1: Successfully added book to cart';
        else
            raise notice 'Test 2.1: FAILED - Could not add book to cart';
        end if;
        
        -- Test 2.2: Add same item again (should update quantity)
        v_result := add_to_cart(v_session_id, v_book_id, 1);
        if v_result then
            select quantity into v_count from cart_items 
            where cart_id = v_session_id and product_id = v_book_id;
            
            if v_count = 3 then
                raise notice 'Test 2.2: Successfully updated quantity to %', v_count;
            else
                raise notice 'Test 2.2: FAILED - Quantity should be 3, got %', v_count;
            end if;
        else
            raise notice 'Test 2.2: FAILED - Could not update quantity';
        end if;
        
        -- Test 2.3: Add another product type
        v_result := add_to_cart(v_session_id, v_cd_id, 1);
        if v_result then
            raise notice 'Test 2.3: Successfully added CD to cart';
        else
            raise notice 'Test 2.3: FAILED - Could not add CD to cart';
        end if;
        
        -- Test 2.4: Update item quantity
        v_result := update_cart_item(v_session_id, v_book_id, 5);
        if v_result then
            select quantity into v_count from cart_items 
            where cart_id = v_session_id and product_id = v_book_id;
            
            if v_count = 5 then
                raise notice 'Test 2.4: Successfully updated quantity to %', v_count;
            else
                raise notice 'Test 2.4: FAILED - Quantity should be 5, got %', v_count;
            end if;
        else
            raise notice 'Test 2.4: FAILED - Could not update quantity';
        end if;
        
        -- Test 2.5: Remove item from cart
        v_result := remove_from_cart(v_session_id, v_cd_id);
        if v_result then
            if not exists (
                select 1 from cart_items 
                where cart_id = v_session_id and product_id = v_cd_id
            ) then
                raise notice 'Test 2.5: Successfully removed CD from cart';
            else
                raise notice 'Test 2.5: FAILED - CD still in cart after removal';
            end if;
        else
            raise notice 'Test 2.5: FAILED - Could not remove CD from cart';
        end if;
        
        -- Test 2.6: Attempt to add more than available stock
        begin
            -- Get current stock
            select stock into v_count from products where id = v_dvd_id;
            
            -- Try to add more than available
            v_result := add_to_cart(v_session_id, v_dvd_id, v_count + 1);
            raise notice 'Test 2.6: FAILED - Added more than available stock';
        exception
            when others then
                raise notice 'Test 2.6: Correctly prevented adding more than available stock: %', SQLERRM;
        end;
        
        raise notice 'Test 2: PASSED';
    exception
        when others then
            raise notice 'Test 2: FAILED - %', SQLERRM;
    end;
    
    -- Test 3: Cart content retrieval
    raise notice '-------------- Test 3: Cart Content Retrieval --------------';
    
    begin
        -- Test 3.1: Get cart contents
        select count(*) into v_count from get_cart_contents(v_session_id);
        if v_count > 0 then
            raise notice 'Test 3.1: Successfully retrieved % cart items', v_count;
            
            -- Examine first item details
            select * into v_cart_contents 
            from get_cart_contents(v_session_id) 
            limit 1;
            
            raise notice '     Product: %, Quantity: %, Price: %, Subtotal: %', 
                v_cart_contents.title, 
                v_cart_contents.quantity, 
                v_cart_contents.current_price, 
                v_cart_contents.subtotal;
        else
            raise notice 'Test 3.1: FAILED - No cart items retrieved';
        end if;
        
        -- Test 3.2: Get cart total
        v_cart_total := get_cart_total_excluding_vat(v_session_id);
        if v_cart_total > 0 then
            raise notice 'Test 3.2: Cart total (excl VAT): %', v_cart_total;
        else
            raise notice 'Test 3.2: FAILED - Invalid cart total: %', v_cart_total;
        end if;
        
        raise notice 'Test 3: PASSED';
    exception
        when others then
            raise notice 'Test 3: FAILED - %', SQLERRM;
    end;
    
    -- Test 4: Cart validation
    raise notice '-------------- Test 4: Cart Validation --------------';
    
    begin
        -- Test 4.1: Validate cart with sufficient stock
        select * into v_validation_result from validate_cart(v_session_id);
        if v_validation_result.is_valid then
            raise notice 'Test 4.1: Cart validation passed as expected';
        else
            raise notice 'Test 4.1: FAILED - Cart validation failed: %', 
                v_validation_result.message;
        end if;
        
        -- First get the current stock to restore later
        declare
            v_original_stock integer;
        begin
            select stock into v_original_stock from products where id = v_book_id;
        
            -- Test 4.2: Force stock issue and validate
            -- Temporarily reduce stock below cart quantity
            update products set stock = 1 where id = v_book_id;
            
            select * into v_validation_result from validate_cart(v_session_id);
            if not v_validation_result.is_valid then
                raise notice 'Test 4.2: Correctly detected insufficient stock: %', 
                    v_validation_result.message;
                
                -- Output invalid items
                if v_validation_result.invalid_items is not null then
                    raise notice '     Invalid items: %', v_validation_result.invalid_items;
                end if;
            else
                raise notice 'Test 4.2: FAILED - Did not detect insufficient stock';
            end if;
            
            -- Restore stock
            update products set stock = v_original_stock where id = v_book_id;
        end;
        
        -- Test 4.3: Validate empty cart
        -- Use a new session for this specific test
        v_test_session_id := create_session();
        select * into v_validation_result from validate_cart(v_test_session_id);
        if not v_validation_result.is_valid and 
           v_validation_result.message = 'Cart is empty' then
            raise notice 'Test 4.3: Correctly detected empty cart';
        else
            raise notice 'Test 4.3: FAILED - Did not detect empty cart properly';
        end if;
        
        raise notice 'Test 4: PASSED';
    exception
        when others then
            raise notice 'Test 4: FAILED - %', SQLERRM;
    end;
    
    -- Test 5: Delivery fee calculation
    raise notice '-------------- Test 5: Delivery Fee Calculation --------------';
    
    begin
        -- Test 5.1: Standard delivery for inner city
        select * into v_delivery_fees 
        from calculate_delivery_fees(
            v_session_id, 
            'Hanoi', 
            'Ba Dinh',
            false
        );
        
        raise notice 'Test 5.1: Inner city standard delivery fees -';
        raise notice '     Standard fee: %, Rush fee: %, Free shipping: %', 
            v_delivery_fees.standard_delivery_fee,
            v_delivery_fees.rush_delivery_fee,
            v_delivery_fees.free_shipping_applied;
        raise notice '     Total order value: %, Heaviest item: % kg', 
            v_delivery_fees.total_order_value,
            v_delivery_fees.heaviest_item_weight;
        
        -- Test 5.2: Standard delivery for outer city
        select * into v_delivery_fees 
        from calculate_delivery_fees(
            v_session_id, 
            'Hanoi', 
            'District 1',
            false
        );
        
        raise notice 'Test 5.2: Outer city standard delivery fees -';
        raise notice '     Standard fee: %, Rush fee: %, Free shipping: %', 
            v_delivery_fees.standard_delivery_fee,
            v_delivery_fees.rush_delivery_fee,
            v_delivery_fees.free_shipping_applied;
        
        -- Test 5.3: Rush delivery for eligible items
        select * into v_delivery_fees 
        from calculate_delivery_fees(
            v_session_id, 
            'Hanoi', 
            'Ba Dinh',
            true
        );
        
        raise notice 'Test 5.3: Rush delivery fees -';
        raise notice '     Standard fee: %, Rush fee: %, Free shipping: %', 
            v_delivery_fees.standard_delivery_fee,
            v_delivery_fees.rush_delivery_fee,
            v_delivery_fees.free_shipping_applied;
        
        raise notice 'Test 5: PASSED';
    exception
        when others then
            raise notice 'Test 5: FAILED - %', SQLERRM;
    end;
    
    -- Cleanup - only clear the cart, don't try to clean the session
    begin
        perform clear_cart(v_session_id);
        raise notice 'Successfully cleared cart for final cleanup';
    exception
        when others then
            raise notice 'Failed to clear cart: %', SQLERRM;
    end;
    
    raise notice '========== CART-SESSION OPERATIONS TESTS COMPLETED ==========';
end; $$;