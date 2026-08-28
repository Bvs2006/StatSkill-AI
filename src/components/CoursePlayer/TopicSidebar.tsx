import React from "react";

export interface TopicItem {
  id: string;
  title: string;
  sequence_order: number;
  duration_minutes: number;
  description?: string;
}

interface TopicSidebarProps {
  topics: TopicItem[];
  currentTopicId: string;
  completedTopicIds: string[];
  onSelectTopic: (topicId: string) => void;
  overallProgressPct: number;
}

export function TopicSidebar({
  topics,
  currentTopicId,
  completedTopicIds,
  onSelectTopic,
  overallProgressPct,
}: TopicSidebarProps) {
  return (
    <aside className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">Course Modules</h3>
            <p className="text-[10px] text-gray-400">
              {completedTopicIds.length} of {topics.length} Topics Mastered
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {overallProgressPct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden my-3">
          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${overallProgressPct}%` }} />
        </div>

        {/* Topic List */}
        <div className="space-y-1.5 pt-1">
          {topics.map((t) => {
            const isCompleted = completedTopicIds.includes(t.id);
            const isCurrent = t.id === currentTopicId;

            return (
              <button
                key={t.id}
                onClick={() => onSelectTopic(t.id)}
                className={`w-full p-3 rounded-2xl text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                  isCurrent
                    ? "bg-blue-50/80 border border-blue-200 text-[#0B3D66] font-bold shadow-2xs"
                    : isCompleted
                    ? "bg-emerald-50/40 text-gray-700 hover:bg-gray-50"
                    : "bg-gray-50/60 text-gray-500 hover:bg-gray-100/80"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-[#0B3D66] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {isCompleted ? "✓" : t.sequence_order}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] leading-tight">{t.title}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5 font-mono">{t.duration_minutes} mins</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-[10px] text-amber-900 space-y-0.5">
        <div className="font-bold">Topic Completion Rule:</div>
        <div>Watch lecture + pass 3-question MCQ knowledge check.</div>
      </div>
    </aside>
  );
}
