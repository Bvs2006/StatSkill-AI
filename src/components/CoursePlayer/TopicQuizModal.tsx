import React, { useState } from "react";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface TopicQuizModalProps {
  isOpen: boolean;
  topicTitle: string;
  questions: QuizQuestion[];
  onClose: () => void;
  onSubmit: (answers: number[]) => void;
}

export function TopicQuizModal({
  isOpen,
  topicTitle,
  questions,
  onClose,
  onSubmit,
}: TopicQuizModalProps) {
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleSelect(qIdx: number, optIdx: number) {
    if (submitted) return;
    const copy = [...answers];
    copy[qIdx] = optIdx;
    setAnswers(copy);
  }

  const correctCount = questions.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correct_answer_index ? 1 : 0),
    0
  );
  const scorePct = Math.round((correctCount / (questions.length || 1)) * 100);
  const passed = scorePct >= 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#FF7A00] px-2 py-0.5 rounded">
              Topic Knowledge Check
            </span>
            <h2 className="text-base font-bold text-[#0B3D66] mt-1">{topicTitle}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs">
            ✕
          </button>
        </div>

        {/* Questions list */}
        <div className="space-y-5">
          {questions.map((q, qIdx) => (
            <div key={q.id || qIdx} className="space-y-2.5 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <div className="font-bold text-gray-900 leading-snug">
                Q{qIdx + 1}: {q.question}
              </div>

              <div className="space-y-1.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[qIdx] === oIdx;
                  const isCorrect = q.correct_answer_index === oIdx;

                  let style = "bg-white border-gray-200 text-gray-700 hover:border-gray-300";
                  if (submitted) {
                    if (isCorrect) style = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold";
                    else if (isSelected && !isCorrect) style = "bg-rose-50 border-rose-300 text-rose-900";
                  } else if (isSelected) {
                    style = "bg-blue-50 border-[#0B3D66] text-[#0B3D66] font-bold";
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${style}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="p-2.5 bg-blue-50/80 rounded-xl text-[11px] text-[#0B3D66] leading-relaxed">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Evaluation Summary & Submit */}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          {submitted ? (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                Score: {scorePct}% ({correctCount}/{questions.length} Correct) {passed ? "— Topic Mastered! ✓" : "— Review & Retake"}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400">
              Answer all {questions.length} questions to complete topic
            </span>
          )}

          {submitted ? (
            <button
              onClick={() => {
                onSubmit(answers);
                onClose();
              }}
              className="px-5 py-2.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] shadow-md"
            >
              Continue to Next Topic →
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              disabled={answers.includes(-1)}
              className="px-5 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] shadow-md disabled:opacity-40"
            >
              Submit Topic Quiz →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
