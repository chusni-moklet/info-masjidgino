    -- Database Schema for Digital Signage TV Masjid
    -- Location: supabase/schema.sql

    -- 1. Create Tables
    CREATE TABLE IF NOT EXISTS public.settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mosque_name VARCHAR(255) NOT NULL DEFAULT 'Masjid Gino Sugiono',
        location VARCHAR(255) NOT NULL DEFAULT 'Perumahan Skyland 2',
        hijri_date_offset INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );

    CREATE TABLE IF NOT EXISTS public.slider_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT NOT NULL,
        order_index INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );

    CREATE TABLE IF NOT EXISTS public.announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );

    CREATE TABLE IF NOT EXISTS public.quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quote_text TEXT NOT NULL,
        author VARCHAR(255) NOT NULL DEFAULT 'Anonim',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );

    -- 2. Enable Row Level Security (RLS)
    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

    -- 3. Create RLS Policies
    -- Public read policies (anyone can read)
    CREATE POLICY "Allow public select on settings" 
        ON public.settings FOR SELECT USING (true);

    CREATE POLICY "Allow public select on slider_images" 
        ON public.slider_images FOR SELECT USING (true);

    CREATE POLICY "Allow public select on announcements" 
        ON public.announcements FOR SELECT USING (true);

    CREATE POLICY "Allow public select on quotes" 
        ON public.quotes FOR SELECT USING (true);

    -- Authenticated write policies (admin can modify)
    CREATE POLICY "Allow admin all on settings" 
        ON public.settings FOR ALL TO authenticated 
        USING (true) WITH CHECK (true);

    CREATE POLICY "Allow admin all on slider_images" 
        ON public.slider_images FOR ALL TO authenticated 
        USING (true) WITH CHECK (true);

    CREATE POLICY "Allow admin all on announcements" 
        ON public.announcements FOR ALL TO authenticated 
        USING (true) WITH CHECK (true);

    CREATE POLICY "Allow admin all on quotes" 
        ON public.quotes FOR ALL TO authenticated 
        USING (true) WITH CHECK (true);

    -- 4. Enable Realtime Replication
    -- Add tables to the supabase_realtime publication to enable realtime updates
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.slider_images;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;

    -- 5. Create Storage Bucket & Policies for Slider Images
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('sliders', 'sliders', true)
    ON CONFLICT (id) DO NOTHING;

    -- Allow anyone to view images in the sliders bucket
    CREATE POLICY "Allow public read sliders"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'sliders');

    -- Allow authenticated admin users to perform all operations
    CREATE POLICY "Allow admin manage sliders"
        ON storage.objects FOR ALL
        TO authenticated
        USING (bucket_id = 'sliders')
        WITH CHECK (bucket_id = 'sliders');

    -- 6. Seed Initial Data
    INSERT INTO public.settings (mosque_name, location, hijri_date_offset)
    VALUES ('Masjid Gino Sugiono', 'Perumahan Skyland 2', 0)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.announcements (content, is_active) VALUES
    ('Selamat Datang di Masjid Gino Sugiono. Mohon menonaktifkan suara handphone selama ibadah berlangsung.', true),
    ('Kajian Rutin Tafsir Al-Quran dilaksanakan setiap hari Ahad ba''da Subuh bersama Ustadz Haji Sugiono.', true),
    ('Mari salurkan infak terbaik Anda untuk pembangunan fasilitas wudhu dan sanitasi masjid.', true);

    INSERT INTO public.quotes (quote_text, author, is_active) VALUES
    ('Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.', 'QS. Al-Ankabut: 45', true),
    ('Hiasilah Al-Quran dengan suaramu yang merdu.', 'HR. Abu Dawud', true),
    ('Barang siapa yang membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga.', 'HR. Bukhari & Muslim', true);

    INSERT INTO public.slider_images (image_url, order_index, is_active) VALUES
    ('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200', 1, true),
    ('https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200', 2, true),
    ('https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&q=80&w=1200', 3, true);

    -- 6. Instructions for Admin User Seeding in Supabase Auth
    --
    -- Since inserting directly into auth.users requires password encryption using bcrypt,
    -- it is highly recommended to create the admin user via the Supabase Dashboard:
    -- 1. Go to Authentication -> Users.
    -- 2. Click "Add User" -> "Create User".
    -- 3. Enter Email: masjidgino2026@admin.com
    -- 4. Enter Password: hidupkanmasjid
    -- 5. Uncheck "Send email confirmation" (to automatically confirm user).
    -- 6. Click "Create User".
    --
    -- Alternative SQL Seed Script for self-hosted / local supabase instances (run as superuser):
    -- 
    -- CREATE EXTENSION IF NOT EXISTS pgcrypto;
    -- INSERT INTO auth.users (
    --     instance_id,
    --     id,
    --     aud,
    --     role,
    --     email,
    --     encrypted_password,
    --     email_confirmed_at,
    --     recovery_sent_at,
    --     last_sign_in_at,
    --     raw_app_meta_data,
    --     raw_user_meta_data,
    --     created_at,
    --     updated_at,
    --     confirmation_token,
    --     email_change,
    --     email_change_token_new,
    --     recovery_token
    -- ) VALUES (
    --     '00000000-0000-0000-0000-000000000000',
    --     gen_random_uuid(),
    --     'authenticated',
    --     'authenticated',
    --     'masjidgino2026@admin.com',
    --     crypt('hidupkanmasjid', gen_salt('bf', 10)),
    --     now(),
    --     NULL,
    --     NULL,
    --     '{"provider":"email","providers":["email"]}',
    --     '{}',
    --     now(),
    --     now(),
    --     '',
    --     '',
    --     '',
    --     ''
    -- ) ON CONFLICT DO NOTHING;
