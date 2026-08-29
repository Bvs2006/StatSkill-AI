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

// Fallback high-reliability educational video IDs for statistical topics
const DEFAULT_EDUCATIONAL_VIDEO_MAP: Record<string, string> = {
  python: "eWRfhZUzrAc",
  statistics: "d8uTB5XorBw",
  sampling: "_V8eKsto3Ug",
  sql: "HXV3zeRR3h4",
  machine_learning: "i_LwzRVP7bg",
  qgis: "kE628xce3A0",
  privacy: "2X_2IdaD3xQ",
  default: "d8uTB5XorBw",
};

export function YouTubePlayer({
  videoId,
  title,
  transcripts = [],
  currentTime,
  onTimeUpdate,
}: YouTubePlayerProps) {
  const [activeSec, setActiveSec] = useState(currentTime || 0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playerMode, setPlayerMode] = useState<"embed" | "lecture_stream">("embed");
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [embedError, setEmbedError] = useState(false);

  // Clean and resolve video ID
  const cleanId =
    videoId && videoId.trim().length > 3
      ? videoId.trim()
      : DEFAULT_EDUCATIONAL_VIDEO_MAP.default;

  // Track progress and simulate time progression if in lecture stream mode or when tracking
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveSec((s) => {
          const next = s + playbackSpeed;
          onTimeUpdate(next);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, onTimeUpdate]);

  function handleSeek(seconds: number) {
    setActiveSec(seconds);
    onTimeUpdate(seconds);
  }

  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const filteredTranscripts = transcripts.filter((t) =>
    transcriptSearch ? t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-4">
      {/* Video Player Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-bold text-gray-800 truncate max-w-[240px] sm:max-w-md">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => {
                setPlayerMode("embed");
                setEmbedError(false);
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                playerMode === "embed"
                  ? "bg-white text-[#0B3D66] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              🎥 YouTube Stream
            </button>
            <button
              onClick={() => setPlayerMode("lecture_stream")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                playerMode === "lecture_stream"
                  ? "bg-[#0B3D66] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              ⚡ Interactive Lecture Stream
            </button>
          </div>

          {/* Watch Directly on YouTube Button */}
          <a
            href={`https://www.youtube.com/watch?v=${cleanId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
            title="Open on YouTube in new tab"
          >
            <span>YouTube</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* Primary Video Canvas Area */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-xl border border-gray-200 group">
        {playerMode === "embed" && !embedError ? (
          <iframe
            src={`https://www.youtube.com/embed/${cleanId}?autoplay=0&rel=0&enablejsapi=1&origin=${
              typeof window !== "undefined" ? window.location.origin : ""
            }`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            onError={() => setEmbedError(true)}
          />
        ) : (
          /* Interactive Lecture Stream View (Fail-safe, animated & interactive) */
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 bg-gradient-to-br from-[#0B3D66] via-[#082E4F] to-[#041726] text-white select-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Interactive Official Video Stream
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1 max-w-lg leading-snug">
                  {title}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-white/10 px-2 py-1 rounded-lg">
                  {formatTime(activeSec)} / {formatTime(activeSec + 1200)}
                </span>
              </div>
            </div>

            {/* Central Visual Graphic / Audio Waveform Presentation */}
            <div className="flex flex-col items-center justify-center my-auto space-y-4">
              <div className="relative flex items-center justify-center">
                {/* Visualizer Pulse */}
                <div className="w-20 h-20 rounded-full bg-blue-500/20 animate-ping absolute" />
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF7A00] to-amber-400 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={togglePlay}
                >
                  <span className="text-3xl text-white ml-1">
                    {isPlaying ? "⏸" : "▶"}
                  </span>
                </div>
              </div>

              {/* Current Subtitle / Transcript Live Overlay */}
              <div className="max-w-xl text-center px-4 py-2 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed transition-all">
                  {transcripts.find((t) => activeSec >= t.start_time && activeSec < t.end_time)?.text ||
                    `Exploring foundational methodology and operational standards for ${title}.`}
                </p>
              </div>
            </div>

            {/* Bottom Playback Scrubber & Controls */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max="1800"
                value={activeSec}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
              />

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    {isPlaying ? "Pause ⏸" : "Play ▶"}
                  </button>

                  <button
                    onClick={() => handleSeek(Math.max(0, activeSec - 10))}
                    className="text-[11px] text-gray-300 hover:text-white cursor-pointer"
                  >
                    -10s
                  </button>
                  <button
                    onClick={() => handleSeek(activeSec + 10)}
                    className="text-[11px] text-gray-300 hover:text-white cursor-pointer"
                  >
                    +10s
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">Speed:</span>
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        playbackSpeed === spd
                          ? "bg-[#FF7A00] text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Quick Navigation Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap justify-between items-center gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase">
            Official Course Lecture
          </span>
          <h4 className="font-bold text-gray-900 mt-1">{title}</h4>
          <p className="text-[11px] text-gray-500">
            Accredited by National Statistical Systems Training Academy (NSSTA) &amp; iGOT Karmayogi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {playerMode === "embed" ? (
            <button
              onClick={() => setPlayerMode("lecture_stream")}
              className="px-3 py-1.5 text-xs font-bold text-[#0B3D66] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>⚡ Switch to Lecture Visualizer</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setPlayerMode("embed");
                setEmbedError(false);
              }}
              className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🎥 Switch to YouTube Embed</span>
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Authorized Transcripts Accordion */}
      {transcripts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-gray-100 text-xs">
            <div>
              <strong className="text-[#0B3D66]">Authorized Video Transcripts &amp; Timecodes:</strong>
              <span className="text-[10px] text-gray-400 ml-2">
                Click any row to jump to that timestamp
              </span>
            </div>
            <input
              type="text"
              placeholder="Search transcript..."
              value={transcriptSearch}
              onChange={(e) => setTranscriptSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0B3D66] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredTranscripts.map((t, idx) => {
              const isActive = activeSec >= t.start_time && activeSec < t.end_time;
              return (
                <div
                  key={t.id || idx}
                  onClick={() => handleSeek(t.start_time)}
                  className={`p-2.5 rounded-xl text-xs flex gap-3 transition-all cursor-pointer hover:scale-[1.005] ${
                    isActive
                      ? "bg-amber-50 border border-amber-300 text-amber-950 font-semibold shadow-2xs"
                      : "bg-gray-50/80 hover:bg-gray-100/80 text-gray-700 border border-transparent"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                      isActive ? "bg-amber-200 text-amber-900" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {formatTime(t.start_time)}
                  </span>
                  <span className="leading-snug flex-1">{t.text}</span>
                  {isActive && (
                    <span className="text-amber-600 text-xs font-bold shrink-0">● Playing</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
