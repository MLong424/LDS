-- Test case for creating a book
do $$
declare
    v_product_id integer;
    v_admin_user_id varchar;
    v_product_manager_id varchar;
begin
    -- Create test environment
    -- First create a test admin user if not exists
	select id into v_admin_user_id from users where username = 'admin_user' limit 1;
    
    -- Create a product manager user if not exists
	select id into v_product_manager_id from users where username = 'product_mgr' limit 1;
    
    -- Test Case 1: Create a Book product
    raise notice 'Test Case 1: Creating a Book product';
    begin
        -- Create a unique barcode for this test
        v_product_id := create_media_product(
            'The Great Gatsby',                         -- p_title
            '9780743273565' || FLOOR(RANDOM() * 1000)::TEXT, -- p_barcode (with random suffix)
            100.00,                                     -- p_base_value
            120.00,                                     -- p_current_price
            50,                                         -- p_stock
            'BOOK',                                     -- p_media_type
            'Classic novel in excellent condition',     -- p_product_description
            '21.5 x 14 x 2.5 cm',                       -- p_dimensions
            0.3,                                        -- p_weight
            v_product_manager_id,                       -- p_created_by
            CURRENT_DATE,                               -- p_warehouse_entry_date
            ARRAY['F. Scott Fitzgerald'],               -- p_book_authors
            'PAPERBACK',                                -- p_book_cover_type
            'Scribner',                                 -- p_book_publisher
            '2004-09-30',                               -- p_book_publication_date
            180,                                        -- p_book_pages
            'English',                                  -- p_book_language
            'Fiction',                                  -- p_book_genre
            NULL, NULL, NULL, NULL, NULL,               -- CD params (all NULL)
            NULL, NULL, NULL, NULL, NULL,               -- LP params (all NULL)
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL  -- DVD params (all NULL)
        );
        
        raise notice 'Successfully created book product with ID: %', v_product_id;
    exception
        when others then
            raise notice 'Test Case 1 Failed: %', SQLERRM;
    end;
    
    -- Test Case 2: Create a CD product
    raise notice 'Test Case 2: Creating a CD product';
    begin
        v_product_id := create_media_product(
            'Abbey Road',                               -- p_title
            '5099969942907' || FLOOR(RANDOM() * 1000)::TEXT, -- p_barcode (with random suffix)
            80.00,                                      -- p_base_value
            95.00,                                      -- p_current_price
            30,                                         -- p_stock
            'CD',                                       -- p_media_type
            'Classic Beatles album remastered',         -- p_product_description
            '14 x 12.5 x 1 cm',                         -- p_dimensions
            0.1,                                        -- p_weight
            v_product_manager_id,                       -- p_created_by
            CURRENT_DATE,                               -- p_warehouse_entry_date
            NULL, NULL, NULL, NULL, NULL, NULL, NULL,   -- Book params (all NULL)
            ARRAY['The Beatles'],                       -- p_cd_artists
            'Apple Records',                            -- p_cd_record_label
            ARRAY['Come Together', 'Something', 
                  'Maxwell''s Silver Hammer'],          -- p_cd_tracklist
            'Rock',                                     -- p_cd_genre
            '1969-09-26',                               -- p_cd_release_date
            NULL, NULL, NULL, NULL, NULL,               -- LP params (all NULL)
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL  -- DVD params (all NULL)
        );
        
        raise notice 'Successfully created CD product with ID: %', v_product_id;
    exception
        when others then
            raise notice 'Test Case 2 Failed: %', SQLERRM;
    end;
    
    -- Test Case 3: Create a DVD product
    raise notice 'Test Case 3: Creating a DVD product';
    begin
        v_product_id := create_media_product(
            'The Shawshank Redemption',                 -- p_title
            '5051892123853' || FLOOR(RANDOM() * 1000)::TEXT, -- p_barcode (with random suffix)
            75.00,                                      -- p_base_value
            89.99,                                      -- p_current_price
            25,                                         -- p_stock
            'DVD',                                      -- p_media_type
            'Classic prison drama movie',               -- p_product_description
            '19 x 13.5 x 1.5 cm',                       -- p_dimensions
            0.15,                                       -- p_weight
            v_product_manager_id,                       -- p_created_by
            CURRENT_DATE,                               -- p_warehouse_entry_date
            NULL, NULL, NULL, NULL, NULL, NULL, NULL,   -- Book params (all NULL)
            NULL, NULL, NULL, NULL, NULL,               -- CD params (all NULL)
            NULL, NULL, NULL, NULL, NULL,               -- LP params (all NULL)
            'BLU_RAY',                                  -- p_dvd_disc_type
            'Frank Darabont',                           -- p_dvd_director
            142,                                        -- p_dvd_runtime
            'Castle Rock Entertainment',                -- p_dvd_studio
            'English',                                  -- p_dvd_language
            ARRAY['English', 'Spanish', 'French'],      -- p_dvd_subtitles
            '1994-09-10',                               -- p_dvd_release_date
            'Drama'                                     -- p_dvd_genre
        );
        
        raise notice 'Successfully created DVD product with ID: %', v_product_id;
    exception
        when others then
            raise notice 'Test Case 3 Failed: %', SQLERRM;
    end;
    
    -- Test Case 4: Test validation - Price outside allowed range
    raise notice 'Test Case 4: Testing price validation';
    begin
        v_product_id := create_media_product(
            'Invalid Price Test',                        -- p_title
            '1234567890123' || FLOOR(RANDOM() * 1000)::TEXT, -- p_barcode (with random suffix)
            100.00,                                      -- p_base_value
            160.00,                                      -- p_current_price (invalid: > 150% of base value)
            10,                                          -- p_stock
            'BOOK',                                      -- p_media_type
            'Test product with invalid price',           -- p_product_description
            '20 x 15 x 2 cm',                            -- p_dimensions
            0.25,                                        -- p_weight
            v_product_manager_id,                        -- p_created_by
            CURRENT_DATE,                                -- p_warehouse_entry_date
            ARRAY['Test Author'],                        -- p_book_authors
            'HARDCOVER',                                 -- p_book_cover_type
            'Test Publisher',                            -- p_book_publisher
            '2023-01-01',                                -- p_book_publication_date
            200,                                         -- p_book_pages
            'English',                                   -- p_book_language
            'Test',                                      -- p_book_genre
            NULL, NULL, NULL, NULL, NULL,                -- CD params (all NULL)
            NULL, NULL, NULL, NULL, NULL,                -- LP params (all NULL)
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL  -- DVD params (all NULL)
        );
        
        raise notice 'Test Case 4 should have failed but succeeded!';
    exception
        when others then
            raise notice 'Test Case 4 correctly failed: %', SQLERRM;
    end;
    
    -- Test Case 5: Test validation - Missing required book attributes
    raise notice 'Test Case 5: Testing missing book attributes validation';
    begin
        v_product_id := create_media_product(
            'Missing Attributes Test',                  -- p_title
            '9876543210987' || FLOOR(RANDOM() * 1000)::TEXT, -- p_barcode (with random suffix)
            50.00,                                      -- p_base_value
            60.00,                                      -- p_current_price
            20,                                         -- p_stock
            'BOOK',                                     -- p_media_type
            'Test product with missing attributes',     -- p_product_description
            '20 x 15 x 2 cm',                           -- p_dimensions
            0.25,                                       -- p_weight
            v_product_manager_id,                       -- p_created_by
            CURRENT_DATE,                               -- p_warehouse_entry_date
            NULL,                                       -- p_book_authors (missing required field)
            'PAPERBACK',                                -- p_book_cover_type
            'Test Publisher',                           -- p_book_publisher
            '2023-01-01',                               -- p_book_publication_date
            NULL, NULL, NULL,                           -- Other book params
            NULL, NULL, NULL, NULL, NULL,               -- CD params (all NULL)
            NULL, NULL, NULL, NULL, NULL,               -- LP params (all NULL)
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL  -- DVD params (all NULL)
        );
        
        raise notice 'Test Case 5 should have failed but succeeded!';
    exception
        when others then
            raise notice 'Test Case 5 correctly failed: %', SQLERRM;
    end;

    -- Test Case 6: Create an LP Record product
    raise notice 'Test Case 6: Creating an LP Record product';
    begin
        v_product_id := create_media_product(
            'Kind of Blue',                             -- p_title
            'LP00123456789' || FLOOR(RANDOM() * 1000)::TEXT, -- p_barcode (with random suffix)
            120.00,                                     -- p_base_value
            135.00,                                     -- p_current_price
            15,                                         -- p_stock
            'LP_RECORD',                                -- p_media_type
            'Iconic jazz album on vinyl',               -- p_product_description
            '31 x 31 x 0.5 cm',                         -- p_dimensions
            0.2,                                        -- p_weight
            v_product_manager_id,                       -- p_created_by
            CURRENT_DATE,                               -- p_warehouse_entry_date
            NULL, NULL, NULL, NULL, NULL, NULL, NULL,   -- Book params (all NULL)
            NULL, NULL, NULL, NULL, NULL,               -- CD params (all NULL)
            ARRAY['Miles Davis'],                       -- p_lp_artists
            'Columbia Records',                         -- p_lp_record_label
            ARRAY['So What', 'Freddie Freeloader',
                  'Blue in Green'],                     -- p_lp_tracklist
            'Jazz',                                     -- p_lp_genre
            '1959-08-17',                               -- p_lp_release_date
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL  -- DVD params (all NULL)
        );
        
        raise notice 'Successfully created LP Record product with ID: %', v_product_id;
    exception
        when others then
            raise notice 'Test Case 6 Failed: %', SQLERRM;
    end;

