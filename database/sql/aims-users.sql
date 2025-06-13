-- Create UUID extension if not exists
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Improved password hashing with bcrypt
create or replace function hash_password(password varchar) 
returns varchar as $$
begin
    return crypt(password, gen_salt('bf', 10));
end;
$$ language plpgsql;

-- Verify password function
create or replace function verify_password(password varchar, hashed_password varchar) 
returns boolean as $$
begin
    return hashed_password = crypt(password, hashed_password);
end;
$$ language plpgsql;

-- Function to check if user has a specific role
create or replace function user_has_role(
    check_user_id varchar,
    check_role public.user_role
) returns boolean as $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = check_user_id AND role = check_role
    );
END;
$$ language plpgsql;

-- Create new user (admin function)
create or replace function admin_create_user(
    v_username varchar,
    v_password varchar,
    v_email varchar,
    v_first_name varchar,
    v_last_name varchar,
    v_roles public.user_role[] default array['CUSTOMER']::public.user_role[],
    admin_id varchar default null
) returns varchar as $$
declare
    hashed_password varchar;
    new_user_id varchar;
    role public.user_role;
begin
    -- Validate administrator ID
    if admin_id is null then
        raise exception 'Administrator ID is required';
    end if;

    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Validate inputs
    if v_username is null or v_password is null or v_email is null 
       or v_first_name is null or v_last_name is null then
        raise exception 'Required fields cannot be null';
    end if;

    -- Check username length (security improvement)
    if length(v_username) < 5 then
        raise exception 'Username must be at least 5 characters long';
    end if;

    -- Check password complexity (security improvement)
    if length(v_password) < 8 or 
       v_password !~ '[A-Z]' or 
       v_password !~ '[a-z]' or 
       v_password !~ '[0-9]' then
        raise exception 'Password must be at least 8 characters long and contain uppercase, lowercase letters and numbers';
    end if;

    -- Check if username exists
    if exists (select 1 from public.users where username = v_username) then
        raise exception 'Username % already exists', v_username;
    end if;

    -- Check if email exists
    if exists (select 1 from public.users where email = v_email) then
        raise exception 'Email % already exists', v_email;
    end if;

    -- Validate email format
    if v_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
        raise exception 'Invalid email format: %', v_email;
    end if;

    -- Hash password with bcrypt
    hashed_password := hash_password(v_password);

    -- Generate a new UUID for the user
    new_user_id := uuid_generate_v4()::varchar;

    -- Create the user
    insert into public.users (
        id, username, password, email, first_name, last_name, 
        is_blocked, password_reset_token, password_reset_expiry, 
        created_at
    )
    values (
        new_user_id, v_username, hashed_password, v_email, 
        v_first_name, v_last_name, false, null, null, now()
    );

    -- Assign roles to the user
    foreach role in array v_roles
    loop
        insert into public.user_roles (user_id, role)
        values (new_user_id, role);
    end loop;

    return new_user_id;
end;
$$ language plpgsql;

-- View user information (admin function)
create or replace function admin_view_user(
    target_user_id varchar,
    admin_id varchar
) returns table (
    id varchar,
    username varchar,
    email varchar,
    first_name varchar,
    last_name varchar,
    roles public.user_role[],
    is_blocked boolean,
    created_at timestamp,
    last_login timestamp
) as $$
begin
    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Return user information including array of roles
    return query
    select 
        u.id, 
        u.username, 
        u.email, 
        u.first_name, 
        u.last_name, 
        array_agg(ur.role),
        u.is_blocked,
        u.created_at,
        null::timestamp -- last_login placeholder (could be implemented with additional tracking)
    from 
        public.users u
    join 
        public.user_roles ur on u.id = ur.user_id
    where 
        u.id = target_user_id
    group by 
        u.id, u.username, u.email, u.first_name, u.last_name, u.is_blocked, u.created_at;
end;
$$ language plpgsql;

-- Get all users with pagination (admin function)
create or replace function admin_view_all_users(
    admin_id varchar,
    page_number integer default 1,
    page_size integer default 20,
    sort_field varchar default 'created_at',
    sort_direction varchar default 'DESC'
) returns table (
    id varchar,
    username varchar,
    email varchar,
    first_name varchar,
    last_name varchar,
    roles jsonb,
    is_blocked boolean,
    created_at timestamp,
    total_count bigint,
    total_pages integer
) as $$
declare
    valid_sort_fields varchar[] := array['username', 'email', 'first_name', 'last_name', 'created_at'];
    valid_sort_directions varchar[] := array['ASC', 'DESC'];
    total_records bigint;
    total_pages_count integer;
    dynamic_query text;
