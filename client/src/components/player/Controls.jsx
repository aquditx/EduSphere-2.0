import { Play, Pause, Captions } from "lucide-react";
import Select from "@/components/ui/Select.jsx";
import Button from "@/components/ui/Button.jsx";

export default function PlayerControls({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  playbackRate,
  onPlaybackRateChange,
  captionsEnabled,
  onCaptionsToggle,
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 p-5">
      <label className="block">
        <span className="sr-only">Seek lesson</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="h-2 w-full cursor-pointer accent-slate-950"
          aria-label="Seek video"
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onTogglePlay} aria-label={isPlaying ? "Pause video" : "Play video"}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button variant="secondary" onClick={onCaptionsToggle} aria-pressed={captionsEnabled}>
            <Captions className="h-4 w-4" />
            {captionsEnabled ? "Captions on" : "Captions off"}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500">
            {Math.round(currentTime)}s / {Math.round(duration || 0)}s
          </div>
          <div className="w-36">
            <Select aria-label="Playback speed" value={playbackRate} onChange={(event) => onPlaybackRateChange(Number(event.target.value))}>
              {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

