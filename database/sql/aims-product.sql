-- Drop function if exists to avoid conflicts
drop function if exists create_media_product;

-- Create product with proper validation for media store
create or replace function create_media_product(
    -- Common product attributes
    p_title varchar,
    p_barcode varchar,
    p_base_value decimal(10, 2),
    p_current_price decimal(10, 2),
    p_stock integer,
    p_media_type public.media_type,
    p_product_description text,
    p_dimensions varchar(100),
    p_weight decimal(10, 2),
    p_created_by varchar,
    p_warehouse_entry_date date default CURRENT_DATE,
    
    -- Book specific attributes
    p_book_authors text[] default null,
    p_book_cover_type public.cover_type default null,
    p_book_publisher varchar default null,
    p_book_publication_date date default null,
    p_book_pages integer default null,
    p_book_language varchar(50) default null,
    p_book_genre varchar(100) default null,
    
    -- CD specific attributes
    p_cd_artists text[] default null,
    p_cd_record_label varchar default null,
    p_cd_tracklist text[] default null,
    p_cd_genre varchar default null,
    p_cd_release_date date default null,
    
    -- LP Record specific attributes
    p_lp_artists text[] default null,
    p_lp_record_label varchar default null,
    p_lp_tracklist text[] default null,
    p_lp_genre varchar default null,
    p_lp_release_date date default null,
    
    -- DVD specific attributes
    p_dvd_disc_type public.disc_type default null,
    p_dvd_director varchar default null,
    p_dvd_runtime integer default null,
    p_dvd_studio varchar default null,
    p_dvd_language varchar default null,
    p_dvd_subtitles text[] default null,
    p_dvd_release_date date default null,
    p_dvd_genre varchar default null
) 
returns integer as $$
declare
    v_new_product_id integer;
