"use client";

import { useEffect, useRef, useState } from "react";

interface StorySpeakerProps {
  title: string;
  text: string;
}

function pickVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => /en-GB/i.test(voice.lang) && /female|natural|aria|libby|serena/i.test(voice.name)) ??
    voices.find((voice) => /en-GB/i.test(voice.lang)) ??
    voices.find((voice) => /^en/i.test(voice.lang)) ??
    null
  );
}

export function StorySpeaker({ title, text }: StorySpeakerProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const speakingRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    speakingRef.current = speaking;
    pausedRef.current = paused;
  }, [speaking, paused]);

  useEffect(() => {
    if (!supported) {
      return;
    }

    const synth = window.speechSynthesis;
    const shouldContinue = speakingRef.current && !pausedRef.current;
    synth.cancel();
    setPaused(false);

    if (!shouldContinue) {
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${title}. ${text}`);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.lang = "en-GB";
    const voice = pickVoice(synth.getVoices());
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    synth.speak(utterance);

    return () => {
      utterance.onend = null;
      utterance.onerror = null;
    };
  }, [supported, title, text]);

  if (!supported) {
    return (
      <p className="story-body text-sm text-amber-900/50">
        Audio reading is not available in this browser.
      </p>
    );
  }

  function start() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(`${title}. ${text}`);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.lang = "en-GB";
    const voice = pickVoice(synth.getVoices());
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    synth.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  }

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking && !paused) {
      synth.pause();
      setPaused(true);
      return;
    }
    if (speaking && paused) {
      synth.resume();
      setPaused(false);
      return;
    }
    start();
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        className="story-button inline-flex items-center gap-2 rounded-full border border-amber-900/20 px-4 py-2 text-xs tracking-[0.18em] uppercase"
        aria-pressed={speaking && !paused}
      >
        <span aria-hidden="true">{speaking && !paused ? "❚❚" : "♪"}</span>
        {speaking && !paused ? "Pause" : paused ? "Resume" : "Hear this chapter"}
      </button>
      {speaking ? (
        <button
          type="button"
          onClick={stop}
          className="story-kicker text-xs tracking-[0.18em] uppercase text-amber-900/60 hover:text-amber-950"
        >
          Stop
        </button>
      ) : null}
    </div>
  );
}
