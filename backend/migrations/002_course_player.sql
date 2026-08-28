-- ====================================================================
-- STATSKILL AI — COURSE PLAYER & PROGRESS MIGRATION
-- ====================================================================

-- 1. Course Topics
CREATE TABLE IF NOT EXISTS course_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sequence_order INT NOT NULL DEFAULT 1,
    duration_minutes INT NOT NULL DEFAULT 15,
    video_id VARCHAR(100),
    video_url TEXT,
    video_title VARCHAR(255),
    competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, sequence_order)
);

-- 2. YouTube Transcripts (Authorized Timestamps)
CREATE TABLE IF NOT EXISTS youtube_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
    video_id VARCHAR(100) NOT NULL,
    start_time INT NOT NULL DEFAULT 0,
    end_time INT NOT NULL DEFAULT 60,
    text TEXT NOT NULL,
    source VARCHAR(100) DEFAULT 'iGOT Karmayogi Authorized Stream',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AI Generated Lectures & Slide Decks
CREATE TABLE IF NOT EXISTS ai_lectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    total_slides INT NOT NULL DEFAULT 5,
    total_duration_seconds INT NOT NULL DEFAULT 300,
    slides JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Lecture Narration Segments
CREATE TABLE IF NOT EXISTS lecture_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecture_id UUID NOT NULL REFERENCES ai_lectures(id) ON DELETE CASCADE,
    slide_number INT NOT NULL,
    start_time INT NOT NULL,
    end_time INT NOT NULL,
    narration_text TEXT NOT NULL,
    audio_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Unified Course Progress (Dual Mode Synchronized)
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    current_topic_id UUID REFERENCES course_topics(id) ON DELETE SET NULL,
    current_mode VARCHAR(20) NOT NULL DEFAULT 'youtube' CHECK (current_mode IN ('youtube', 'slides')),
    current_video_time INT NOT NULL DEFAULT 0,
    current_slide INT NOT NULL DEFAULT 1,
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    learning_seconds INT NOT NULL DEFAULT 0,
    completed_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_topics INT NOT NULL DEFAULT 5,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (user_id, course_id)
);

-- 6. Learning History Events Audit
CREATE TABLE IF NOT EXISTS learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES course_topics(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Topic Quizzes
CREATE TABLE IF NOT EXISTS topic_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL,
    passing_score_pct INT NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_topics_course ON course_topics(course_id);
CREATE INDEX IF NOT EXISTS idx_youtube_transcripts_topic ON youtube_transcripts(topic_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_course ON course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user ON learning_events(user_id);