end;
$$;

-- Test case for getting product details
-- Test case for product read operations
do $$
declare
    -- Test variables
    v_count integer;
    v_product_id integer;
    v_product_title varchar;
    v_product_price decimal(10, 2);
    v_media_type public.media_type;
    v_admin_id varchar;
    v_pm_id varchar;
    v_customer_id varchar;
    v_page_size integer := 20;
    v_rush_eligible boolean;
    v_price_history_count integer;
    v_record_count integer;
    v_exception_thrown boolean;
    
    -- Test data arrays
    titles varchar[] := array['The Great Gatsby', 'Abbey Road', 'The Shawshank Redemption', 'Kind of Blue'];
    barcodes varchar[] := array['9780743273565319', '509996994290783', '5051892123853175', 'LP00123456789678'];
    prices decimal(10, 2)[] := array[120.00, 95.00, 89.99, 135.00];
    media_types public.media_type[] := array['BOOK', 'CD', 'DVD', 'LP_RECORD'];
begin
    raise notice '========== STARTING PRODUCT READ OPERATIONS TESTS ==========';
    
    -- Get user IDs for testing
    select id into v_admin_id from users where username = 'admin_user' limit 1;
    select id into v_pm_id from users where username = 'product_mgr' limit 1;
    select id into v_customer_id from users where username = 'customer1' limit 1;
    
    raise notice 'Using admin ID: %, product manager ID: %, customer ID: %', 
        v_admin_id, v_pm_id, v_customer_id;
    
    -- Insert price history data for testing if not exists
    if not exists (select 1 from product_price_history where product_id = 1) then
        insert into product_price_history (product_id, old_price, new_price, changed_by, changed_at)
        values 
        (1, 110.00, 120.00, v_pm_id, NOW() - INTERVAL '10 days'),
        (1, 100.00, 110.00, v_pm_id, NOW() - INTERVAL '20 days'),
        (2, 90.00, 95.00, v_pm_id, NOW() - INTERVAL '5 days');
        
        raise notice 'Created test price history data for testing';
    end if;
    
    -- Test 1: get_random_products function
    raise notice '-------------- Test 1: get_random_products --------------';
    
    begin
        -- Test 1.1: Default page size
        select count(*) into v_count from get_random_products();
        raise notice 'Test 1.1: get_random_products() returned % products (expected: up to 4)', v_count;
        
        -- Test 1.2: Custom page size
        select count(*) into v_count from get_random_products(2);
        raise notice 'Test 1.2: get_random_products(2) returned % products (expected: 2)', v_count;
        
        raise notice 'Test 1: PASSED';
    exception
        when others then
            raise notice 'Test 1: FAILED - %', SQLERRM;
    end;
    
    -- Test 2: search_products function - Basic Search
    raise notice '-------------- Test 2: search_products basic search --------------';
    
    begin
        -- Test 2.1: Search by title
        select count(*) into v_count from search_products(p_title := 'Gatsby');
        if v_count = 1 then
            raise notice 'Test 2.1: Title search returned % product as expected', v_count;
        else
            raise notice 'Test 2.1: FAILED - Title search returned % products (expected: 1)', v_count;
        end if;
        
        -- Test 2.2: Search by media type
        select count(*) into v_count from search_products(p_media_type := 'DVD'::public.media_type);
        if v_count = 1 then
            raise notice 'Test 2.2: Media type search returned % product as expected', v_count;
        else
            raise notice 'Test 2.2: FAILED - Media type search returned % products (expected: 1)', v_count;
        end if;
        
        -- Test 2.3: Search by price range
        select count(*) into v_count from search_products(p_min_price := 90, p_max_price := 150);
        raise notice 'Test 2.3: Price range search returned % products (expected: 3-4 products)', v_count;
        
        -- Test 2.4: Sort by price ascending
        select product_id, current_price
        into v_product_id, v_product_price
        from search_products(p_sort_by := 'price_asc')
        limit 1;
        
        if v_product_price = (select min(price) from unnest(prices) as price) then
            raise notice 'Test 2.4: Sorting by price ascending worked correctly. Lowest price: %', v_product_price;
        else
            raise notice 'Test 2.4: FAILED - Sorting by price ascending did not return lowest price first. Got: %', v_product_price;
        end if;
        
        -- Test 2.5: Sort by price descending
        select product_id, current_price
        into v_product_id, v_product_price
        from search_products(p_sort_by := 'price_desc')
        limit 1;
        
        if v_product_price = (select max(price) from unnest(prices) as price) then
            raise notice 'Test 2.5: Sorting by price descending worked correctly. Highest price: %', v_product_price;
        else
            raise notice 'Test 2.5: FAILED - Sorting by price descending did not return highest price first. Got: %', v_product_price;
        end if;
        
        raise notice 'Test 2: PASSED';
    exception
        when others then
            raise notice 'Test 2: FAILED - %', SQLERRM;
    end;
    
    -- Test 3: search_products function - Advanced Search
    raise notice '-------------- Test 3: search_products advanced search --------------';
    
    begin
        -- Test 3.1: Combined search criteria
        select count(*) into v_count from search_products(p_media_type := 'CD'::public.media_type, p_max_price := 100);
        if v_count = 1 then
            raise notice 'Test 3.1: Combined search returned % product as expected', v_count;
        else
            raise notice 'Test 3.1: FAILED - Combined search returned % products (expected: 1)', v_count;
        end if;
        
        -- Test 3.2: Pagination test
        select count(*) into v_count from search_products(p_page := 1, p_page_size := 2);
        if v_count = 2 then
            raise notice 'Test 3.2: First page pagination returned % products as expected', v_count;
        else
            raise notice 'Test 3.2: FAILED - First page pagination returned % products (expected: 2)', v_count;
        end if;
        
        select count(*) into v_count from search_products(p_page := 2, p_page_size := 2);
        if v_count between 0 and 2 then
            raise notice 'Test 3.3: Second page pagination returned % products (expected: up to 2)', v_count;
        else
            raise notice 'Test 3.3: FAILED - Second page pagination returned % products (expected: up to 2)', v_count;
        end if;
        
        raise notice 'Test 3: PASSED';
    exception
        when others then
            raise notice 'Test 3: FAILED - %', SQLERRM;
    end;
    
    -- Test 4: get_product_details function
    raise notice '-------------- Test 4: get_product_details --------------';
    
    begin
        -- Test each product type
        for i in 1..4 loop
            begin
                select product_id, title, media_type
                into v_product_id, v_product_title, v_media_type
                from get_product_details(i);
                
                if v_product_id = i and v_media_type = media_types[i] then
                    raise notice 'Test 4.%: Product details for ID % retrieved correctly. Title: %, Media Type: %', 
                        i, v_product_id, v_product_title, v_media_type;
                else
                    raise notice 'Test 4.%: FAILED - Product details for ID % incorrect or missing', 
                        i, i;
                end if;
            exception
                when no_data_found then
                    raise notice 'Test 4.%: FAILED - No data found for product ID %', i, i;
            end;
        end loop;
        
        -- Test non-existent product ID
        v_exception_thrown := false;
        begin
            select product_id into v_product_id from get_product_details(999);
            if v_product_id is null then
                raise notice 'Test 4.5: Non-existent product ID correctly returned NULL';
            else
                raise notice 'Test 4.5: FAILED - Non-existent product ID returned data: %', v_product_id;
            end if;
        exception
            when no_data_found then
                v_exception_thrown := true;
                raise notice 'Test 4.5: Non-existent product ID correctly returned no data';
        end;
        
        raise notice 'Test 4: PASSED';
    exception
        when others then
            raise notice 'Test 4: FAILED - %', SQLERRM;
    end;
    
    -- Test 5: pm_view_products function
    raise notice '-------------- Test 5: pm_view_products --------------';
    
    begin
        -- Test 5.1: Basic product manager view
        select count(*) into v_count from pm_view_products(p_user_id := v_pm_id);
        raise notice 'Test 5.1: Product manager view returned % products (expected: 4)', v_count;
        
        -- Test 5.2: Filter by media type for product manager
        select count(*) into v_count from pm_view_products(
            p_media_type := 'BOOK'::public.media_type,
            p_user_id := v_pm_id
        );
        if v_count = 1 then
            raise notice 'Test 5.2: Media type filter returned % product as expected', v_count;
        else
            raise notice 'Test 5.2: FAILED - Media type filter returned % products (expected: 1)', v_count;
        end if;
        
        -- Test 5.3: Test unauthorized access
        v_exception_thrown := false;
        begin
            select count(*) into v_count from pm_view_products(p_user_id := v_customer_id);
            raise notice 'Test 5.3: FAILED - Unauthorized access did not throw exception';
        exception
            when others then
                v_exception_thrown := true;
                raise notice 'Test 5.3: Unauthorized access correctly threw exception: %', SQLERRM;
        end;
        
        -- Test 5.4: Sort by price ascending
        select p.product_id, p.current_price
        into v_product_id, v_product_price
        from pm_view_products(
            p_sort_by := 'price',
            p_sort_order := 'asc',
            p_user_id := v_pm_id
        ) p
        limit 1;
        
        if v_product_price = (select min(price) from unnest(prices) as price) then
            raise notice 'Test 5.4: Sorting by price ascending worked correctly. Lowest price: %', v_product_price;
        else
            raise notice 'Test 5.4: FAILED - Sorting by price ascending did not return lowest price first. Got: %', v_product_price;
        end if;
        
        raise notice 'Test 5: PASSED';
    exception
        when others then
            raise notice 'Test 5: FAILED - %', SQLERRM;
    end;
    
    -- Test 6: is_product_rush_delivery_eligible function
    raise notice '-------------- Test 6: is_product_rush_delivery_eligible --------------';
    
    begin
        -- Test 6.1: Test CD product eligibility (should be true)
        select is_product_rush_delivery_eligible(2) into v_rush_eligible;
        if v_rush_eligible then
            raise notice 'Test 6.1: CD product correctly identified as rush delivery eligible';
        else
            raise notice 'Test 6.1: FAILED - CD product incorrectly identified as NOT rush delivery eligible';
        end if;
        
        -- Test 6.2: Test DVD product eligibility (should be true)
        select is_product_rush_delivery_eligible(3) into v_rush_eligible;
        if v_rush_eligible then
            raise notice 'Test 6.2: DVD product correctly identified as rush delivery eligible';
        else
            raise notice 'Test 6.2: FAILED - DVD product incorrectly identified as NOT rush delivery eligible';
        end if;
        
        -- Test 6.3: Test Book product eligibility (should be false)
        select is_product_rush_delivery_eligible(1) into v_rush_eligible;
        if not v_rush_eligible then
            raise notice 'Test 6.3: Book product correctly identified as NOT rush delivery eligible';
        else
            raise notice 'Test 6.3: FAILED - Book product incorrectly identified as rush delivery eligible';
        end if;
        
        -- Test 6.4: Test LP Record product eligibility (should be false)
        select is_product_rush_delivery_eligible(4) into v_rush_eligible;
        if not v_rush_eligible then
            raise notice 'Test 6.4: LP Record product correctly identified as NOT rush delivery eligible';
        else
            raise notice 'Test 6.4: FAILED - LP Record product incorrectly identified as rush delivery eligible';
        end if;
        
        raise notice 'Test 6: PASSED';
    exception
        when others then
            raise notice 'Test 6: FAILED - %', SQLERRM;
    end;
    
    -- Test 7: get_product_price_history function
    raise notice '-------------- Test 7: get_product_price_history --------------';
    
    begin
        -- Test 7.1: Get price history for a product with multiple changes
        select count(*) into v_price_history_count from get_product_price_history(1, v_pm_id);
        
        if v_price_history_count = 2 then
            raise notice 'Test 7.1: Price history for product 1 correctly returned % records', v_price_history_count;
        else
            raise notice 'Test 7.1: FAILED - Price history for product 1 returned % records (expected: 2)', v_price_history_count;
        end if;
        
        -- Test 7.2: Get price history for a product with one change
        select count(*) into v_price_history_count from get_product_price_history(2, v_pm_id);
        
        if v_price_history_count = 1 then
            raise notice 'Test 7.2: Price history for product 2 correctly returned % record', v_price_history_count;
        else
            raise notice 'Test 7.2: FAILED - Price history for product 2 returned % records (expected: 1)', v_price_history_count;
        end if;
        
        -- Test 7.3: Test unauthorized access
        v_exception_thrown := false;
        begin
            select count(*) into v_price_history_count from get_product_price_history(1, v_customer_id);
            raise notice 'Test 7.3: FAILED - Unauthorized access did not throw exception';
        exception
            when others then
                v_exception_thrown := true;
                raise notice 'Test 7.3: Unauthorized access correctly threw exception: %', SQLERRM;
        end;
        
        raise notice 'Test 7: PASSED';
    exception
        when others then
            raise notice 'Test 7: FAILED - %', SQLERRM;
    end;
    
    raise notice '========== PRODUCT READ OPERATIONS TESTS COMPLETED ==========';
