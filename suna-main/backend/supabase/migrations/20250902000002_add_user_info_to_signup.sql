-- Add user_info table creation to the user signup trigger
create or replace function basejump.run_new_user_setup()
    returns trigger
    language plpgsql
    security definer
    set search_path = public
as
$$
declare
    first_account_id    uuid;
    generated_user_name text;
    user_display_name   text;
    user_department     text;
    user_password_start text;
    dept_id            integer;
begin

    -- Extract name, department, and password from user metadata
    user_display_name := new.raw_user_meta_data->>'name';
    user_department := new.raw_user_meta_data->>'dept_name';
    user_password_start := new.raw_user_meta_data->>'password_start';

    -- Set fallback name from email if no name provided
    if new.email IS NOT NULL then
        generated_user_name := split_part(new.email, '@', 1);
    end if;

    -- Use provided name if available, otherwise use generated name
    if user_display_name IS NOT NULL AND user_display_name != '' then
        generated_user_name := user_display_name;
    end if;

    -- Get department_id from department name
    if user_department IS NOT NULL AND user_department != '' then
        select id into dept_id from public.departments where name = user_department;
    end if;
    
    -- create the new users's personal account with proper data
    insert into basejump.accounts (name, display_name, department_id, primary_owner_user_id, personal_account, id)
    values (generated_user_name, user_display_name, dept_id, NEW.id, true, NEW.id)
    returning id into first_account_id;

    -- add them to the account_user table so they can act on it
    insert into basejump.account_user (account_id, user_id, account_role)
    values (first_account_id, NEW.id, 'owner');

    -- INSERT INTO user_info table with password_start
    insert into public.user_info (id, email, name, department_id, department_name, password_start, is_admin)
    values (
        NEW.id, 
        NEW.email, 
        COALESCE(user_display_name, generated_user_name), 
        dept_id, 
        user_department,
        user_password_start,
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        department_id = EXCLUDED.department_id,
        department_name = EXCLUDED.department_name,
        password_start = EXCLUDED.password_start,
        updated_at = now();

    return NEW;
end;
$$;