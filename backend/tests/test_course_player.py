import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


def test_get_course_topics():
    res = client.get("/api/courses/igot-101/topics")
    assert res.status_code == 200
    topics = res.json()
    assert len(topics) >= 5
    assert "Python" in topics[0]["title"]
    assert topics[0]["sequence_order"] == 1


def test_get_topic_transcripts():
    res = client.get("/api/topics/top-101-1/transcript")
    assert res.status_code == 200
    transcripts = res.json()
    assert len(transcripts) > 0
    assert "start_time" in transcripts[0]
    assert "text" in transcripts[0]


def test_generate_ai_lecture():
    res = client.post("/api/topics/top-101-1/generate-lecture")
    assert res.status_code == 200
    data = res.json()
    assert data["total_slides"] >= 3
    assert len(data["slides"]) == data["total_slides"]
    assert len(data["segments"]) == data["total_slides"]


def test_course_progress_cycle():
    # 1. Get Progress
    res = client.get("/api/learning/igot-101/progress")
    assert res.status_code == 200
    prog = res.json()
    assert "progress_percentage" in prog
    assert "completed_topics" in prog

    # 2. Update Progress
    res_update = client.put(
        "/api/learning/igot-101/progress",
        json={
            "current_topic_id": "top-101-2",
            "current_mode": "slides",
            "current_video_time": 180,
            "current_slide": 2,
            "watched_delta_seconds": 15,
        },
    )
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["current_mode"] == "slides"
    assert updated["current_slide"] == 2


def test_topic_quiz_flow():
    # 1. Fetch Quiz
    res_q = client.get("/api/topics/top-101-1/quiz")
    assert res_q.status_code == 200
    quiz = res_q.json()
    assert len(quiz) == 3

    # 2. Submit Answers
    res_sub = client.post(
        "/api/topics/top-101-1/quiz/submit?course_id=igot-101",
        json={"answers": [0, 0, 0]},  # all correct answers
    )
    assert res_sub.status_code == 200
    result = res_sub.json()
    assert result["score_pct"] == 100
    assert result["passed"] is True
    assert result["topic_completed"] is True
    assert result["competency_updated"] is True
