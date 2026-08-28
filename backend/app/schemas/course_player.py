from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class CourseTopicBase(BaseModel):
    id: str
    course_id: str
    title: str
    sequence_order: int
    duration_minutes: int = 15
    video_id: Optional[str] = "dQw4w9WgXcQ"
    video_url: Optional[str] = None
    video_title: Optional[str] = None
    competency_id: Optional[str] = None
    description: Optional[str] = None


class YouTubeTranscriptItem(BaseModel):
    id: str
    topic_id: str
    video_id: str
    start_time: int
    end_time: int
    text: str
    source: str = "iGOT Karmayogi Official Stream"


class AISlideItem(BaseModel):
    slide_number: int
    title: str
    key_points: List[str]
    explanation: str
    example: Optional[str] = None
    source_chunk_ids: Optional[List[str]] = None


class LectureSegment(BaseModel):
    slide_number: int
    start_time: int
    end_time: int
    narration_text: str
    audio_path: Optional[str] = None


class AILectureResponse(BaseModel):
    id: str
    topic_id: str
    title: str
    total_slides: int
    total_duration_seconds: int
    slides: List[AISlideItem]
    segments: Optional[List[LectureSegment]] = None


class CourseProgressUpdate(BaseModel):
    current_topic_id: Optional[str] = None
    current_mode: Literal["youtube", "slides"] = "youtube"
    current_video_time: int = 0
    current_slide: int = 1
    watched_delta_seconds: int = 0


class CourseProgressResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    current_topic_id: Optional[str] = None
    current_mode: Literal["youtube", "slides"] = "youtube"
    current_video_time: int = 0
    current_slide: int = 1
    progress_percentage: float
    learning_seconds: int
    completed_topics: List[str]
    total_topics: int
    status: Literal["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]
    last_accessed_at: Optional[datetime] = None


class TopicQuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str
    difficulty: str = "Intermediate"


class TopicQuizSubmitRequest(BaseModel):
    answers: List[int]  # Selected option indices


class TopicQuizResultResponse(BaseModel):
    topic_id: str
    score_pct: int
    passed: bool = Field(default=False)
    correct_count: int
    total_questions: int
    topic_completed: bool
    new_course_progress_pct: float
    competency_updated: bool
    competency_message: str