end; $$;

-- Test 1: Update product title and description
do $$
declare
    v_product_id integer;
    v_user_id varchar;
begin
    -- Setup: Get a product and product manager
    select id into v_product_id from products where media_type = 'BOOK' limit 1;
    select id into v_user_id from users where username = 'product_mgr';
    
    -- Execute
    perform update_media_product(
        p_product_id := v_product_id,
        p_updated_by := v_user_id,
        p_title := 'New Title',
        p_product_description := 'New Description'
    );
    
    -- Verify
    if exists (
        select 1 from products 
        where id = v_product_id 
        and title = 'New Title' 
        and product_description = 'New Description'
    ) then
        raise notice 'Test 1: PASSED';
    else
        raise notice 'Test 1: FAILED';
    end if;
end $$;

-- Test 2: Update product price
do $$
declare
    v_product_id integer;
    v_user_id varchar;
    v_new_price decimal(10,2);
begin
    -- Setup
    select id into v_product_id from products where media_type = 'BOOK' limit 1;
    select id into v_user_id from users where username = 'product_mgr';
    select base_value * 1.2 into v_new_price from products where id = v_product_id;
    
    -- Execute
    perform update_media_product(
        p_product_id := v_product_id,
        p_updated_by := v_user_id,
        p_current_price := v_new_price
    );
    
    -- Verify
    if exists (
        select 1 from products 
        where id = v_product_id 
        and current_price = v_new_price
    ) and exists (
        select 1 from product_price_history 
        where product_id = v_product_id 
        and new_price = v_new_price
    ) then
        raise notice 'Test 2: PASSED';
    else
        raise notice 'Test 2: FAILED';
    end if;