begin
    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Validate pagination parameters
    if page_number < 1 then
        page_number := 1;
    end if;
    
    if page_size < 1 or page_size > 100 then
        page_size := 20; -- Default page size with upper limit for security
    end if;

    -- Validate sort parameters (SQL injection prevention)
    if not sort_field = any(valid_sort_fields) then
        sort_field := 'created_at';
    end if;
    
    if not upper(sort_direction) = any(valid_sort_directions) then
        sort_direction := 'DESC';
    end if;

    -- Get total count for pagination metadata
    select count(distinct u.id) into total_records
    from public.users u
    join public.user_roles ur on u.id = ur.user_id;

    -- Calculate total pages
    total_pages_count := ceil(total_records::numeric / page_size);

    -- Build and execute dynamic query with appropriate parameters
    return query
    execute format('
        select 
            u.id, 
            u.username, 
            u.email, 
            u.first_name, 
            u.last_name, 
            jsonb_agg(ur.role),
            u.is_blocked,
            u.created_at,
            %L::bigint as total_count,
            %L::integer as total_pages
        from 
            public.users u
        join 
            public.user_roles ur on u.id = ur.user_id
        group by 
            u.id, u.username, u.email, u.first_name, u.last_name, u.is_blocked, u.created_at
        order by 
            u.%I %s
        limit %L offset %L',
        total_records,
        total_pages_count,
        sort_field,
        sort_direction,
        page_size,
        (page_number - 1) * page_size
    );
end;
$$ language plpgsql;

-- Block/unblock user (admin function)
drop function if exists admin_toggle_user_block;
create or replace function admin_toggle_user_block(
    target_user_id varchar,
    admin_id varchar
) returns void as $$
begin
    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Check if user exists
    if not exists (select 1 from public.users where id = target_user_id) then
        raise exception 'User with ID % not found', target_user_id;
    end if;
    
    -- Prevent blocking yourself
    if target_user_id = admin_id then
        raise exception 'Administrators cannot block themselves';
    end if;

    -- Update block status
    update public.users
    set is_blocked = not is_blocked
    where id = target_user_id;
end;
$$ language plpgsql;

-- Set/change user roles (admin function)
create or replace function admin_set_user_roles(
    target_user_id varchar,
    new_roles public.user_role[],
    admin_id varchar
) returns void as $$
declare
    role public.user_role;
begin
    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Check if user exists
    if not exists (select 1 from public.users where id = target_user_id) then
        raise exception 'User with ID % not found', target_user_id;
    end if;

    -- Validate roles array is not empty
    if array_length(new_roles, 1) is null or array_length(new_roles, 1) = 0 then
        raise exception 'User must have at least one role';
    end if;
    
    -- Prevent removing admin role from yourself
    if target_user_id = admin_id and not 'ADMIN' = any(new_roles) then
        raise exception 'Administrators cannot remove their own admin role';
    end if;

    -- Start transaction for role updates
    begin
        -- Remove existing roles
        delete from public.user_roles
        where user_id = target_user_id;

        -- Assign new roles
        foreach role in array new_roles
        loop
            insert into public.user_roles (user_id, role)
            values (target_user_id, role);
        end loop;
    exception
        when others then
            raise exception 'Error updating roles: %', SQLERRM;
    end;
end;
$$ language plpgsql;

-- Reset user password (admin function)
create or replace function admin_reset_user_password(
    target_user_id varchar,
    admin_id varchar
) returns varchar as $$
declare
    temp_password varchar;
    reset_token varchar;
    expiry timestamp;
begin
    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Check if user exists
    if not exists (select 1 from public.users where id = target_user_id) then
        raise exception 'User with ID % not found', target_user_id;
    end if;

    -- Generate reset token and temporary password
    reset_token := uuid_generate_v4()::varchar;
    temp_password := substring(md5(random()::text) from 1 for 6) || 
                     substring(md5(random()::text) from 1 for 2) || 
                     chr(floor(65 + random() * 26)::int) || 
                     chr(floor(48 + random() * 10)::int);
    expiry := now() + interval '24 hours';

    -- Update user with reset token and expiry
    update public.users
    set 
        password_reset_token = reset_token,
        password_reset_expiry = expiry,
        password = hash_password(temp_password)
    where id = target_user_id;

    -- Return temp password - application layer will handle notification
    return temp_password;
end;
$$ language plpgsql;

