import { useEffect, useMemo, useRef, useState } from "react";
import PlayerControls from "@/components/player/Controls.jsx";

export default function VideoPlayer({ lesson, playbackRate, captionsEnabled, onPlaybackRateChange, onCaptionsToggle, onTimeUpdate }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
    setDuration(0);
    setIsPlaying(false);
  }, [lesson.id]);

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

  return (
    <div className="surface overflow-hidden">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-slate-950"
        src={lesson.videoUrl}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || lesson.durationSeconds)}
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

