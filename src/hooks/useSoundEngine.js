import { useRef, useCallback } from "react";

export function useSoundEngine() {
  const ctxRef = useRef(null);
  const humRef = useRef(null);
  const soundOnRef = useRef(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch { return null; }
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const startHum = useCallback(() => {
    if (!soundOnRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      if (humRef.current) { try { humRef.current.stop(); } catch {} }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth"; osc.frequency.value = 80; gain.gain.value = 0.04;
      osc.connect(gain); gain.connect(ctx.destination); osc.start();
      humRef.current = osc;
    } catch {}
  }, [getCtx]);

  const updateHum = useCallback((mult) => {
    if (!humRef.current || !soundOnRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      humRef.current.frequency.setTargetAtTime(
        Math.min(80 + mult * 22, 420), ctx.currentTime, 0.3
      );
    } catch {}
  }, [getCtx]);

  const stopHum = useCallback(() => {
    if (!humRef.current) return;
    try { humRef.current.stop(); } catch {}
    humRef.current = null;
  }, []);

  const playCashout = useCallback(() => {
    if (!soundOnRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setTargetAtTime(880, ctx.currentTime, 0.05);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime + 0.3, 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, [getCtx]);

  const playCrash = useCallback(() => {
    if (!soundOnRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      const src = ctx.createBufferSource(); const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass"; filt.frequency.value = 280;
      src.buffer = buf;
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime + 0.1, 0.15);
      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start();
    } catch {}
  }, [getCtx]);

  const setSoundOn = useCallback(
    (val) => { soundOnRef.current = val; if (!val) stopHum(); },
    [stopHum]
  );

  return { startHum, updateHum, stopHum, playCashout, playCrash, setSoundOn };
}