-- Delete user (admin function)
create or replace function admin_delete_user(
    target_user_id varchar,
    admin_id varchar
) returns boolean as $$
begin
    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Check if user exists
    if not exists (select 1 from public.users where id = target_user_id) then
        raise exception 'User with ID % not found', target_user_id;
    end if;
    
    -- Prevent deleting yourself
    if target_user_id = admin_id then
        raise exception 'Administrators cannot delete themselves';
    end if;

    -- Start transaction
    begin
        -- Delete user roles first (due to foreign key constraints)
        delete from public.user_roles
        where user_id = target_user_id;

        -- Delete the user
        delete from public.users
        where id = target_user_id;
        
        return true;
    exception
        when others then
            raise exception 'Error deleting user: %', SQLERRM;
            return false;
    end;
end;
$$ language plpgsql;

-- Search users with pagination (admin function)
create or replace function admin_search_users(
    admin_id varchar,
    search_term varchar default null,
    role_filter public.user_role default null,
    is_blocked_filter boolean default null,
    page_number integer default 1,
    page_size integer default 20,
    sort_field VARCHAR DEFAULT 'created_at',
    sort_direction VARCHAR DEFAULT 'DESC'
) returns table (
    id varchar,
    username varchar,
    email varchar,
    first_name varchar,
    last_name varchar,
    roles public.user_role[],
    is_blocked boolean,
    created_at timestamp,
    total_count bigint,
    total_pages integer
) as $$
declare
    valid_sort_fields varchar[] := array['username', 'email', 'first_name', 'last_name', 'created_at'];
    valid_sort_directions varchar[] := array['ASC', 'DESC'];
    search_condition text := '';
    role_condition text := '';
    block_condition text := '';
    total_records bigint;
    total_pages_count integer;
    query_str text;
    count_query_str text;
begin
    -- Validate administrator
    if not user_has_role(admin_id, 'ADMIN') then
        raise exception 'Unauthorized: User is not an administrator';
    end if;

    -- Validate pagination parameters
    if page_number < 1 then
        page_number := 1;
    end if;
    
    if page_size < 1 or page_size > 100 then
        page_size := 20; -- Default page size with upper limit for security
    end if;

    -- Validate sort parameters (SQL injection prevention)
    if not sort_field = any(valid_sort_fields) then
        sort_field := 'created_at';
    end if;
    
    if not upper(sort_direction) = any(valid_sort_directions) then
        sort_direction := 'DESC';
    end if;

    -- Build search condition
    if search_term is not null and search_term != '' then
        search_condition := format(' AND (
            u.username ILIKE ''%%' || search_term || '%%'' OR
            u.email ILIKE ''%%' || search_term || '%%'' OR
            u.first_name ILIKE ''%%' || search_term || '%%'' OR
            u.last_name ILIKE ''%%' || search_term || '%%''
        )');
    end if;

    -- Build role filter condition
    if role_filter is not null then
        role_condition := format(' AND %L = ANY(ARRAY_AGG(ur.role))', role_filter);
    end if;

    -- Build block status filter condition
    if is_blocked_filter is not null then
        block_condition := format(' AND u.is_blocked = %L', is_blocked_filter);
    end if;

    -- Build count query - must include the same conditions as the main query but without sort, limit, offset
    count_query_str := '
        SELECT COUNT(DISTINCT u.id)
        FROM public.users u
        JOIN public.user_roles ur ON u.id = ur.user_id
        WHERE 1=1' || search_condition || block_condition;
        
    if role_filter is not null then
        count_query_str := '
            SELECT COUNT(*)
            FROM (
                SELECT u.id
                FROM public.users u
                JOIN public.user_roles ur ON u.id = ur.user_id
                WHERE 1=1' || search_condition || block_condition || '
                GROUP BY u.id
                HAVING ' || role_filter::text || ' = ANY(ARRAY_AGG(ur.role))
            ) AS filtered_users';
    end if;

    -- Execute count query
    execute count_query_str into total_records;

    -- Calculate total pages
    total_pages_count := ceil(total_records::numeric / page_size);

    -- Build main query
    query_str := format('
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.first_name, 
            u.last_name, 
            ARRAY_AGG(ur.role),
            u.is_blocked,
            u.created_at,
            %L::BIGINT AS total_count,
            %L::INTEGER AS total_pages
        FROM 
            public.users u
        JOIN 
            public.user_roles ur ON u.id = ur.user_id
        WHERE 1=1%s%s
        GROUP BY 
            u.id, u.username, u.email, u.first_name, u.last_name, u.is_blocked, u.created_at
        %s
        ORDER BY 
            u.%I %s
        LIMIT %L OFFSET %L',
        total_records,
        total_pages_count,
        search_condition,
        block_condition,
        CASE WHEN role_filter IS NOT NULL THEN format('HAVING %L = ANY(ARRAY_AGG(ur.role))', role_filter) ELSE '' END,
        sort_field,
        sort_direction,
        page_size,
        (page_number - 1) * page_size
    );

    -- Execute main query
    return query execute query_str;
