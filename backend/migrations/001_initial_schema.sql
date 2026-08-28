-- ====================================================================
-- STATSKILL AI — INITIAL DATABASE SCHEMA MIGRATION (PostgreSQL + pgvector)
-- ====================================================================

-- 1. Enable pgvector extension for AI semantic search & RAG
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    ministry VARCHAR(255) NOT NULL DEFAULT 'Ministry of Statistics & Programme Implementation (MoSPI)',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Job Roles
CREATE TABLE IF NOT EXISTS job_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    cadre VARCHAR(100) NOT NULL DEFAULT 'Indian Statistical Service',
    cadre_grade VARCHAR(50) NOT NULL DEFAULT 'STS',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Profiles (Extends Supabase auth.users or standalone)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'trainer', 'admin')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    job_role_id UUID REFERENCES job_roles(id) ON DELETE SET NULL,
    cadre VARCHAR(100) DEFAULT 'Indian Statistical Service',
    cadre_grade VARCHAR(50) DEFAULT 'STS',
    posting VARCHAR(255) DEFAULT 'New Delhi',
    current_assignment TEXT,
    educational_qualification TEXT,
    years_of_experience NUMERIC(4,1) DEFAULT 5.0,
    preferred_learning_mode VARCHAR(100) DEFAULT 'Blended Academy',
    preferred_language VARCHAR(10) DEFAULT 'EN' CHECK (preferred_language IN ('EN', 'HI', 'TE')),
    learning_hours NUMERIC(6,1) DEFAULT 0.0,
    courses_completed INT DEFAULT 0,
    certifications_count INT DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Competency Categories
CREATE TABLE IF NOT EXISTS competency_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE CHECK (name IN ('Statistical', 'Technical', 'Digital Governance', 'Behavioural')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Competencies Catalogue
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES competency_categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL UNIQUE,
    domain VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    max_level INT NOT NULL DEFAULT 5,
    department_priority INT NOT NULL DEFAULT 4 CHECK (department_priority BETWEEN 1 AND 5),
    future_demand_score INT NOT NULL DEFAULT 4 CHECK (future_demand_score BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Job Role Required Competencies
CREATE TABLE IF NOT EXISTS job_role_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    required_level INT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_role_id, competency_id)
);

-- 8. User Competencies (Current Scores)
CREATE TABLE IF NOT EXISTS user_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    current_level INT NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
    required_level INT NOT NULL DEFAULT 3 CHECK (required_level BETWEEN 1 AND 5),
    confidence_score NUMERIC(4,3) DEFAULT 0.85,
    evidence_source TEXT DEFAULT 'Baseline Assessment',
    last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, competency_id)
);

-- 9. Competency History (Audit Trail of Level Elevations)
CREATE TABLE IF NOT EXISTS competency_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    old_level INT NOT NULL,
    new_level INT NOT NULL,
    score NUMERIC(5,2),
    source VARCHAR(100) NOT NULL DEFAULT 'assessment',
    evidence TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Skill Gaps (Materialized view or calculated table)
CREATE TABLE IF NOT EXISTS skill_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    current_level INT NOT NULL,
    required_level INT NOT NULL,
    gap INT NOT NULL,
    priority_score NUMERIC(5,2) NOT NULL,
    priority_level VARCHAR(20) NOT NULL CHECK (priority_level IN ('High', 'Medium', 'Low', 'None')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, competency_id)
);

-- 11. Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100),
    total_questions INT NOT NULL DEFAULT 10,
    duration_minutes INT NOT NULL DEFAULT 15,
    score_percentage NUMERIC(5,2),
    passed BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 12. Assessment Questions
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer_index INT NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Assessment Answers
CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    selected_option_index INT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    provider VARCHAR(100) NOT NULL DEFAULT 'iGOT',
    source VARCHAR(50) NOT NULL DEFAULT 'igot' CHECK (source IN ('igot', 'nssta', 'internal')),
    category VARCHAR(100) NOT NULL DEFAULT 'Technical',
    level VARCHAR(50) NOT NULL DEFAULT 'Intermediate',
    duration VARCHAR(100) DEFAULT '20 hours',
    duration_hours NUMERIC(5,1) DEFAULT 20.0,
    rating NUMERIC(3,2) DEFAULT 4.8,
    reviews_count INT DEFAULT 250,
    enrolled_count INT DEFAULT 1500,
    language VARCHAR(100) DEFAULT 'English / Hindi',
    url TEXT,
    learning_outcomes JSONB,
    syllabus_modules JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Course Competencies Mapping
CREATE TABLE IF NOT EXISTS course_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    target_level INT NOT NULL DEFAULT 3,
    weight NUMERIC(4,2) DEFAULT 1.0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, competency_id)
);

-- 16. NSSTA Training Programmes
CREATE TABLE IF NOT EXISTS training_programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programme_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    duration VARCHAR(100) NOT NULL DEFAULT '5 Days (35 Hours)',
    duration_hours NUMERIC(5,1) DEFAULT 35.0,
    delivery_mode VARCHAR(150) NOT NULL DEFAULT 'Residential at NSSTA Greater Noida',
    eligibility TEXT NOT NULL,
    schedule VARCHAR(150) NOT NULL,
    priority VARCHAR(50) DEFAULT 'High',
    registration_url TEXT,
    seat_capacity INT DEFAULT 35,
    enrolled_count INT DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Training Programme Competencies Mapping
CREATE TABLE IF NOT EXISTS training_programme_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programme_id UUID NOT NULL REFERENCES training_programmes(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (programme_id, competency_id)
);

-- 18. Learning Progress
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage NUMERIC(5,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    learning_hours NUMERIC(5,1) DEFAULT 0.0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- 19. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    programme_id UUID REFERENCES training_programmes(id) ON DELETE CASCADE,
    recommendation_score NUMERIC(5,2) NOT NULL,
    match_percentage INT NOT NULL,
    addressed_competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    why_recommended TEXT NOT NULL,
    priority_level VARCHAR(20) DEFAULT 'High',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Documents (Uploaded Materials)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('PDF', 'DOCX', 'PPTX', 'TXT', 'CSV')),
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    page_count INT DEFAULT 1,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    domain VARCHAR(100) DEFAULT 'Statistical',
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Document Chunks (with pgvector embeddings)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    page_number INT DEFAULT 1,
    embedding vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Quizzes Catalogue & Bank
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(100) DEFAULT 'Statistical',
    competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    questions_count INT NOT NULL DEFAULT 10,
    duration_minutes INT NOT NULL DEFAULT 15,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer_index INT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    topic VARCHAR(255),
    source_reference TEXT,
    source_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    is_validated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. Quiz Attempts & Evaluation
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score_percentage NUMERIC(5,2) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    time_spent_seconds INT DEFAULT 0,
    competency_breakdown JSONB,
    weak_topics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. Quiz Answers
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_index INT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. AI Assistant Conversations & Messages
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Statistical Guidance Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'recommendation',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_user_competencies_user ON user_competencies(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user ON skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON document_chunks(document_id);

-- ====================================================================
-- PGVECTOR MATCHING FUNCTION (RPC)
-- ====================================================================
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(384),
    target_document_id UUID DEFAULT NULL,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    content TEXT,
    page_number INT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id AS chunk_id,
        dc.document_id,
        dc.content,
        dc.page_number,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE (target_document_id IS NULL OR dc.document_id = target_document_id)
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
