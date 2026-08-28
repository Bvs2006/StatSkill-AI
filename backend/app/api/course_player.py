from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.schemas.user import AuthenticatedUser
from app.schemas.course_player import (
    CourseTopicBase,
    YouTubeTranscriptItem,
    AILectureResponse,
    CourseProgressResponse,
    CourseProgressUpdate,
    TopicQuizQuestion,
    TopicQuizSubmitRequest,
    TopicQuizResultResponse,
)
from app.services.course_player_service import CoursePlayerService

router = APIRouter(prefix="", tags=["Course Learning Player & AI Lectures"])


@router.get("/courses/{course_id}/topics", response_model=List[CourseTopicBase], summary="Get Course Topics")
async def get_course_topics(
    course_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns ordered topics/modules for the specified course.
    """
    return CoursePlayerService.get_course_topics(course_id)


@router.get("/topics/{topic_id}/transcript", response_model=List[YouTubeTranscriptItem], summary="Get Authorized Video Transcript")
async def get_topic_transcript(
    topic_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns timestamped authorized transcript items for the topic's lecture video.
    """
    return CoursePlayerService.get_topic_transcripts(topic_id)


@router.post("/topics/{topic_id}/generate-lecture", response_model=AILectureResponse, summary="Generate AI Slide Deck & Narration")
async def generate_ai_lecture(
    topic_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Generates grounded AI slide deck and timeline-segmented narration script.
    """
    return CoursePlayerService.get_or_generate_ai_lecture(topic_id)


@router.get("/learning/{course_id}/progress", response_model=CourseProgressResponse, summary="Get Course Progress")
async def get_course_progress(
    course_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns the user's unified progress across YouTube Lecture and AI Slides modes.
    """
    return CoursePlayerService.get_user_course_progress(current_user.id, course_id)


@router.put("/learning/{course_id}/progress", response_model=CourseProgressResponse, summary="Update Course Progress")
async def update_course_progress(
    course_id: str,
    body: CourseProgressUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Updates active video time, slide position, and accumulated learning seconds.
    """
    return CoursePlayerService.update_user_course_progress(
        user_id=current_user.id,
        course_id=course_id,
        current_topic_id=body.current_topic_id,
        current_mode=body.current_mode,
        current_video_time=body.current_video_time,
        current_slide=body.current_slide,
        watched_delta_seconds=body.watched_delta_seconds,
    )


@router.get("/topics/{topic_id}/quiz", response_model=List[TopicQuizQuestion], summary="Get Topic Quiz")
async def get_topic_quiz(
    topic_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns 3-5 grounded MCQs for the specified topic.
    """
    return CoursePlayerService.get_topic_quiz(topic_id)


@router.post("/topics/{topic_id}/quiz/submit", response_model=TopicQuizResultResponse, summary="Submit Topic Quiz")
async def submit_topic_quiz(
    topic_id: str,
    course_id: str,
    body: TopicQuizSubmitRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Evaluates topic quiz answers, updates completion status, and triggers closed-loop competency update.
    """
    return CoursePlayerService.evaluate_topic_quiz(
        user_id=current_user.id,
        course_id=course_id,
        topic_id=topic_id,
        answers=body.answers,
    )