end;
$$ language plpgsql;

-- User login function with improved security
create or replace function user_login(
    input_username varchar,
    input_password varchar
) returns table (
    user_id varchar,
    username varchar,
    first_name varchar,
    last_name varchar,
    roles jsonb
) as $$
declare
    v_user_id varchar;
    v_is_blocked boolean;
    v_stored_password varchar;
begin
    -- Get user information
    select u.id, u.is_blocked, u.password 
    into v_user_id, v_is_blocked, v_stored_password
    from public.users u
    where u.username = input_username;

    -- Check if user exists
    if v_user_id is null then
        -- Use a constant time comparison to prevent timing attacks
        perform verify_password(input_password, hash_password('dummy'));
        raise exception 'Invalid username or password';
    end if;

    -- Check if user is blocked
    if v_is_blocked then
        raise exception 'Your account has been blocked. Please contact an administrator';
    end if;

    -- Verify password using bcrypt
    if not verify_password(input_password, v_stored_password) then
        raise exception 'Invalid username or password';
    end if;

    -- Add login attempt logging here if needed
    -- PERFORM log_login_attempt(v_user_id, TRUE);

    -- Return user information including roles
    return query
    select 
        u.id, 
        u.username, 
        u.first_name, 
        u.last_name, 
        jsonb_agg(ur.role)
    from 
        public.users u
    join 
        public.user_roles ur on u.id = ur.user_id
    where 
        u.id = v_user_id
    group by 
        u.id, u.username, u.first_name, u.last_name;
end;
$$ language plpgsql;

-- Change own password (any user)
create or replace function user_change_password(
    user_id varchar,
    old_password varchar,
    new_password varchar
) returns boolean as $$
declare
    stored_password varchar;
begin
    -- Get stored password
    select password into stored_password
    from public.users
    where id = user_id;

    if stored_password is null then
        raise exception 'User not found';
    end if;

    -- Check password complexity
    if length(new_password) < 8 or 
       new_password !~ '[A-Z]' or 
       new_password !~ '[a-z]' or 
       new_password !~ '[0-9]' then
        raise exception 'Password must be at least 8 characters long and contain uppercase, lowercase letters and numbers';
    end if;

    -- Verify old password
    if not verify_password(old_password, stored_password) then
        raise exception 'Current password is incorrect';
    end if;

    -- Update password
    update public.users
    set password = hash_password(new_password)
    where id = user_id;
    
    return true;
end;
$$ language plpgsql;

-- Complete password reset (using token)
create or replace function complete_password_reset(
    reset_token varchar,
    new_password varchar
) returns boolean as $$
declare
    user_id varchar;
begin
    -- Find user by reset token and check expiry
    select id into user_id
    from public.users
    where 
        password_reset_token = reset_token 
        and password_reset_expiry > now();

    if user_id is null then
        raise exception 'Invalid or expired reset token';
    end if;

    -- Check password complexity
    if length(new_password) < 8 or 
       new_password !~ '[A-Z]' or 
       new_password !~ '[a-z]' or 
       new_password !~ '[0-9]' then
        raise exception 'Password must be at least 8 characters long and contain uppercase, lowercase letters and numbers';
    end if;

    -- Update password and clear reset token
    update public.users
    set 
        password = hash_password(new_password),
        password_reset_token = null,
        password_reset_expiry = null
    WHERE id = user_id;
    
    return true;
end;
$$ language plpgsql;

-- View own profile function
create or replace function user_view_profile(
    v_user_id varchar
) returns table (
    username varchar,
    email varchar,
    first_name varchar,
    last_name varchar,
    roles jsonb,
    created_at timestamp
) as $$
begin
    -- Check if user exists
    if not exists (select 1 from public.users where id = v_user_id) then
        raise exception 'User not found';
    end if;

    -- Return user's own profile information
    return query
    select 
        u.username, 
        u.email, 
        u.first_name, 
        u.last_name, 
        jsonb_agg(ur.role),
        u.created_at
    from 
        public.users u
    join 
        public.user_roles ur on u.id = ur.user_id
    where 
        u.id = v_user_id
    group by 
        u.username, u.email, u.first_name, u.last_name, u.created_at;
