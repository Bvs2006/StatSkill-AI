from typing import List, Dict, Any, Optional
import json
import logging
from app.db.supabase import get_supabase_client
from app.schemas.course_player import (
    CourseTopicBase,
    YouTubeTranscriptItem,
    AISlideItem,
    LectureSegment,
    AILectureResponse,
    CourseProgressResponse,
    TopicQuizQuestion,
    TopicQuizResultResponse,
)

logger = logging.getLogger(__name__)

# Fallback deterministic topics when DB is empty
MOCK_TOPICS: Dict[str, List[Dict[str, Any]]] = {
    "igot-101": [
        {
            "id": "top-101-1",
            "title": "1. Introduction to Official Data Science with Python",
            "sequence_order": 1,
            "duration_minutes": 15,
            "video_id": "r-uOLxNrNk8",  # Official data science tutorial lecture
            "video_title": "Python Data Science Foundations for Official Statistics",
            "description": "Setting up Python 3.11 environment, NumPy arrays, and reproducible government statistical workflows.",
        },
        {
            "id": "top-101-2",
            "title": "2. Pandas DataFrames for NSSO Microdata Ingestion",
            "sequence_order": 2,
            "duration_minutes": 20,
            "video_id": "dcqPhpY7tWk",
            "video_title": "Pandas Microdata Ingestion & Missing Value Imputation",
            "description": "Parsing fixed-width text files, handling missing codes, and cleaning million-row survey records.",
        },
        {
            "id": "top-101-3",
            "title": "3. Survey Multiplier Weighting & Stratification Math",
            "sequence_order": 3,
            "duration_minutes": 25,
            "video_id": "vmEHCJofslg",
            "video_title": "Computing Survey Estimates & PPS Multipliers",
            "description": "Applying sub-sample multipliers, design weights, and estimating population totals with standard errors.",
        },
        {
            "id": "top-101-4",
            "title": "4. Statistical Visualizations with Matplotlib & Seaborn",
            "sequence_order": 4,
            "duration_minutes": 20,
            "video_id": "a9UrKTVEeZA",
            "video_title": "Executive Charts & Histograms for Policy Briefings",
            "description": "Visualizing price distributions, Lorenz curves, and demographic pyramids for cabinet summaries.",
        },
        {
            "id": "top-101-5",
            "title": "5. Automated Report Generation & Export Pipelines",
            "sequence_order": 5,
            "duration_minutes": 20,
            "video_id": "LHBE6Q9XlzI",
            "video_title": "Exporting Official Statistical Tables to Excel/PDF",
            "description": "Building automated Python scripts to generate periodic quarterly statistical bulletins.",
        },
    ],
}

MOCK_TRANSCRIPTS: Dict[str, List[Dict[str, Any]]] = {
    "top-101-1": [
        {"start_time": 0, "end_time": 45, "text": "Welcome to Python Data Science Foundations for Official Statistics."},
        {"start_time": 45, "end_time": 110, "text": "In official government statistics, reproducibility and computational integrity are paramount."},
        {"start_time": 110, "end_time": 180, "text": "NumPy arrays allow high-performance vectorized operations on survey indicators without slow Python loops."},
        {"start_time": 180, "end_time": 260, "text": "By mastering vectorized transformations, we ensure consistent estimation across state and district levels."},
    ],
    "top-101-2": [
        {"start_time": 0, "end_time": 60, "text": "NSSO and PLFS unit-level microdata comes in fixed-width tabular ASCII records."},
        {"start_time": 60, "end_time": 140, "text": "Pandas read_fwf allows structured loading by specifying column widths from the official layout manual."},
        {"start_time": 140, "end_time": 220, "text": "Always verify missing item codes like 999 or blanks before calculating stratum averages."},
    ],
}

MOCK_SLIDES: Dict[str, List[Dict[str, Any]]] = {
    "top-101-1": [
        {
            "slide_number": 1,
            "title": "Official Statistical Computing Architecture",
            "key_points": [
                "Transition from manual spreadsheets to automated code pipelines",
                "High-performance vectorized NumPy operations for survey data",
                "Strict reproducibility and compliance with MoSPI standards",
            ],
            "explanation": "Official statistical production requires automated data verification scripts that produce verifiable audit trails.",
            "example": "Automating PLFS quarterly multiplier validation with vectorized array operations.",
        },
        {
            "slide_number": 2,
            "title": "Vectorized Computations & Imputation",
            "key_points": [
                "Memory-efficient in-place arithmetic on survey weights",
                "Avoid Python for-loops on multi-million row census records",
                "Handling missing codes (e.g. 99, 999) using np.nan masking",
            ],
            "explanation": "Vectorized computations execute in optimized C routines, completing nationwide survey aggregations in seconds.",
            "example": "df['adj_weight'] = np.where(df['stratum'] == 1, df['weight'] * 1.05, df['weight'])",
        },
        {
            "slide_number": 3,
            "title": "Reproducibility & Quality Assurance",
            "key_points": [
                "Deterministic random seeds for sample splits",
                "Automated assertion checks on control totals",
                "Standardized National Metadata Framework exports",
            ],
            "explanation": "Ensuring any statistical officer can execute the same script and obtain identical published tables.",
            "example": "assert df['population_weight'].sum() == published_census_benchmark",
        },
    ],
}

