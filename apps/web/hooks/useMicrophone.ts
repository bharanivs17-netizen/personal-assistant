import { useState, useCallback, useRef, useEffect } from 'react';
import { MicPermissionStatus } from '@partner/shared';

export function useMicrophone() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<MicPermissionStatus>('unknown');
  const [micError, setMicError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check initial permission state without prompting
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((status) => {
          setPermissionStatus(status.state as MicPermissionStatus);
          
          status.onchange = () => {
            setPermissionStatus(status.state as MicPermissionStatus);
          };
        })
        .catch(() => {
          // Fallback if permission query is not supported
          setPermissionStatus('unknown');
        });
    }
  }, []);

  const startMicrophone = useCallback(async (): Promise<MediaStream | null> => {
    setMicError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setMicError('Microphone capture is not supported in this browser.');
      setPermissionStatus('denied');
      return null;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setPermissionStatus('granted');
      return mediaStream;
    } catch (err: any) {
      console.debug('[Partner Voice] Error accessing microphone:', err);
      
      let errorMsg = 'Unable to initialize microphone.';
      const errName = err.name || err.message;
      
      if (errName === 'NotAllowedError') {
        errorMsg = 'Microphone permission denied. Please allow microphone access for Partner in your browser settings.';
        setPermissionStatus('denied');
      } else if (errName === 'NotFoundError') {
        errorMsg = 'No microphone was found.';
      } else if (errName === 'NotReadableError') {
        errorMsg = 'The microphone is currently unavailable.';
      } else if (errName === 'SecurityError') {
        errorMsg = 'Microphone access is blocked by the browser.';
      } else if (errName === 'AbortError') {
        errorMsg = 'Microphone initialization was interrupted.';
      }

      setMicError(errorMsg);
      // Don't overwrite permission status if it wasn't a permission error, 
      // but the UI still shouldn't run.
      if (errName !== 'NotAllowedError') {
        setPermissionStatus('unknown');
      }
      return null;
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    stream,
    permissionStatus,
    micError,
    startMicrophone,
    stopMicrophone,
  };
}