end $$;

-- Test 3: Update product price with invalid price
do $$
declare
    v_product_id integer;
    v_user_id varchar;
    v_invalid_price decimal(10,2);
begin
    -- Setup
    select id into v_product_id from products limit 1;
    select id into v_user_id from users where username = 'product_mgr';
    select base_value * 2 into v_invalid_price from products where id = v_product_id;
    
    -- Execute & Verify
    begin
        perform update_media_product(
            p_product_id := v_product_id,
            p_updated_by := v_user_id,
            p_current_price := v_invalid_price
        );
        raise notice 'Test 3: FAILED (Price accepted)';
    exception
        when others then
            if sqlerrm like 'Product price must be between 30%% and 150%% of product value%' then
                raise notice 'Test 3: PASSED';
            else
                raise notice 'Test 3: FAILED (Unexpected error: %)', sqlerrm;
            end if;
    end;
end $$;

-- Test 4: Update media-specific attributes
do $$
declare
    v_product_id integer;
    v_user_id varchar;
begin
    -- Setup: Get a book product
    select id into v_product_id from products where media_type = 'BOOK' limit 1;
    select id into v_user_id from users where username = 'product_mgr';
    
    -- Execute
    perform update_media_product(
        p_product_id := v_product_id,
        p_updated_by := v_user_id,
        p_book_authors := array['J.K. Rowling'],
        p_book_genre := 'Fantasy'
    );
    
    -- Verify
    if exists (
        select 1 from books 
        where product_id = v_product_id 
        and 'J.K. Rowling' = any(authors) 
        and genre = 'Fantasy'
    ) then
        raise notice 'Test 4: PASSED';
    else
        raise notice 'Test 4: FAILED';
    end if;
