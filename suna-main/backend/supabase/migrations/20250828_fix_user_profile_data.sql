-- Fix user setup to properly save name and department from signup
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
begin

    -- Extract name and department from user metadata
    user_display_name := new.raw_user_meta_data->>'name';
    user_department := new.raw_user_meta_data->>'dept_name';

    -- Set fallback name from email if no name provided
    if new.email IS NOT NULL then
        generated_user_name := split_part(new.email, '@', 1);
    end if;

    -- Use provided name if available, otherwise use generated name
    if user_display_name IS NOT NULL AND user_display_name != '' then
        generated_user_name := user_display_name;
    end if;

    -- Get department_id from department name
    declare
        dept_id integer;
    begin
        if user_department IS NOT NULL AND user_department != '' then
            select id into dept_id from public.departments where name = user_department;
        end if;
        
        -- create the new users's personal account with proper data
        insert into basejump.accounts (name, display_name, department_id, primary_owner_user_id, personal_account, id)
        values (generated_user_name, user_display_name, dept_id, NEW.id, true, NEW.id)
        returning id into first_account_id;
    end;

    -- add them to the account_user table so they can act on it
    insert into basejump.account_user (account_id, user_id, account_role)
    values (first_account_id, NEW.id, 'owner');

    return NEW;
end;
$$;