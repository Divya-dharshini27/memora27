-- Run this in your Supabase SQL Editor

-- 1. MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  transcript TEXT DEFAULT '',
  emotion_tag TEXT DEFAULT NULL,
  has_audio BOOLEAN DEFAULT FALSE,
  has_photos BOOLEAN DEFAULT FALSE,
  has_files BOOLEAN DEFAULT FALSE,
  audio_path TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEMORY MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.memory_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'photo' or 'file'
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_media ENABLE ROW LEVEL SECURITY;

-- Memories policies
CREATE POLICY "Users can view own memories" ON public.memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON public.memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON public.memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON public.memories
  FOR DELETE USING (auth.uid() = user_id);

-- Memory media policies
CREATE POLICY "Users can view own media" ON public.memory_media
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media" ON public.memory_media
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON public.memory_media
  FOR DELETE USING (auth.uid() = user_id);
