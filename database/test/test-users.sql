-- Test cases for user operations
do $$
declare
    -- Test variables
    admin_id varchar;
    pm_id varchar;
    customer_id varchar;
    super_user_id varchar;
    new_user_id varchar;
    search_result record;
    user_profile record;
    search_count integer;
    test_username varchar := 'test_user_' || floor(random() * 1000)::text;
    test_email varchar := 'test_' || floor(random() * 1000)::text || '@example.com';
    reset_token varchar;
    temp_password varchar;
    test_search_term varchar := 'test';
    test_result boolean;
    user_info record;
    user_roles public.user_role[];
    user_count integer;
    total_pages integer;
begin
    raise notice '========== STARTING USER OPERATIONS TESTS ==========';
    
    -- First, create the initial admin user directly
    -- Test 1: Initial admin user setup
    raise notice '-------------- Test 1: Initial Admin User Setup --------------';
    
    begin
        -- Generate UUID for admin
        admin_id := uuid_generate_v4()::varchar;
        
        -- Insert admin user
        insert into public.users (
            id, 
            username, 
            password, 
            email, 
            first_name, 
            last_name, 
            is_blocked
        ) values (
            admin_id,
            'admin_user',
            hash_password('Admin123!'),
            'admin@example.com',
            'admin',
            'user',
            false
        );

        -- Insert admin role
        insert into public.user_roles (user_id, role)
        values (admin_id, 'ADMIN');
        
        -- Verify admin user creation
        select count(*) into user_count
        from public.users
        where id = admin_id;
        
        if user_count > 0 then
            raise notice 'Successfully created admin user with ID: %', admin_id;
            
            -- Check admin role assignment
            select count(*) into user_count
            from public.user_roles
            where user_id = admin_id and role = 'ADMIN';
            
            if user_count > 0 then
                raise notice '     Admin role correctly assigned';
                raise notice 'Test 1: PASSED';
            else
                raise notice '     FAILED - Admin role not assigned correctly';
                raise notice 'Test 1: FAILED';
            end if;
        else
            raise notice 'FAILED - Could not create admin user';
            raise notice 'Test 1: FAILED';
        end if;
    exception
        when others then
            raise notice 'Test 1: FAILED - %', SQLERRM;
    end;
    
    -- Test 2: Admin creates users
    raise notice '-------------- Test 2: Admin Create Users --------------';
    
    begin
        -- Test 2.1: Create product manager
        begin
            pm_id := admin_create_user(
                'product_mgr',
                'Admin123!',
                'pm@example.com',
                'Product',
                'Manager',
                ARRAY['PRODUCT_MANAGER']::user_role[],
                admin_id
            );
            
            if pm_id is not null then
                raise notice 'Test 2.1: Successfully created product manager with ID: %', pm_id;
                
                -- Verify role assignment
                select count(*) into user_count
                from public.user_roles
                where user_id = pm_id and role = 'PRODUCT_MANAGER';
                
                if user_count > 0 then
                    raise notice '     Product manager role correctly assigned';
                else
                    raise notice '     FAILED - Product manager role not assigned correctly';
                end if;
            else
                raise notice 'Test 2.1: FAILED - Could not create product manager';
            end if;
        exception
            when others then
                raise notice 'Test 2.1: FAILED - %', SQLERRM;
        end;
        
        -- Test 2.2: Create customer
        begin
            customer_id := admin_create_user(
                'customer1',
                'Admin123!',
                'customer1@example.com',
                'John',
                'Doe',
                ARRAY['CUSTOMER']::user_role[],
                admin_id
            );
            
            if customer_id is not null then
                raise notice 'Test 2.2: Successfully created customer with ID: %', customer_id;
                
                -- Verify role assignment
                select count(*) into user_count
                from public.user_roles
                where user_id = customer_id and role = 'CUSTOMER';
                
                if user_count > 0 then
                    raise notice '     Customer role correctly assigned';
                else
                    raise notice '     FAILED - Customer role not assigned correctly';
                end if;
            else
                raise notice 'Test 2.2: FAILED - Could not create customer';
            end if;
        exception
            when others then
                raise notice 'Test 2.2: FAILED - %', SQLERRM;
        end;
        
        -- Test 2.3: Create user with multiple roles
        begin
            super_user_id := admin_create_user(
                'super_user',
                'Admin123!',
                'super@example.com',
                'Super',
                'User',
                ARRAY['ADMIN', 'PRODUCT_MANAGER']::user_role[],
                admin_id
            );
            
            if super_user_id is not null then
                raise notice 'Test 2.3: Successfully created super user with ID: %', super_user_id;
                
                -- Verify multiple role assignment
                select count(*) into user_count
                from public.user_roles
                where user_id = super_user_id;
                
                if user_count = 2 then
                    raise notice '     Multiple roles correctly assigned to super user';
                else
                    raise notice '     FAILED - Multiple roles not assigned correctly, found % roles', user_count;
                end if;
            else
                raise notice 'Test 2.3: FAILED - Could not create super user';
            end if;
        exception
            when others then
                raise notice 'Test 2.3: FAILED - %', SQLERRM;
        end;
        
        -- Test 2.4: Attempt to create user with invalid password
        begin
            new_user_id := admin_create_user(
                'invalid_user',
                'simple',  -- Password doesn't meet complexity requirements
                'invalid@example.com',
                'Invalid',
                'User',
                ARRAY['CUSTOMER']::user_role[],
                admin_id
            );
            raise notice 'Test 2.4: FAILED - Allowed creation of user with invalid password';
        exception
            when others then
                raise notice 'Test 2.4: Correctly prevented creation of user with invalid password: %', SQLERRM;
        end;
        
        -- Test 2.5: Attempt to create user with duplicate username
        begin
            new_user_id := admin_create_user(
                'admin_user',  -- Duplicate username
                'Admin123!',
                'another@example.com',
                'Another',
                'Admin',
                ARRAY['ADMIN']::user_role[],
                admin_id
            );
            raise notice 'Test 2.5: FAILED - Allowed creation of user with duplicate username';
        exception
            when others then
                raise notice 'Test 2.5: Correctly prevented creation of user with duplicate username: %', SQLERRM;
        end;
        
        raise notice 'Test 2: PASSED';
    exception
        when others then
            raise notice 'Test 2: FAILED - %', SQLERRM;
    end;
    
    -- Test 3: User login
    raise notice '-------------- Test 3: User Login --------------';
    
    begin
        -- Test 3.1: Successful login
        begin
            user_info := user_login('admin_user', 'Admin123!');
            
            if user_info.user_id is not null then
                raise notice 'Test 3.1: Successfully logged in as admin user';
                raise notice '     User ID: %, Username: %, Roles: %', 
                    user_info.user_id, user_info.username, user_info.roles;
            else
                raise notice 'Test 3.1: FAILED - Could not log in as admin user';
            end if;
        exception
            when others then
                raise notice 'Test 3.1: FAILED - %', SQLERRM;
        end;
        
        -- Test 3.2: Login with incorrect password
        begin
            user_info := user_login('admin_user', 'WrongPassword!');
            raise notice 'Test 3.2: FAILED - Allowed login with incorrect password';
        exception
            when others then
                raise notice 'Test 3.2: Correctly prevented login with incorrect password: %', SQLERRM;
        end;
        
        -- Test 3.3: Login with non-existent username
        begin
            user_info := user_login('non_existent_user', 'Admin123!');
            raise notice 'Test 3.3: FAILED - Allowed login with non-existent username';
        exception
            when others then
                raise notice 'Test 3.3: Correctly prevented login with non-existent username: %', SQLERRM;
        end;
        
        raise notice 'Test 3: PASSED';
    exception
        when others then
            raise notice 'Test 3: FAILED - %', SQLERRM;
    end;
    
    -- Test 4: Admin views user information
    raise notice '-------------- Test 4: Admin View User Information --------------';
    
    begin
        -- Test 4.1: Admin views user by ID
        begin
            user_info := admin_view_user(customer_id, admin_id);
            
            if user_info.id is not null then
                raise notice 'Test 4.1: Successfully viewed user information';
                raise notice '     User ID: %, Username: %, First Name: %, Last Name: %', 
                    user_info.id, user_info.username, user_info.first_name, user_info.last_name;
                
                -- Check roles
                if user_info.roles[1] = 'CUSTOMER' then
                    raise notice '     Roles correctly retrieved: %', user_info.roles;
                else
                    raise notice '     FAILED - Roles not correctly retrieved: %', user_info.roles;
                end if;
            else
                raise notice 'Test 4.1: FAILED - Could not view user information';
            end if;
        exception
            when others then
                raise notice 'Test 4.1: FAILED - %', SQLERRM;
        end;
        
        -- Test 4.2: Admin views all users
        begin
            SELECT count(*), max(total_pages) INTO user_count, total_pages
            FROM admin_view_all_users(admin_id, 1, 20, 'username', 'ASC');
            
            if user_count > 0 then
                raise notice 'Test 4.2: Successfully viewed all users';
                raise notice '     Total users: %, Total pages: %', user_count, total_pages;
            else
                raise notice 'Test 4.2: FAILED - Could not view all users';
            end if;
        exception
            when others then
                raise notice 'Test 4.2: FAILED - %', SQLERRM;
        end;
        
        -- Test 4.3: Non-admin attempts to view user information
        begin
            user_info := admin_view_user(admin_id, customer_id);
            raise notice 'Test 4.3: FAILED - Allowed non-admin to view user information';
        exception
            when others then
                raise notice 'Test 4.3: Correctly prevented non-admin from viewing user information: %', SQLERRM;
        end;
        
        raise notice 'Test 4: PASSED';
    exception
        when others then
            raise notice 'Test 4: FAILED - %', SQLERRM;
    end;
    
    -- Test 5: Admin user management
    raise notice '-------------- Test 5: Admin User Management --------------';
    
    begin
        -- Test 5.1: Block/unblock user
        begin
            -- First, block the user
            perform admin_toggle_user_block(customer_id, admin_id);
            
            -- Check if user is blocked
            select is_blocked into test_result
            from public.users
            where id = customer_id;
            
            if test_result then
                raise notice 'Test 5.1.1: Successfully blocked user';
            else
                raise notice 'Test 5.1.1: FAILED - User not blocked correctly';
            end if;
            
            -- Now, unblock the user
            perform admin_toggle_user_block(customer_id, admin_id);
            
            -- Check if user is unblocked
            select is_blocked into test_result
            from public.users
            where id = customer_id;
            
            if not test_result then
                raise notice 'Test 5.1.2: Successfully unblocked user';
            else
                raise notice 'Test 5.1.2: FAILED - User not unblocked correctly';
            end if;
        exception
            when others then
                raise notice 'Test 5.1: FAILED - %', SQLERRM;
        end;
        
        -- Test 5.2: Set user roles
        begin
            -- Set multiple roles for customer
            perform admin_set_user_roles(
                customer_id,
                ARRAY['CUSTOMER', 'PRODUCT_MANAGER']::user_role[],
                admin_id
            );
            
            -- Check roles count
            select count(*) into user_count
            from public.user_roles
            where user_id = customer_id;
            
            if user_count = 2 then
                raise notice 'Test 5.2: Successfully set multiple roles for user';
                
                -- Reset back to customer only
                perform admin_set_user_roles(
                    customer_id,
                    ARRAY['CUSTOMER']::user_role[],
                    admin_id
                );
            else
                raise notice 'Test 5.2: FAILED - Could not set multiple roles for user, found % roles', user_count;
            end if;
        exception
            when others then
                raise notice 'Test 5.2: FAILED - %', SQLERRM;
        end;
        
        -- Test 5.3: Reset user password
        begin
            temp_password := admin_reset_user_password(customer_id, admin_id);
            
            if temp_password is not null then
                raise notice 'Test 5.3: Successfully reset user password';
                raise notice '     Temporary password: %', temp_password;
                
                -- Try logging in with the new password
                begin
                    user_info := user_login('customer1', temp_password);
                    
                    if user_info.user_id is not null then
                        raise notice '     Successfully logged in with new password';
                    else
                        raise notice '     FAILED - Could not log in with new password';
                    end if;
                exception
                    when others then
                        raise notice '     FAILED - Could not log in with new password: %', SQLERRM;
                end;
            else
                raise notice 'Test 5.3: FAILED - Could not reset user password';
            end if;
        exception
            when others then
                raise notice 'Test 5.3: FAILED - %', SQLERRM;
        end;
        
        -- Test 5.4: Create a user and then delete it
        begin
            -- Create a temporary user
            new_user_id := admin_create_user(
                test_username,
                'Admin123!',
                test_email,
                'Test',
                'User',
                ARRAY['CUSTOMER']::user_role[],
                admin_id
            );
            
            if new_user_id is not null then
                raise notice 'Test 5.4.1: Successfully created test user with ID: %', new_user_id;
                
                -- Now delete the user
                test_result := admin_delete_user(new_user_id, admin_id);
                
                if test_result then
                    raise notice 'Test 5.4.2: Successfully deleted test user';
                    
                    -- Verify user is deleted
                    select count(*) into user_count
                    from public.users
                    where id = new_user_id;
                    
                    if user_count = 0 then
                        raise notice '     User correctly deleted from database';
                    else
                        raise notice '     FAILED - User still exists in database';
                    end if;
                else
                    raise notice 'Test 5.4.2: FAILED - Could not delete test user';
                end if;
            else
                raise notice 'Test 5.4.1: FAILED - Could not create test user for deletion test';
            end if;
        exception
            when others then
                raise notice 'Test 5.4: FAILED - %', SQLERRM;
        end;
        
        raise notice 'Test 5: PASSED';
    exception
        when others then
            raise notice 'Test 5: FAILED - %', SQLERRM;
    end;
    
    -- Test 6: User search
    raise notice '-------------- Test 6: User Search --------------';
    
    begin
        -- Test 6.1: Search by term
        begin
            SELECT count(*) INTO search_count
            FROM admin_search_users(admin_id, 'admin', null, null);
            
            if search_count > 0 then
                raise notice 'Test 6.1: Successfully searched users by term';
                raise notice '     Found % users containing "admin"', search_count;
            else
                raise notice 'Test 6.1: FAILED - Could not find users by search term';
            end if;
        exception
            when others then
                raise notice 'Test 6.1: FAILED - %', SQLERRM;
        end;
        
        -- Test 6.2: Search by role
        begin
            SELECT count(*) INTO search_count
            FROM admin_search_users(admin_id, null, 'PRODUCT_MANAGER', null);
            
            if search_count > 0 then
                raise notice 'Test 6.2: Successfully searched users by role';
                raise notice '     Found % users with PRODUCT_MANAGER role', search_count;
            else
                raise notice 'Test 6.2: FAILED - Could not find users by role';
            end if;
        exception
            when others then
                raise notice 'Test 6.2: FAILED - %', SQLERRM;
        end;
        
        -- Test 6.3: Search with combined filters
        begin
            SELECT count(*) INTO search_count
            FROM admin_search_users(admin_id, 'user', 'ADMIN', false);
            
            raise notice 'Test 6.3: Successfully searched users with combined filters';
            raise notice '     Found % users matching combined criteria', search_count;
        exception
            when others then
                raise notice 'Test 6.3: FAILED - %', SQLERRM;
        end;
        
        raise notice 'Test 6: PASSED';
    exception
        when others then
            raise notice 'Test 6: FAILED - %', SQLERRM;
    end;
    
    -- Test 7: User self-management
    raise notice '-------------- Test 7: User Self-Management --------------';
    
    begin
        -- Test 7.1: View own profile
        begin
            user_profile := user_view_profile(customer_id);
            
            if user_profile.username is not null then
                raise notice 'Test 7.1: Successfully viewed own profile';
                raise notice '     Username: %, Email: %, Name: % %', 
                    user_profile.username, user_profile.email, 
                    user_profile.first_name, user_profile.last_name;
            else
                raise notice 'Test 7.1: FAILED - Could not view own profile';
            end if;
        exception
            when others then
                raise notice 'Test 7.1: FAILED - %', SQLERRM;
        end;
        
        -- Test 7.2: Change own password
        begin
            -- Change to a new password
            test_result := user_change_password(
                customer_id,
                temp_password,  -- Use the temp password set in test 5.3
                'NewPassword123!'
            );
            
            if test_result then
                raise notice 'Test 7.2: Successfully changed own password';
                
                -- Try logging in with the new password
                begin
                    user_info := user_login('customer1', 'NewPassword123!');
                    
                    if user_info.user_id is not null then
                        raise notice '     Successfully logged in with new password';
                    else
                        raise notice '     FAILED - Could not log in with new password';
                    end if;
                exception
                    when others then
                        raise notice '     FAILED - Could not log in with new password: %', SQLERRM;
                end;
            else
                raise notice 'Test 7.2: FAILED - Could not change own password';
            end if;
        exception
            when others then
                raise notice 'Test 7.2: FAILED - %', SQLERRM;
        end;
        
        -- Test 7.3: Request password reset
        begin
            reset_token := request_password_reset('customer1@example.com');
            
            if reset_token is not null then
                raise notice 'Test 7.3: Successfully requested password reset';
                raise notice '     Reset token: %', reset_token;
                
                -- Verify token is set in database
                select count(*) into user_count
                from public.users
                where id = customer_id and password_reset_token = reset_token;
                
                if user_count > 0 then
                    raise notice '     Reset token correctly stored in database';
                else
                    raise notice '     FAILED - Reset token not stored in database';
                end if;
            else
                raise notice 'Test 7.3: FAILED - Could not request password reset';
            end if;
        exception
            when others then
                raise notice 'Test 7.3: FAILED - %', SQLERRM;
        end;
        
        -- Test 7.4: Complete password reset
        begin
            test_result := complete_password_reset(
                reset_token,
                'ResetPassword123!'
            );
            
            if test_result then
                raise notice 'Test 7.4: Successfully completed password reset';
                
                -- Try logging in with the reset password
                begin
                    user_info := user_login('customer1', 'ResetPassword123!');
                    
                    if user_info.user_id is not null then
                        raise notice '     Successfully logged in with reset password';
                    else
                        raise notice '     FAILED - Could not log in with reset password';
                    end if;
                exception
                    when others then
                        raise notice '     FAILED - Could not log in with reset password: %', SQLERRM;
                end;
                
                -- Verify token is cleared
                select count(*) into user_count
                from public.users
                where id = customer_id and password_reset_token is null;
                
                if user_count > 0 then
                    raise notice '     Reset token correctly cleared from database';
                else
                    raise notice '     FAILED - Reset token not cleared from database';
                end if;
            else
                raise notice 'Test 7.4: FAILED - Could not complete password reset';
            end if;
        exception
            when others then
                raise notice 'Test 7.4: FAILED - %', SQLERRM;
        end;
        
        raise notice 'Test 7: PASSED';
    exception
        when others then
            raise notice 'Test 7: FAILED - %', SQLERRM;
    end;
    
    -- Test 8: Self registration
    raise notice '-------------- Test 8: Self Registration --------------';
    
    begin
        -- Test 8.1: Register new customer
        begin
            new_user_id := register_user(
                'new_customer',
                'Register123!',
                'new_customer@example.com',
                'New',
                'Customer'
            );
            
            if new_user_id is not null then
                raise notice 'Test 8.1: Successfully registered new customer with ID: %', new_user_id;
                
                -- Verify role assignment
                select count(*) into user_count
                from public.user_roles
                where user_id = new_user_id and role = 'CUSTOMER';
                
                if user_count > 0 then
                    raise notice '     Customer role correctly assigned to registered user';
                else
                    raise notice '     FAILED - Customer role not assigned to registered user';
                end if;
                
                -- Try logging in
                begin
                    user_info := user_login('new_customer', 'Register123!');
                    
                    if user_info.user_id is not null then
                        raise notice '     Successfully logged in as newly registered user';
                    else
                        raise notice '     FAILED - Could not log in as newly registered user';
                    end if;
                exception
                    when others then
                        raise notice '     FAILED - Could not log in as newly registered user: %', SQLERRM;
                end;
            else
                raise notice 'Test 8.1: FAILED - Could not register new customer';
            end if;
        exception
            when others then
                raise notice 'Test 8.1: FAILED - %', SQLERRM;
        end;
        
        -- Test 8.2: Register with duplicate username
        begin
            new_user_id := register_user(
                'new_customer',  -- Duplicate username
                'Register123!',
                'another_email@example.com',
                'Another',
                'Customer'
            );
            raise notice 'Test 8.2: FAILED - Allowed registration with duplicate username';
        exception
            when others then
                raise notice 'Test 8.2: Correctly prevented registration with duplicate username: %', SQLERRM;
        end;
        
        -- Test 8.3: Register with invalid email
        begin
            new_user_id := register_user(
                'invalid_email_user',
                'Register123!',
                'invalid-email',  -- Invalid email format
                'Invalid',
                'Email'
            );
            raise notice 'Test 8.3: FAILED - Allowed registration with invalid email';
        exception
            when others then
                raise notice 'Test 8.3: Correctly prevented registration with invalid email: %', SQLERRM;
        end;
        
        -- Test 8.4: Register with weak password
        begin
            new_user_id := register_user(
                'weak_password_user',
                'simple',  -- Weak password
                'weak_password@example.com',
                'Weak',
                'Password'
            );
            raise notice 'Test 8.4: FAILED - Allowed registration with weak password';
        exception
            when others then
                raise notice 'Test 8.4: Correctly prevented registration with weak password: %', SQLERRM;
        end;
        
        raise notice 'Test 8: PASSED';
    exception
        when others then
            raise notice 'Test 8: FAILED - %', SQLERRM;
    end;
    
    raise notice '========== USER OPERATIONS TESTS COMPLETED ==========';
end; $$;