begin
    -- Validate user has product manager role
    if not user_has_role(p_created_by, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;
    
    -- Validate common required fields
    if p_title is null or p_barcode is null or 
       p_base_value is null or p_current_price is null or p_stock is null or 
       p_media_type is null or p_product_description is null or 
       p_dimensions is null or p_weight is null then
        raise exception 'Required product fields cannot be null';
    end if;
    
    -- Validate barcode uniqueness
    if exists (select 1 from products where barcode = p_barcode) then
        raise exception 'Barcode % already exists', p_barcode;
    end if;
    
    -- Validate value and price constraints
    if p_base_value <= 0 then
        raise exception 'Product value must be greater than zero';
    end if;
    
    if p_current_price <= 0 then
        raise exception 'Product price must be greater than zero';
    end if;
    
    -- Validate price is between 30% and 150% of base value
    if p_current_price < (p_base_value * 0.3) or p_current_price > (p_base_value * 1.5) then
        raise exception 'Product price must be between 30%% and 150%% of product value';
    end if;
    
    -- Validate weight
    if p_weight <= 0 then
        raise exception 'Product weight must be greater than zero';
    end if;
    
    -- Validate stock
    if p_stock < 0 then
        raise exception 'Product stock cannot be negative';
    end if;
    
    -- Validate media type specific attributes
    case p_media_type
        when 'BOOK' then
            -- Validate book specific attributes
            if p_book_authors is null or p_book_cover_type is null or 
               p_book_publisher is null or p_book_publication_date is null then
                raise exception 'Required book attributes are missing';
            end if;
        
        when 'CD' then
            -- Validate CD specific attributes
            if p_cd_artists is null or p_cd_record_label is null or 
               p_cd_tracklist is null or p_cd_genre is null then
                raise exception 'Required CD attributes are missing';
            end if;
        
        when 'LP_RECORD' then
            -- Validate LP Record specific attributes
            if p_lp_artists is null or p_lp_record_label is null or 
               p_lp_tracklist is null or p_lp_genre is null then
                raise exception 'Required LP Record attributes are missing';
            end if;
        
        when 'DVD' then
            -- Validate DVD specific attributes
            if p_dvd_disc_type is null or p_dvd_director is null or 
               p_dvd_runtime is null or p_dvd_studio is null or 
               p_dvd_language is null or p_dvd_subtitles is null then
                raise exception 'Required DVD attributes are missing';
            end if;
            
            -- Validate runtime is positive
            if p_dvd_runtime <= 0 then
                raise exception 'DVD runtime must be greater than zero';
            end if;
        
        else
            raise exception 'Invalid media type: %', p_media_type;
    end case;
    
    -- Start transaction
    begin
        -- Insert base product record
        insert into products (
            title, barcode, base_value, current_price, stock, media_type,
            product_description, dimensions, weight, warehouse_entry_date
        ) values (
            p_title, p_barcode, p_base_value, p_current_price, p_stock, p_media_type,
            p_product_description, p_dimensions, p_weight, p_warehouse_entry_date
        ) returning id into v_new_product_id;
        
        -- Insert media type specific attributes
        case p_media_type
            when 'BOOK' then
                insert into books (
                    product_id, authors, cover_type, publisher, publication_date,
                    pages, language, genre
                ) values (
                    v_new_product_id, p_book_authors, p_book_cover_type, p_book_publisher, p_book_publication_date,
                    p_book_pages, p_book_language, p_book_genre
                );
            
            when 'CD' then
                insert into cds (
                    product_id, artists, record_label, tracklist, genre, release_date
                ) values (
                    v_new_product_id, p_cd_artists, p_cd_record_label, p_cd_tracklist, p_cd_genre, p_cd_release_date
                );
            
            when 'LP_RECORD' then
                insert into lp_records (
                    product_id, artists, record_label, tracklist, genre, release_date
                ) values (
                    v_new_product_id, p_lp_artists, p_lp_record_label, p_lp_tracklist, p_lp_genre, p_lp_release_date
                );
            
            when 'DVD' then
                insert into dvds (
                    product_id, disc_type, director, runtime, studio, language,
                    subtitles, release_date, genre
                ) values (
                    v_new_product_id, p_dvd_disc_type, p_dvd_director, p_dvd_runtime, p_dvd_studio, p_dvd_language,
                    p_dvd_subtitles, p_dvd_release_date, p_dvd_genre
                );
            
            else
                raise exception 'Invalid media type: %', p_media_type;
        end case;
        
        -- Record product edit history
        insert into product_edit_history (
            product_id, operation_type, changed_by, operation_details
        ) values (
            v_new_product_id, 'ADD', p_created_by, 
            jsonb_build_object(
                'title', p_title,
                'media_type', p_media_type,
                'base_value', p_base_value,
                'current_price', p_current_price
            )
        );
        
        -- Return the new product ID
        return v_new_product_id;
    exception
        when others then
            raise exception 'Error creating product: %', sqlerrm;
    end;
end;
$$ language plpgsql;

-- Function to get random products for customer homepage
-- Returns 20 random active products per page
create or replace function get_random_products(
    p_page_size integer default 20
)
returns table (
    product_id integer,
    title varchar,
    media_type public.media_type,
    base_value decimal(10, 2),
    current_price decimal(10, 2),
    barcode varchar
) as $$
begin
    return query
    select 
        p.id as product_id,
        p.title,
        p.media_type,
        p.base_value,
        p.current_price,
        p.barcode
    from products p
    where p.stock > 0
    order by random()
    limit p_page_size;
end;
$$ language plpgsql;

-- Function to search products by attributes with pagination and sorting
create or replace function search_products(
    p_title varchar default null,
    p_media_type public.media_type default null,
    p_min_price decimal(10, 2) default null,
    p_max_price decimal(10, 2) default null,
    p_author_artist varchar default null,
    p_sort_by varchar default 'title',
    p_sort_order varchar default 'asc',
    p_page integer default 1,
    p_page_size integer default 20
)
returns table (
    product_id integer,
    title varchar,
    media_type public.media_type,
    base_value decimal(10, 2),
    current_price decimal(10, 2),
    barcode varchar,
    book_authors text[],
    cd_lp_artists text[],
    dvd_director varchar,
    stock integer,
    total_count bigint
) as $$
declare
    v_valid_sort_fields varchar[] := array['title', 'price_asc', 'price_desc', 'media_type'];
    v_author_query text := '';
    v_sql text;
begin
    if p_sort_by is null or not (p_sort_by = any(v_valid_sort_fields)) then
        p_sort_by := 'title';
    end if;
    
    if p_author_artist is not null then
        v_author_query := '
            and (
                exists (
                    select 1 from books b 
                    where b.product_id = p.id 
                    and exists (
                        select 1 from unnest(b.authors) author 
                        where author ilike ''%' || p_author_artist || '%''
                    )
                )
                or exists (
                    select 1 from cds c 
                    where c.product_id = p.id 
                    and exists (
                        select 1 from unnest(c.artists) artist 
                        where artist ilike ''%' || p_author_artist || '%''
                    )
                )
                or exists (
                    select 1 from lp_records l 
                    where l.product_id = p.id 
                    and exists (
                        select 1 from unnest(l.artists) artist 
                        where artist ilike ''%' || p_author_artist || '%''
                    )
                )
                or exists (
                    select 1 from dvds d 
                    where d.product_id = p.id 
                    and d.director ilike ''%' || p_author_artist || '%''
                )
            )';
    end if;

    v_sql := '
        with product_data as (
            select 
                p.id,
                p.title,
                p.media_type,
                p.base_value,
                p.current_price,
                p.barcode,
                p.stock,
                b.authors as book_authors,
                case 
                    when p.media_type = ''CD'' then cd.artists 
                    when p.media_type = ''LP_RECORD'' then lp.artists 
                    else null 
                end as cd_lp_artists,
                d.director as dvd_director,
                count(*) over() as total_count
            from products p
            left join books b on p.id = b.product_id and p.media_type = ''BOOK''
            left join cds cd on p.id = cd.product_id and p.media_type = ''CD''
            left join lp_records lp on p.id = lp.product_id and p.media_type = ''LP_RECORD''
            left join dvds d on p.id = d.product_id and p.media_type = ''DVD''
            where 1=1
            and (p.stock > 0)
            and ($1 is null or p.title ilike ''%'' || $1 || ''%'')
            and ($2 is null or p.media_type = $2)
            and ($3 is null or p.current_price >= $3)
            and ($4 is null or p.current_price <= $4)
            ' || v_author_query || '
        )
        select 
            id as product_id,
            title,
            media_type,
            base_value,
            current_price,
            barcode,
            book_authors,
            cd_lp_artists,
            dvd_director,
            stock,
            total_count
        from product_data
        order by 
            case when $5 = ''title'' and $6 = ''asc'' then title end asc,
            case when $5 = ''title'' and $6 = ''desc'' then title end desc,
            case when $5 = ''price_asc'' then current_price end asc,
            case when $5 = ''price_desc'' then current_price end desc,
            case when $5 = ''media_type'' and $6 = ''asc'' then media_type end asc,
            case when $5 = ''media_type'' and $6 = ''desc'' then media_type end desc
        limit $8
        offset ($7 - 1) * $8';
        
    return query execute v_sql 
    using p_title, p_media_type, p_min_price, p_max_price, 
          p_sort_by, p_sort_order, p_page, p_page_size;
end;
$$ language plpgsql;

-- Drop the existing function if it exists
drop function if exists get_product_details;

-- Create or replace the function with JSON output structure that matches the CompleteProduct interface
create or replace function get_product_details(
    p_product_id integer
)
returns jsonb as $$
declare
    v_product jsonb;
    v_media_type public.media_type;
    v_media_details jsonb;
begin
    -- Get base product information matching the Product interface
    select jsonb_build_object(
        'id', p.id,
        'title', p.title,
        'barcode', p.barcode,
        'base_value', p.base_value,
        'current_price', p.current_price,
        'stock', p.stock,
        'media_type', p.media_type,
        'product_description', p.product_description,
        'dimensions', p.dimensions,
        'weight', p.weight,
        'warehouse_entry_date', p.warehouse_entry_date,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) into v_product
    from products p
    where p.id = p_product_id;
    
    -- If product not found, return null
    if v_product is null then
        return null;
    end if;
    
    -- Get the media type from the product
    select p.media_type into v_media_type
    from products p
    where p.id = p_product_id;
    
    -- Create media-specific details based on the media type
    -- This matches the nested structure in CompleteProduct (book?, cd?, lp_record?, dvd?)
    case v_media_type
        when 'BOOK' then
            select jsonb_build_object(
                'book', jsonb_build_object(
                    'product_id', b.product_id,
                    'authors', b.authors,
                    'cover_type', b.cover_type,
                    'publisher', b.publisher,
                    'publication_date', b.publication_date,
                    'pages', b.pages,
                    'language', b.language,
                    'genre', b.genre
                )
            ) into v_media_details
            from books b
            where b.product_id = p_product_id;
            
        when 'CD' then
            select jsonb_build_object(
                'cd', jsonb_build_object(
                    'product_id', c.product_id,
                    'artists', c.artists,
                    'record_label', c.record_label,
                    'tracklist', c.tracklist,
                    'genre', c.genre,
                    'release_date', c.release_date
                )
            ) into v_media_details
            from cds c
            where c.product_id = p_product_id;
            
        when 'LP_RECORD' then
            select jsonb_build_object(
                'lp_record', jsonb_build_object(
                    'product_id', l.product_id,
                    'artists', l.artists,
                    'record_label', l.record_label,
                    'tracklist', l.tracklist,
                    'genre', l.genre,
                    'release_date', l.release_date
                )
            ) into v_media_details
            from lp_records l
            where l.product_id = p_product_id;
            
        when 'DVD' then
            select jsonb_build_object(
                'dvd', jsonb_build_object(
                    'product_id', d.product_id,
                    'disc_type', d.disc_type,
                    'director', d.director,
                    'runtime', d.runtime,
                    'studio', d.studio,
                    'language', d.language,
                    'subtitles', d.subtitles,
                    'release_date', d.release_date,
                    'genre', d.genre
                )
            ) into v_media_details
            from dvds d
            where d.product_id = p_product_id;
            
        else
            v_media_details := jsonb_build_object();
    end case;
    
    -- Combine base product info with media-specific details to match CompleteProduct structure
    return v_product || v_media_details;
end;
$$ language plpgsql;

-- Create a wrapper function that returns a table for backwards compatibility
create or replace function get_product_details_as_table(
    p_product_id integer
)
returns table (
    -- Common attributes
    product_id integer,
    title varchar,
    barcode varchar,
    base_value decimal(10, 2),
    current_price decimal(10, 2),
    stock integer,
    media_type public.media_type,
    product_description text,
    dimensions varchar,
    weight decimal(10, 2),
    warehouse_entry_date date,
    
    -- Book attributes
    book_authors text[],
    book_cover_type public.cover_type,
    book_publisher varchar,
    book_publication_date date,
    book_pages integer,
    book_language varchar,
    book_genre varchar,
    
    -- CD attributes
    cd_artists text[],
    cd_record_label varchar,
    cd_tracklist text[],
    cd_genre varchar,
    cd_release_date date,
    
    -- LP record attributes
    lp_artists text[],
    lp_record_label varchar,
    lp_tracklist text[],
    lp_genre varchar,
    lp_release_date date,
    
    -- DVD attributes
    dvd_disc_type public.disc_type,
    dvd_director varchar,
    dvd_runtime integer,
    dvd_studio varchar,
    dvd_language varchar,
    dvd_subtitles text[],
    dvd_release_date date,
    dvd_genre varchar
) as $$
begin
    return query
    select 
        p.id,
        p.title,
        p.barcode,
        p.base_value,
        p.current_price,
        p.stock,
        p.media_type,
        p.product_description,
        p.dimensions,
        p.weight,
        p.warehouse_entry_date,
        
        -- Book attributes (null if not a book)
        b.authors,
        b.cover_type,
        b.publisher,
        b.publication_date,
        b.pages,
        b.language,
        b.genre,
        
        -- CD attributes (null if not a CD)
        cd.artists,
        cd.record_label,
        cd.tracklist,
        cd.genre,
        cd.release_date,
        
        -- LP record attributes (null if not an LP)
        lp.artists,
        lp.record_label,
        lp.tracklist,
        lp.genre,
        lp.release_date,
        
        -- DVD attributes (null if not a DVD)
        d.disc_type,
        d.director,
        d.runtime,
        d.studio,
        d.language,
        d.subtitles,
        d.release_date,
        d.genre
    from products p
    left join books b on p.id = b.product_id and p.media_type = 'BOOK'
    left join cds cd on p.id = cd.product_id and p.media_type = 'CD'
    left join lp_records lp on p.id = lp.product_id and p.media_type = 'LP_RECORD'
    left join dvds d on p.id = d.product_id and p.media_type = 'DVD'
    where p.id = p_product_id;
end;
$$ language plpgsql;

-- Function for product managers to view products with pagination
-- This includes all products regardless of stock level
create or replace function pm_view_products(
    p_title varchar default null,
    p_media_type public.media_type default null,
    p_min_price decimal(10, 2) default null,
    p_max_price decimal(10, 2) default null,
    p_include_out_of_stock boolean default true,
    p_sort_by varchar default 'id',
    p_sort_order varchar default 'asc',
    p_page integer default 1,
    p_page_size integer default 20,
    p_user_id varchar default null
)
returns table (
    product_id integer,
    title varchar,
    barcode varchar,
    media_type public.media_type,
    base_value decimal(10, 2),
    current_price decimal(10, 2),
    stock integer,
    last_price_change timestamp,
    total_count bigint
) as $$
begin
    -- Validate user has product manager role
    if not user_has_role(p_user_id, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;
    
    return query
    with price_history as (
        select 
            pph.product_id,
            MAX(pph.changed_at) AS last_change
        from product_price_history pph
        group by pph.product_id
    )
    select 
        p.id,
        p.title,
        p.barcode,
        p.media_type,
        p.base_value,
        p.current_price,
        p.stock,
        
        ph.last_change as last_price_change,
        count(*) over() as total_count
    from products p
    left join price_history ph on p.id = ph.product_id
    where (p_title is null or p.title ilike '%' || p_title || '%')
    and (p_media_type is null or p.media_type = p_media_type)
    and (p_min_price is null or p.current_price >= p_min_price)
    and (p_max_price is null or p.current_price <= p_max_price)
    and (p_include_out_of_stock or p.stock > 0)
    order by 
        case when p_sort_by = 'id' and p_sort_order = 'asc' then p.id end asc,
        case when p_sort_by = 'id' and p_sort_order = 'desc' then p.id end desc,
        case when p_sort_by = 'title' and p_sort_order = 'asc' then p.title end asc,
        case when p_sort_by = 'title' and p_sort_order = 'desc' then p.title end desc,
        case when p_sort_by = 'price' and p_sort_order = 'asc' then p.current_price end asc,
        case when p_sort_by = 'price' and p_sort_order = 'desc' then p.current_price end desc,
        case when p_sort_by = 'stock' and p_sort_order = 'asc' then p.stock end asc,
        case when p_sort_by = 'stock' and p_sort_order = 'desc' then p.stock end desc,
        case when p_sort_by = 'last_price_change' and p_sort_order = 'asc' then ph.last_change end asc,
        case when p_sort_by = 'last_price_change' and p_sort_order = 'desc' then ph.last_change end desc
    limit p_page_size
    offset (p_page - 1) * p_page_size;
end;
$$ language plpgsql;

-- Function to check if a product is eligible for rush delivery
create or replace function is_product_rush_delivery_eligible(
    p_product_id integer
)
returns boolean as $$
declare
    v_weight decimal(10, 2);
    v_media_type public.media_type;
begin
    -- Get product weight and media type
    select weight, media_type 
    into v_weight, v_media_type
    from products
    where id = p_product_id;
    
    -- Product eligibility criteria:
    -- 1. Weight should be manageable (less than 3kg)
    -- 2. Format preference (digital media preferred)
    return v_weight < 3.0 and 
           (v_media_type in ('CD', 'DVD'));
end;
$$ language plpgsql;

-- Function to get product price history
create or replace function get_product_price_history(
    p_product_id integer,
    p_user_id varchar default null
)
returns table (
    price_change_id integer,
    old_price decimal(10, 2),
    new_price decimal(10, 2),
    changed_by varchar,
    changed_at timestamp
) as $$
begin
    -- Validate user has product manager role
    if p_user_id is not null and not user_has_role(p_user_id, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;
    
    return query
    select 
        pph.id as price_change_id,
        pph.old_price,
        pph.new_price,
        u.username as changed_by,
        pph.changed_at
    from product_price_history pph
    join users u on pph.changed_by = u.id
    where pph.product_id = p_product_id
    order by pph.changed_at desc;
end;
$$ language plpgsql;

-- Function to update a media product with validation
create or replace function update_media_product(
    -- Required parameters first
    p_product_id integer,
    p_updated_by varchar, -- User ID of the product manager
    
    -- Common product attributes with defaults
    p_title varchar default null,
    p_barcode varchar default null,
    p_base_value decimal(10, 2) default null,
    p_current_price decimal(10, 2) default null,
    p_stock integer default null,
    p_product_description text default null,
    p_dimensions varchar(100) default null,
    p_weight decimal(10, 2) default null,
    
    -- Book specific attributes
    p_book_authors text[] default null,
    p_book_cover_type public.cover_type default null,
    p_book_publisher varchar default null,
    p_book_publication_date date default null,
    p_book_pages integer default null,
    p_book_language varchar(50) default null,
    p_book_genre varchar(100) default null,
    
    -- CD specific attributes
    p_cd_artists text[] default null,
    p_cd_record_label varchar default null,
    p_cd_tracklist text[] default null,
    p_cd_genre varchar default null,
    p_cd_release_date date default null,
    
    -- LP Record specific attributes
    p_lp_artists text[] default null,
    p_lp_record_label varchar default null,
    p_lp_tracklist text[] default null,
    p_lp_genre varchar default null,
    p_lp_release_date date default null,
    
    -- DVD specific attributes
    p_dvd_disc_type public.disc_type default null,
    p_dvd_director varchar default null,
    p_dvd_runtime integer default null,
    p_dvd_studio varchar default null,
    p_dvd_language varchar default null,
    p_dvd_subtitles text[] default null,
    p_dvd_release_date date default null,
    p_dvd_genre varchar default null
) 
returns integer as $$
declare
    v_media_type public.media_type;
    v_current_price decimal(10, 2);
    v_base_value decimal(10, 2);
    v_today_updates integer;
    v_today_price_updates integer;
    v_operation_details jsonb;
begin
    -- Validate user has product manager role
    if not user_has_role(p_updated_by, 'PRODUCT_MANAGER') then
        raise exception 'Unauthorized: User is not a product manager';
    end if;
    
    -- Check if product exists
    if not exists (select 1 from products where id = p_product_id) then
        raise exception 'Product with ID % does not exist', p_product_id;
    end if;
    
    -- Get current product information
    select media_type, current_price, base_value 
    into v_media_type, v_current_price, v_base_value
    from products
    where id = p_product_id;
    
    -- Check daily update limit (30 updates per day)
    select count(*) into v_today_updates
    from product_edit_history
    where changed_by = p_updated_by
      and operation_type = 'EDIT'
      and changed_at >= CURRENT_DATE
      and changed_at < CURRENT_DATE + INTERVAL '1 day';
      
    if v_today_updates >= 30 then
        raise exception 'Daily product update limit (30) reached for this user';
    end if;
    
    -- Check if price is being updated
    if p_current_price is not null and p_current_price <> v_current_price then
        -- Check daily price update limit (2 per product per day)
        select count(*) into v_today_price_updates
        from product_price_history
        where product_id = p_product_id
          and changed_by = p_updated_by
          and changed_at >= CURRENT_DATE
          and changed_at < CURRENT_DATE + INTERVAL '1 day';
          
        if v_today_price_updates >= 2 then
            raise exception 'Daily price update limit (2) reached for product %', p_product_id;
        end if;
        
        -- Get base value to check against (either current or updated)
        if p_base_value is not null then
            v_base_value := p_base_value;
        end if;
        
        -- Validate price is between 30% and 150% of base value
        if p_current_price < (v_base_value * 0.3) or p_current_price > (v_base_value * 1.5) then
            raise exception 'Product price must be between 30%% and 150%% of product value';
        end if;
    end if;
    
    -- Validate barcode uniqueness if changing it
    if p_barcode is not null and p_barcode <> (select barcode from products where id = p_product_id) then
        if exists (select 1 from products where barcode = p_barcode and id <> p_product_id) then
            raise exception 'Barcode % already exists', p_barcode;
        end if;
    end if;
    
    -- Validate weight if changing it
    if p_weight is not null and p_weight <= 0 then
        raise exception 'Product weight must be greater than zero';
    end if;
    
    -- Validate stock if changing it
    if p_stock is not null and p_stock < 0 then
        raise exception 'Product stock cannot be negative';
    end if;
    
    -- Prepare operation details for history
    v_operation_details := jsonb_build_object(
        'product_id', p_product_id,
        'media_type', v_media_type
    );
    
    -- Add changed fields to operation details
    if p_title is not null then
        v_operation_details := v_operation_details || jsonb_build_object('title', p_title);
    end if;
    
    if p_current_price is not null and p_current_price <> v_current_price then
        v_operation_details := v_operation_details || jsonb_build_object(
            'old_price', v_current_price,
            'new_price', p_current_price
        );
    end if;
    
    -- Start transaction
    begin
        -- Update base product record with non-null parameters
        update products set
            title = COALESCE(p_title, title),
            barcode = COALESCE(p_barcode, barcode),
            base_value = COALESCE(p_base_value, base_value),
            current_price = COALESCE(p_current_price, current_price),
            stock = COALESCE(p_stock, stock),
            product_description = COALESCE(p_product_description, product_description),
            dimensions = COALESCE(p_dimensions, dimensions),
            weight = COALESCE(p_weight, weight),
            updated_at = NOW()
        where id = p_product_id;
        
        -- Update media type specific attributes
        case v_media_type
            when 'BOOK' then
                -- Update book-specific attributes if any are provided
                if p_book_authors is not null or p_book_cover_type is not null or
                   p_book_publisher is not null or p_book_publication_date is not null or
                   p_book_pages is not null or p_book_language is not null or
                   p_book_genre is not null then
                    
                    update books set
                        authors = COALESCE(p_book_authors, authors),
                        cover_type = COALESCE(p_book_cover_type, cover_type),
                        publisher = COALESCE(p_book_publisher, publisher),
                        publication_date = COALESCE(p_book_publication_date, publication_date),
                        pages = COALESCE(p_book_pages, pages),
                        language = COALESCE(p_book_language, language),
                        genre = COALESCE(p_book_genre, genre)
                    where product_id = p_product_id;
                end if;
            
            when 'CD' then
                -- Update CD-specific attributes if any are provided
                if p_cd_artists is not null or p_cd_record_label is not null or
                   p_cd_tracklist is not null or p_cd_genre is not null or
                   p_cd_release_date is not null then
                    
                    update cds set
                        artists = COALESCE(p_cd_artists, artists),
                        record_label = COALESCE(p_cd_record_label, record_label),
                        tracklist = COALESCE(p_cd_tracklist, tracklist),
                        genre = COALESCE(p_cd_genre, genre),
                        release_date = COALESCE(p_cd_release_date, release_date)
                    where product_id = p_product_id;
                end if;
            
            when 'LP_RECORD' then
                -- Update LP record-specific attributes if any are provided
                if p_lp_artists is not null or p_lp_record_label is not null or
                   p_lp_tracklist is not null or p_lp_genre is not null or
                   p_lp_release_date is not null then
                    
                    update lp_records set
                        artists = COALESCE(p_lp_artists, artists),
                        record_label = COALESCE(p_lp_record_label, record_label),
                        tracklist = COALESCE(p_lp_tracklist, tracklist),
                        genre = COALESCE(p_lp_genre, genre),
                        release_date = COALESCE(p_lp_release_date, release_date)
                    where product_id = p_product_id;
                end if;
            
            when 'DVD' then
                -- Update DVD-specific attributes if any are provided
                if p_dvd_disc_type is not null or p_dvd_director is not null or
                   p_dvd_runtime is not null or p_dvd_studio is not null or
                   p_dvd_language is not null or p_dvd_subtitles is not null or
                   p_dvd_release_date is not null or p_dvd_genre is not null then
                    
                    -- Validate runtime is positive if changing it
                    if p_dvd_runtime is not null and p_dvd_runtime <= 0 then
                        raise exception 'DVD runtime must be greater than zero';
                    end if;
                    
                    update dvds set
                        disc_type = COALESCE(p_dvd_disc_type, disc_type),
                        director = COALESCE(p_dvd_director, director),
                        runtime = COALESCE(p_dvd_runtime, runtime),
                        studio = COALESCE(p_dvd_studio, studio),
                        language = COALESCE(p_dvd_language, language),
                        subtitles = COALESCE(p_dvd_subtitles, subtitles),
                        release_date = COALESCE(p_dvd_release_date, release_date),
                        genre = COALESCE(p_dvd_genre, genre)
                    where product_id = p_product_id;
                end if;
            
            else
                raise exception 'Invalid media type: %', v_media_type;
        end case;
        
        -- Record product edit history
        insert into product_edit_history (
            product_id, operation_type, changed_by, changed_at, operation_details
        ) values (
            p_product_id, 'EDIT', p_updated_by, NOW(), v_operation_details
        );
        
        -- Record price history if price changed
        if p_current_price is not null and p_current_price <> v_current_price then
            insert into product_price_history (
                product_id, old_price, new_price, changed_by, changed_at
            ) values (
                p_product_id, v_current_price, p_current_price, p_updated_by, NOW()
            );
        end if;
        
        -- Return the updated product ID
        return p_product_id;
    exception
        when others then
            raise exception 'Error updating product: %', sqlerrm;
    end;
end;
$$ language plpgsql;

-- Create a table to track daily product updates by user
create table if not exists product_update_counts (
    user_id varchar(255) not null,
    update_date date not null default current_date,
    update_count integer not null default 0,
    primary key (user_id, update_date),
    constraint fk_user_id foreign key (user_id) references users(id)
);

-- Create a table to track price updates by product per day
create table if not exists product_price_update_counts (
    product_id integer not null,
    user_id varchar(255) not null,
    update_date date not null default current_date,
    update_count integer not null default 0,
    primary key (product_id, user_id, update_date),
    constraint fk_product_id foreign key (product_id) references products(id),
    constraint fk_user_id foreign key (user_id) references users(id)
);

-- Create a function to check product update limits
create or replace function check_product_update_limits()
returns trigger as $$
declare
    v_today_updates integer;
    v_user_id varchar;
begin
    -- Extract user ID from operation_details
    v_user_id := NEW.changed_by;
    
    -- Only apply limits for EDIT operations
    if new.operation_type = 'EDIT' then
        -- Get or insert count record for today
        insert into product_update_counts (user_id, update_date, update_count)
        values (v_user_id, current_date, 1)
        on conflict (user_id, update_date)
        do update set update_count = product_update_counts.update_count + 1
        returning update_count into v_today_updates;
        
        -- Check if limit exceeded
        if v_today_updates > 30 then
            raise exception 'Daily product update limit (30) reached for this user';
        end if;
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Create a function to check price update limits
create or replace function check_price_update_limits()
returns trigger as $$
declare
    v_today_updates integer;
    v_user_id varchar;
    v_product_id integer;
begin
    -- Extract information
    v_user_id := NEW.changed_by;
    v_product_id := NEW.product_id;
    
    -- Get or insert count record for today
    insert into product_price_update_counts (product_id, user_id, update_date, update_count)
    values (v_product_id, v_user_id, current_date, 1)
    on conflict (product_id, user_id, update_date)
    do update set update_count = product_price_update_counts.update_count + 1
    returning update_count into v_today_updates;
    
    -- Check if limit exceeded
    if v_today_updates > 2 then
        raise exception 'Daily price update limit (2) reached for product %', v_product_id;
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Create a function to enforce price range limits
create or replace function enforce_price_range()
returns trigger as $$
begin
    -- Check if price is outside allowed range
    if new.current_price < (new.base_value * 0.3) or new.current_price > (new.base_value * 1.5) then
        raise exception 'Product price must be between 30%% and 150%% of product value';
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Create a trigger for product edit history count limit
create trigger trg_check_product_update_limits
after insert on product_edit_history
for each row
execute function check_product_update_limits();

-- Create a trigger for price update count limit
create trigger trg_check_price_update_limits
before insert on product_price_history
for each row
execute function check_price_update_limits();

-- Create a trigger to enforce price range limits
create trigger trg_enforce_price_range
before update or insert on products
for each row
execute function enforce_price_range();
