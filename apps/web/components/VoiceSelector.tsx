'use client';

import { useState, useEffect, useRef } from 'react';
import type { PartnerSettings } from '@partner/shared';

interface VoiceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PartnerSettings;
  onSettingsChange: (settings: PartnerSettings) => void;
}

type FilterType = 'All' | 'English' | 'Tamil' | 'Other';

export default function VoiceSelector({ isOpen, onClose, settings, onSettingsChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('All');
  const previewRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setLoading(false);
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isOpen]);

  // Cleanup preview on close
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  const handlePreview = (voice: SpeechSynthesisVoice, e: React.MouseEvent) => {
    e.stopPropagation();
    window.speechSynthesis.cancel(); // Stop current speech

    const isTamil = voice.lang.toLowerCase().includes('ta') || voice.name.toLowerCase().includes('tamil');
    const text = isTamil ? "வணக்கம்! நான் Partner. உங்களுக்கு எப்படி உதவலாம்?" : "Hello, I am Partner. How can I help you?";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = settings.speechSpeed || 1;
    
    window.speechSynthesis.speak(utterance);
    previewRef.current = utterance;
  };

  const handleSelect = (voiceId: string) => {
    onSettingsChange({ ...settings, voiceId });
  };

  // Filtering
  const filteredVoices = voices.filter(voice => {
    const lang = voice.lang.toLowerCase();
    const name = voice.name.toLowerCase();
    const isEnglish = lang.startsWith('en');
    const isTamil = lang.includes('ta') || name.includes('tamil');

    if (filter === 'English') return isEnglish;
    if (filter === 'Tamil') return isTamil;
    if (filter === 'Other') return !isEnglish && !isTamil;
    return true;
  });

  // Categorizing
  const recommendedIdentifiers = [
    { lang: 'en-in', name: 'india' },
    { lang: 'en-us', name: 'united states' },
    { lang: 'en-gb', name: 'united kingdom' },
    { lang: 'ta-in', name: 'india' },
  ];

  const isRecommended = (voice: SpeechSynthesisVoice) => {
    const lang = voice.lang.toLowerCase();
    return recommendedIdentifiers.some(id => lang.includes(id.lang));
  };

  const recommendedVoices = filteredVoices.filter(isRecommended);
  const otherVoices = filteredVoices.filter(v => !isRecommended(v));
  
  const hasTamilGlobally = voices.some(v => v.lang.toLowerCase().includes('ta') || v.name.toLowerCase().includes('tamil'));

  if (!isOpen) return null;

  return (
    <div className="voice-selector-overlay" onClick={onClose}>
      <div className="voice-selector-modal" onClick={e => e.stopPropagation()}>
        
        <div className="voice-selector-header">
          <h3 className="voice-selector-title">Partner Voice</h3>
          <button className="voice-selector-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="voice-selector-controls">
          <span className="voice-selector-desc">Choose how Partner speaks to you.</span>
          <div className="voice-filter-tabs">
            {(['All', 'English', 'Tamil', 'Other'] as FilterType[]).map(f => (
              <button 
                key={f}
                className={`voice-filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="voice-selector-content">
          {loading ? (
            <div className="voice-empty-state">Loading voices...</div>
          ) : voices.length === 0 ? (
            <div className="voice-empty-state">No voices available</div>
          ) : (
            <>
              {!hasTamilGlobally && filter === 'Tamil' && (
                <div className="voice-notice">Tamil voice isn't available on this device.</div>
              )}

              {recommendedVoices.length > 0 && (
                <div className="voice-category">
                  <div className="voice-category-title">Recommended</div>
                  <div className="voice-list">
                    {recommendedVoices.map(voice => (
                      <VoiceItem 
                        key={voice.voiceURI}
                        voice={voice}
                        isSelected={settings.voiceId === voice.voiceURI || (settings.voiceId === 'default' && voice.default)}
                        onSelect={() => handleSelect(voice.voiceURI)}
                        onPreview={(e) => handlePreview(voice, e)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherVoices.length > 0 && (
                <div className="voice-category">
                  <div className="voice-category-title">Other Voices</div>
                  <div className="voice-list">
                    {otherVoices.map(voice => (
                      <VoiceItem 
                        key={voice.voiceURI}
                        voice={voice}
                        isSelected={settings.voiceId === voice.voiceURI || (settings.voiceId === 'default' && voice.default)}
                        onSelect={() => handleSelect(voice.voiceURI)}
                        onPreview={(e) => handlePreview(voice, e)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

function VoiceItem({ voice, isSelected, onSelect, onPreview }: { voice: SpeechSynthesisVoice, isSelected: boolean, onSelect: () => void, onPreview: (e: React.MouseEvent) => void }) {
  // Extract region if possible
  const langParts = voice.lang.split('-');
  const language = langParts[0];
  const region = langParts[1] ? ` (${langParts[1].toUpperCase()})` : '';

  return (
    <div className={`voice-item ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="voice-item-info">
        <div className="voice-item-name">
          <span className="voice-item-icon">🔊</span>
          {voice.name}
        </div>
        <div className="voice-item-lang">
          {language}{region} {voice.default ? ' — Default' : ''}
        </div>
      </div>
      
      <div className="voice-item-actions">
        {isSelected && <span className="voice-item-check">✓</span>}
        <button className="voice-item-preview" onClick={onPreview} aria-label="Preview voice">
          Preview
        </button>
      </div>
    </div>
  );
}
