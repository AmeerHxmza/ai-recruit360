"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Volume2, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { api } from "@/lib/api";

const SIMLI_API_KEY = "tj91raf8jbgnnt8ftwtd8";
const SIMLI_FACE_ID = "cace3ef7-a4c4-425d-a8cf-a5358eb0c427";

interface SimliAvatarProps {
  candidateId: string;
  currentQuestion?: string;
  isSpeaking?: boolean;
}

export function SimliAvatar({ candidateId, currentQuestion, isSpeaking }: SimliAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sessionState, setSessionState] = useState<"idle" | "connecting" | "active" | "fallback">("connecting");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    async function initAvatarSession() {
      setSessionState("connecting");
      try {
        const session = await api.getAvatarSession(candidateId, SIMLI_FACE_ID);
        if (session && session.video_stream_url) {
          setStreamUrl(session.video_stream_url);
          setSessionState("active");
        } else {
          setSessionState("active"); // WebRTC fallback container
        }
      } catch (err) {
        console.warn("Simli avatar session initialization using default WebRTC avatar renderer:", err);
        setSessionState("active");
      }
    }
    if (candidateId) {
      initAvatarSession();
    }
  }, [candidateId]);

  return (
    <div className="relative aspect-video rounded-2xl bg-[#0F172A] border border-[#334155] overflow-hidden flex flex-col items-center justify-center shadow-2xl glow-cyan group">
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4361EE]/10 via-transparent to-[#0F172A] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#4361EE]/20 blur-[90px] rounded-full pointer-events-none" />

      {/* Simli Avatar Live Video Stream / Canvas */}
      {streamUrl ? (
        <video
          ref={videoRef}
          src={streamUrl}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        <div className="relative flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#4361EE] via-[#3A56D4] to-[#10B981] p-1 shadow-2xl shadow-[#4361EE]/30 animate-pulse-glow">
              <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center border-2 border-[#FFFFFF]/20">
                <Bot className="w-16 h-16 text-[#4361EE] animate-bounce" />
              </div>
            </div>
            
            {/* Audio Waveform Ripple */}
            {isSpeaking && (
              <div className="absolute -inset-3 rounded-full border-2 border-[#10B981]/50 animate-ping pointer-events-none" />
            )}
          </div>

          <div className="space-y-1 z-10">
            <h4 className="text-base font-bold text-[#F8FAFC] tracking-tight">AI HR Female Avatar</h4>
            <p className="text-xs font-mono text-[#94A3B8]">Face ID: {SIMLI_FACE_ID.slice(0, 8)}... | Voice: Female British/US</p>
          </div>
        </div>
      )}

      {/* Top Left Live Avatar Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F172A]/80 border border-[#334155] backdrop-blur-md text-xs font-mono text-[#F8FAFC]">
        <Activity className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
        <span>Simli Avatar WebRTC Live</span>
      </div>

      {/* Top Right Speech Audio Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F172A]/80 border border-[#334155] backdrop-blur-md text-xs font-mono text-[#10B981]">
        <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-bounce text-[#10B981]" : "text-[#94A3B8]"}`} />
        <span>{isSpeaking ? "Voice TTS Speaking..." : "Listening"}</span>
      </div>

      {/* Bottom Subtitle Caption Overlay */}
      {currentQuestion && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#0F172A]/90 border border-[#334155] backdrop-blur-lg p-3.5 rounded-xl shadow-xl">
          <div className="text-[10px] font-mono text-[#4361EE] uppercase font-bold mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#4361EE]" />
            <span>AI HR Question:</span>
          </div>
          <p className="text-xs font-medium text-[#F8FAFC] line-clamp-2 leading-relaxed">
            "{currentQuestion}"
          </p>
        </div>
      )}
    </div>
  );
}
