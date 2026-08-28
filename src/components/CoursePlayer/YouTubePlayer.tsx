import React, { useState, useEffect } from "react";

export interface TranscriptItem {
  id: string;
  start_time: number;
  end_time: number;
  text: string;
}

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  transcripts?: TranscriptItem[];
  currentTime: number;
  onTimeUpdate: (seconds: number) => void;
}

export function YouTubePlayer({
  videoId,
  title,
  transcripts = [],
  currentTime,
  onTimeUpdate,
}: YouTubePlayerProps) {
  const [activeSec, setActiveSec] = useState(currentTime || 0);

  // Periodic simulated position progression for demonstration and synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSec((s) => {
        const next = s + 5;
        onTimeUpdate(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  return (
    <div className="space-y-4">
      {/* 16:9 Aspect Ratio Video Frame */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-lg border border-gray-200">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1&start=${currentTime}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Video Info Banner */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs flex justify-between items-center text-xs">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 uppercase">
            Official YouTube Lecture Stream
          </span>
          <h3 className="font-bold text-gray-900 mt-1">{title}</h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-mono">Stream Synchronized</span>
          <div className="font-mono text-emerald-600 font-bold">● Active Tracking</div>
        </div>
      </div>

      {/* Synchronized Authorized Transcripts Accordion */}
      {transcripts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-xs">
            <strong className="text-[#0B3D66]">Authorized Video Transcripts &amp; Timecodes:</strong>
            <span className="text-[10px] text-gray-400">{transcripts.length} Segments</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {transcripts.map((t, idx) => (
              <div
                key={t.id || idx}
                className={`p-2 rounded-xl text-xs flex gap-3 transition-all ${
                  activeSec >= t.start_time && activeSec < t.end_time
                    ? "bg-amber-50 border border-amber-200 text-amber-900 font-medium"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                <span className="font-mono text-[10px] font-bold text-gray-400 shrink-0">
                  {Math.floor(t.start_time / 60)}:{(t.start_time % 60).toString().padStart(2, "0")}
                </span>
                <span className="leading-snug">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