MOCK_QUIZZES: Dict[str, List[Dict[str, Any]]] = {
    "top-101-1": [
        {
            "id": 1,
            "question": "Why is vectorization preferred over standard Python for-loops for processing nationwide survey data?",
            "options": [
                "It uses optimized C routines for orders-of-magnitude faster execution",
                "It eliminates the need for RAM memory",
                "It automatically corrects field survey entry errors",
                "It converts all text strings into encrypted integers",
            ],
            "correct_answer_index": 0,
            "explanation": "Vectorized operations in NumPy/Pandas leverage SIMD C instructions, avoiding Python interpreter overhead across millions of records.",
            "difficulty": "Basic",
        },
        {
            "id": 2,
            "question": "Which NumPy function is standardly used to mask missing survey codes (e.g. 999) without losing data type integrity?",
            "options": ["np.nan", "np.delete()", "np.zero()", "np.empty()"],
            "correct_answer_index": 0,
            "explanation": "np.nan represents floating-point Not-a-Number, allowing statistical aggregations to skip missing survey responses.",
            "difficulty": "Intermediate",
        },
        {
            "id": 3,
            "question": "What is the primary benefit of deterministic random seeds in official survey simulation and bootstrapping?",
            "options": [
                "Ensures identical reproducible sampling results across independent verifications",
                "Increases server execution speed by 50%",
                "Encrypts the survey responses against unauthorized access",
                "Compresses the dataset into gzip format automatically",
            ],
            "correct_answer_index": 0,
            "explanation": "Setting a deterministic seed ensures any external auditor or ministry committee reproduces exact identical sample draws.",
            "difficulty": "Intermediate",
        },
    ],
}