end;
$$ language plpgsql;

-- Drop existing function if exists to avoid conflicts
drop function if exists register_user;

-- Create function to register a new user (customer)
create or replace function register_user(
    v_username varchar,
    v_password varchar,
    v_email varchar,
    v_first_name varchar,
    v_last_name varchar
) returns varchar as $$
declare
    hashed_password varchar;
    new_user_id varchar;
begin
    -- Validate inputs
    if v_username is null or v_password is null or v_email is null 
       or v_first_name is null or v_last_name is null then
        raise exception 'Required fields cannot be null';
    end if;

    -- Check username length (security improvement)
    if length(v_username) < 5 then
        raise exception 'Username must be at least 5 characters long';
    end if;

    -- Check password complexity (security improvement)
    if length(v_password) < 8 or 
       v_password !~ '[A-Z]' or 
       v_password !~ '[a-z]' or 
       v_password !~ '[0-9]' then
        raise exception 'Password must be at least 8 characters long and contain uppercase, lowercase letters and numbers';
    end if;

    -- Check if username exists
    if exists (select 1 from public.users where username = v_username) then
        raise exception 'Username % already exists', v_username;
    end if;

    -- Check if email exists
    if exists (select 1 from public.users where email = v_email) then
        raise exception 'Email % already exists', v_email;
    end if;

    -- Validate email format
    if v_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
        raise exception 'Invalid email format: %', v_email;
    end if;

    -- Hash password with bcrypt
    hashed_password := hash_password(v_password);

    -- Generate a new UUID for the user
    new_user_id := uuid_generate_v4()::varchar;

    -- Create the user
    insert into public.users (
        id, username, password, email, first_name, last_name, 
        is_blocked, password_reset_token, password_reset_expiry, 
        created_at
    )
    values (
        new_user_id, v_username, hashed_password, v_email, 
        v_first_name, v_last_name, false, null, null, now()
    );

    -- Assign CUSTOMER role to the user
    insert into public.user_roles (user_id, role)
    values (new_user_id, 'CUSTOMER');

    return new_user_id;
exception
    when others then
        raise exception 'Error registering user: %', SQLERRM;
end;
$$ language plpgsql;

-- Update user information
create or replace function update_user(
    v_user_id varchar,
    v_email varchar default null,
    v_first_name varchar default null,
    v_last_name varchar default null
) returns void as $$
begin
    -- Check if user exists
    if not exists (select 1 from public.users where id = v_user_id) then
        raise exception 'User with ID % not found', v_user_id;
    end if;

    -- Validate email format if provided
    if v_email is not null then
        if v_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
            raise exception 'Invalid email format: %', v_email;
        end if;

        -- Check if email is already used by another user
        if exists (select 1 from public.users where email = v_email and id != v_user_id) then
            raise exception 'Email % already exists for another user', v_email;
        end if;
    end if;

    -- If email is null, get the current email from the database
    if v_email is null then
        select email into v_email from public.users where id = v_user_id;
    end if;

    -- If first name is null, get the current first name from the database
    if v_first_name is null then
        select first_name into v_first_name from public.users where id = v_user_id;
    end if;

    -- If last name is null, get the current last name from the database
    if v_last_name is null then
        select last_name into v_last_name from public.users where id = v_user_id;
    end if;

    -- Update user information
    update public.users
    set 
        email = coalesce(v_email, email),
        first_name = coalesce(v_first_name, first_name),
        last_name = coalesce(v_last_name, last_name)
    where id = v_user_id;
end;
$$ language plpgsql;

-- Request password reset (self-service)
create or replace function request_password_reset(
    user_email varchar
) returns varchar as $$
declare
    target_user_id varchar;
    reset_token varchar;
    expiry timestamp;
begin
    -- Check if user exists with this email
    select id into target_user_id
    from public.users
    where email = user_email;

    if target_user_id is null then
        -- Still generate a token even if email not found (security best practice)
        -- This prevents user enumeration attacks by maintaining consistent response timing
        reset_token := uuid_generate_v4()::varchar;
        return reset_token;
    end if;

    -- Generate reset token
    reset_token := uuid_generate_v4()::varchar;
    expiry := now() + interval '24 hours';

    -- Update user with reset token and expiry
    update public.users
    set 
        password_reset_token = reset_token,
        password_reset_expiry = expiry
    where id = target_user_id;

    -- Return token - application layer will handle email notification
    return reset_token;
end;
$$ language plpgsql;