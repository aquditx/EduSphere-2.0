import { useEffect, useMemo, useRef, useState } from "react";
import PlayerControls from "@/components/player/Controls.jsx";

function getYouTubeId(url) {
  if (!url) return null;
  // youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function YouTubeEmbed({ videoId }) {
  return (
    <div className="aspect-video w-full bg-slate-950">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
}

export default function VideoPlayer({ lesson, playbackRate, captionsEnabled, onPlaybackRateChange, onCaptionsToggle, onTimeUpdate }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lesson.durationSeconds || 0);

  const youTubeId = useMemo(() => getYouTubeId(lesson.videoUrl), [lesson.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const track = video.textTracks[0];
    if (track) {
      track.mode = captionsEnabled ? "showing" : "hidden";
    }
  }, [captionsEnabled, lesson.id]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(lesson.durationSeconds || 0);
    setIsPlaying(false);
  }, [lesson.id, lesson.durationSeconds]);

  const poster = useMemo(() => lesson.thumbnail || null, [lesson.thumbnail]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function handleTimeUpdate(event) {
    const video = event.currentTarget;
    setCurrentTime(video.currentTime);
    onTimeUpdate?.(video.currentTime, video.duration || lesson.durationSeconds);
  }

  function handleSeek(nextTime) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  // YouTube — render an iframe instead of the native player. Controls are
  // YouTube's own (no seek bar, no playback speed from our side).
  if (youTubeId) {
    return (
      <div className="surface overflow-hidden">
        <YouTubeEmbed videoId={youTubeId} />
        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
          YouTube video — use the player's built-in controls. Duration: {Math.floor((lesson.durationSeconds || 0) / 60)}m {(lesson.durationSeconds || 0) % 60}s
        </div>
      </div>
    );
  }

  // Direct MP4 / any other URL — native <video> with our custom controls.
  return (
    <div className="surface overflow-hidden">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-slate-950"
        src={lesson.videoUrl}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => {
          const realDuration = event.currentTarget.duration;
          if (realDuration && Number.isFinite(realDuration)) {
            setDuration(realDuration);
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        controls={false}
      >
        <track kind="captions" srcLang="en" label="English" src={lesson.transcriptUrl} default />
      </video>
      <PlayerControls
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        playbackRate={playbackRate}
        onPlaybackRateChange={onPlaybackRateChange}
        captionsEnabled={captionsEnabled}
        onCaptionsToggle={onCaptionsToggle}
      />
    </div>
  );
}