end $$;

-- Test 5: Test update limit (simulate 30 updates)
do $$
declare
    v_user_id varchar;
begin
    -- Setup: Force 30 updates
    select id into v_user_id from users where username = 'product_mgr';
    insert into product_update_counts (user_id, update_date, update_count)
    values (v_user_id, current_date, 30)
    on conflict (user_id, update_date) do update set update_count = 30;
    
    -- Execute & Verify
    begin
        perform update_media_product(
            p_product_id := 1,
            p_updated_by := v_user_id,
            p_title := 'Should Fail'
        );
        raise notice 'Test 5: FAILED (Limit not enforced)';
    exception
        when others then
            if sqlerrm ilike 'Error updating product: Daily product update limit%' then
                raise notice 'Test 5: PASSED';
            else
                raise notice 'Test 5: FAILED (Unexpected error: %)', sqlerrm;
            end if;
    end;
    
    -- Cleanup
    delete from product_update_counts where user_id = v_user_id;
end $$;

-- Test 6: Test price update limit (simulate 2 price updates)
do $$
declare
    v_product_id integer;
    v_user_id varchar;
begin
    -- Setup: Force 2 price updates
    select id into v_product_id from products limit 1;
    select id into v_user_id from users where username = 'product_mgr';
    insert into product_price_update_counts (product_id, user_id, update_date, update_count)
    values (v_product_id, v_user_id, current_date, 2)
    on conflict (product_id, user_id, update_date) do update set update_count = 2;
    
    -- Execute & Verify
    begin
        perform update_media_product(
            p_product_id := v_product_id,
            p_updated_by := v_user_id,
            p_current_price := 50.00
        );
        raise notice 'Test 6: FAILED (Limit not enforced)';
    exception
        when others then
            if sqlerrm like 'Daily price update limit%' then
                raise notice 'Test 6: PASSED';
            else
                raise notice 'Test 6: FAILED (Unexpected error: %)', sqlerrm;
            end if;
    end;
    
    -- Cleanup
    delete from product_price_update_counts where user_id = v_user_id;
end $$;
-- Test 6: FAILED (Unexpected error: Error updating product: insert or update on table "product_price_update_counts" violates foreign key constraint "fk_user_id")
-- Don't know why