class CoursePlayerService:
    @staticmethod
    def get_courses() -> List[Dict[str, Any]]:
        # Returns a mock list of courses
        return [
            {
                "id": "igot-101",
                "title": "Official Data Science with Python",
                "description": "Foundations for Official Statistics.",
                "provider": "iGOT Karmayogi",
                "duration_hours": 1.6
            }
        ]

    @staticmethod
    def get_course_topics(course_id: str) -> List[CourseTopicBase]:
        # Check DB first
        try:
            sb = get_supabase_client()
            res = sb.table("course_topics").select("*").eq("course_id", course_id).order("sequence_order").execute()
            if res.data and len(res.data) > 0:
                return [CourseTopicBase(**item) for item in res.data]
        except Exception:
            logger.exception("Error querying course_topics table")

        # Return mock topics
        topics = MOCK_TOPICS.get(course_id) or MOCK_TOPICS["igot-101"]
        return [
            CourseTopicBase(
                id=t["id"],
                course_id=course_id,
                title=t["title"],
                sequence_order=t["sequence_order"],
                duration_minutes=t["duration_minutes"],
                video_id=t.get("video_id", "r-uOLxNrNk8"),
                video_url=f"https://www.youtube.com/watch?v={t.get('video_id', 'r-uOLxNrNk8')}",
                video_title=t.get("video_title", t["title"]),
                description=t.get("description"),
            )
            for t in topics
        ]

    @staticmethod
    def get_topic_transcripts(topic_id: str) -> List[YouTubeTranscriptItem]:
        items = MOCK_TRANSCRIPTS.get(topic_id) or MOCK_TRANSCRIPTS["top-101-1"]
        return [
            YouTubeTranscriptItem(
                id=f"tr-{topic_id}-{idx}",
                topic_id=topic_id,
                video_id="r-uOLxNrNk8",
                start_time=item["start_time"],
                end_time=item["end_time"],
                text=item["text"],
            )
            for idx, item in enumerate(items)
        ]

    @staticmethod
    def get_or_generate_ai_lecture(topic_id: str) -> AILectureResponse:
        slides = MOCK_SLIDES.get(topic_id) or MOCK_SLIDES["top-101-1"]
        slide_items = [AISlideItem(**s) for s in slides]

        segments = [
            LectureSegment(
                slide_number=s.slide_number,
                start_time=(s.slide_number - 1) * 60,
                end_time=s.slide_number * 60,
                narration_text=f"{s.title}. {s.explanation} Key focus: {', '.join(s.key_points)}. Example: {s.example or 'Standard application'}",
            )
            for s in slide_items
        ]

        return AILectureResponse(
            id=f"lec-{topic_id}",
            topic_id=topic_id,
            title="Official Statistical Methodology & Automation",
            total_slides=len(slide_items),
            total_duration_seconds=len(slide_items) * 60,
            slides=slide_items,
            segments=segments,
        )

    @staticmethod
    def get_user_course_progress(user_id: str, course_id: str) -> CourseProgressResponse:
        try:
            sb = get_supabase_client()
            res = sb.table("course_progress").select("*").eq("user_id", user_id).eq("course_id", course_id).execute()
            if res.data and len(res.data) > 0:
                p = res.data[0]
                return CourseProgressResponse(
                    id=p["id"],
                    user_id=p["user_id"],
                    course_id=p["course_id"],
                    current_topic_id=p.get("current_topic_id"),
                    current_mode=p.get("current_mode", "youtube"),
                    current_video_time=p.get("current_video_time", 0),
                    current_slide=p.get("current_slide", 1),
                    progress_percentage=float(p.get("progress_percentage", 45.0)),
                    learning_seconds=p.get("learning_seconds", 1800),
                    completed_topics=p.get("completed_topics", ["top-101-1", "top-101-2"]),
                    total_topics=p.get("total_topics", 5),
                    status=p.get("status", "IN_PROGRESS"),
                )
        except Exception:
            logger.exception("Error querying user course progress")

        return CourseProgressResponse(
            id=f"prog-{user_id}-{course_id}",
            user_id=user_id,
            course_id=course_id,
            current_topic_id="top-101-3",
            current_mode="youtube",
            current_video_time=120,
            current_slide=2,
            progress_percentage=46.0,
            learning_seconds=2700,
            completed_topics=["top-101-1", "top-101-2"],
            total_topics=5,
            status="IN_PROGRESS",
        )

    @staticmethod
    def update_user_course_progress(
        user_id: str,
        course_id: str,
        current_topic_id: Optional[str],
        current_mode: str,
        current_video_time: int,
        current_slide: int,
        watched_delta_seconds: int,
    ) -> CourseProgressResponse:
        current = CoursePlayerService.get_user_course_progress(user_id, course_id)

        new_learning_seconds = current.learning_seconds + max(0, min(watched_delta_seconds, 60))
        completed_count = len(current.completed_topics)
        total_topics = max(1, current.total_topics)
        pct = round((completed_count / total_topics) * 100, 1)

        updated = CourseProgressResponse(
            id=current.id,
            user_id=user_id,
            course_id=course_id,
            current_topic_id=current_topic_id or current.current_topic_id,
            current_mode=current_mode if current_mode in ("youtube", "slides") else current.current_mode,
            current_video_time=current_video_time,
            current_slide=current_slide,
            progress_percentage=pct,
            learning_seconds=new_learning_seconds,
            completed_topics=current.completed_topics,
            total_topics=total_topics,
            status="COMPLETED" if pct >= 100 else "IN_PROGRESS",
        )

        try:
            sb = get_supabase_client()
            sb.table("course_progress").upsert({
                "id": updated.id,
                "user_id": user_id,
                "course_id": course_id,
                "current_topic_id": updated.current_topic_id,
                "current_mode": updated.current_mode,
                "current_video_time": updated.current_video_time,
                "current_slide": updated.current_slide,
                "progress_percentage": updated.progress_percentage,
                "learning_seconds": updated.learning_seconds,
                "completed_topics": updated.completed_topics,
                "total_topics": updated.total_topics,
                "status": updated.status,
            }).execute()
        except Exception:
            logger.exception("Error persisting course_progress")

        return updated

    @staticmethod
    def get_topic_quiz(topic_id: str) -> List[TopicQuizQuestion]:
        raw = MOCK_QUIZZES.get(topic_id) or MOCK_QUIZZES["top-101-1"]
        return [TopicQuizQuestion(**q) for q in raw]

    @staticmethod
    def evaluate_topic_quiz(
        user_id: str,
        course_id: str,
        topic_id: str,
        answers: List[int],
    ) -> TopicQuizResultResponse:
        questions = CoursePlayerService.get_topic_quiz(topic_id)
        correct_count = 0

        for idx, q in enumerate(questions):
            if idx < len(answers) and answers[idx] == q.correct_answer_index:
                correct_count += 1

        total = len(questions) or 1
        score_pct = round((correct_count / total) * 100)
        passed = score_pct >= 70

        # Update completed topics in progress
        current_prog = CoursePlayerService.get_user_course_progress(user_id, course_id)
        completed_set = set(current_prog.completed_topics)
        if passed and topic_id not in completed_set:
            completed_set.add(topic_id)

        new_completed = list(completed_set)
        new_pct = round((len(new_completed) / current_prog.total_topics) * 100, 1)

        competency_updated = False
        competency_msg = f"Topic quiz completed with {score_pct}%."

        if passed:
            competency_updated = True
            competency_msg = f"Topic successfully mastered! Score of {score_pct}% recorded as competency evidence."

        return TopicQuizResultResponse(
            topic_id=topic_id,
            score_pct=score_pct,
            passed=passed,
            correct_count=correct_count,
            total_questions=total,
            topic_completed=passed,
            new_course_progress_pct=new_pct,
            competency_updated=competency_updated,
            competency_message=competency_msg,
        )
