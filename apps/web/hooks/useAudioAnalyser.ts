import { useState, useEffect, useRef } from 'react';

export function useAudioAnalyser(stream: MediaStream | null, isActive: boolean) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [rmsValue, setRmsValue] = useState(0);
  const [contextState, setContextState] = useState<string>('unknown');
  const [trackState, setTrackState] = useState<string>('unknown');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      setAudioLevel(0);
      return;
    }

    // Initialize AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    audioContextRef.current = audioCtx;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => setContextState(audioCtx.state));
    }
    
    audioCtx.onstatechange = () => {
      setContextState(audioCtx.state);
    };

    // Create Analyser
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    // Connect stream to analyser
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    const track = stream.getAudioTracks()[0];
    if (track) {
      setTrackState(track.readyState);
      track.onended = () => setTrackState('ended');
    }

    const dataArray = new Uint8Array(analyser.fftSize);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);
      
      // Calculate RMS across the complete buffer
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      
      const rms = Math.sqrt(sum / dataArray.length);
      const level = Math.min(100, Math.round(rms * 500));
      const normalizedLevel = level / 100;
      
      setRmsValue(rms);
      setAudioLevel(normalizedLevel);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      setAudioLevel(0);
      setRmsValue(0);
      setContextState('closed');
      setTrackState('stopped');
    };
  }, [stream, isActive]);

  return { audioLevel, rmsValue, contextState, trackState };
}
