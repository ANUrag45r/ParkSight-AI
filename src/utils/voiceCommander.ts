/**
 * Web Speech API Voice Commander & Natural Language Query Parser
 * Enables speech-to-dashboard commands for ParkSight AI.
 */

import { locations } from '../data';
import { audioFx } from './audioFx';

export interface ParsedVoiceCommand {
  rawTranscript: string;
  intent: 'navigate' | 'predict' | 'set_location' | 'toggle_3d' | 'toggle_map' | 'unknown';
  locationId?: string;
  locationName?: string;
  targetDate?: Date;
  dateLabel?: string;
  targetTime?: string;
  targetNav?: string;
  summary: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

class VoiceCommander {
  private recognition: SpeechRecognitionInstance | null = null;
  private state: VoiceState = 'idle';
  private stateListeners: Set<(state: VoiceState, transcript?: string) => void> = new Set();
  private commandListeners: Set<(cmd: ParsedVoiceCommand) => void> = new Set();
  private isAvailable: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';
          this.isAvailable = true;
          this.setupListeners();
        } catch (e) {
          console.warn('Speech recognition setup failed:', e);
          this.isAvailable = false;
        }
      }
    }
  }

  public isSupported(): boolean {
    return this.isAvailable && this.recognition !== null;
  }

  public getState(): VoiceState {
    return this.state;
  }

  public onStateChange(fn: (state: VoiceState, transcript?: string) => void): () => void {
    this.stateListeners.add(fn);
    return () => this.stateListeners.delete(fn);
  }

  public onCommand(fn: (cmd: ParsedVoiceCommand) => void): () => void {
    this.commandListeners.add(fn);
    return () => this.commandListeners.delete(fn);
  }

  private setState(state: VoiceState, transcript?: string): void {
    this.state = state;
    this.stateListeners.forEach((fn) => fn(state, transcript));
  }

  private setupListeners(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      audioFx.playVoiceTrigger();
      this.setState('listening', '');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          final += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      const text = final || interim;
      this.setState('listening', text);

      if (final) {
        this.processTranscript(final.trim());
      }
    };

    this.recognition.onerror = (e) => {
      console.warn('Voice recognition error:', e.error);
      this.setState('error', e.error === 'no-speech' ? 'No speech detected' : 'Microphone error');
      setTimeout(() => this.setState('idle'), 2500);
    };

    this.recognition.onend = () => {
      if (this.state === 'listening') {
        this.setState('idle');
      }
    };
  }

  public startListening(): void {
    if (!this.recognition) {
      this.setState('unsupported', 'Speech recognition is not supported in this browser.');
      return;
    }
    try {
      this.recognition.start();
    } catch {
      // In case it's already started
      try {
        this.recognition.stop();
        setTimeout(() => this.recognition?.start(), 150);
      } catch {}
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.setState('idle');
  }

  /**
   * Parse natural language text into actionable dashboard commands
   */
  public parseText(transcript: string): ParsedVoiceCommand {
    const lower = transcript.toLowerCase();

    // 1. Check for tab navigation
    if (lower.includes('analytics') || lower.includes('chart') || lower.includes('graph')) {
      return {
        rawTranscript: transcript,
        intent: 'navigate',
        targetNav: 'analytics',
        summary: 'Opening Analytics Dashboard',
      };
    }
    if (lower.includes('hotspot') || lower.includes('surveillance') || lower.includes('high risk')) {
      return {
        rawTranscript: transcript,
        intent: 'navigate',
        targetNav: 'hotspots',
        summary: 'Opening Bangalore Hotspots Panel',
      };
    }
    if (lower.includes('report') || lower.includes('audit') || lower.includes('patrol')) {
      return {
        rawTranscript: transcript,
        intent: 'navigate',
        targetNav: 'reports',
        summary: 'Opening Enforcement Reports',
      };
    }
    if (lower.includes('setting') || lower.includes('configuration') || lower.includes('threshold')) {
      return {
        rawTranscript: transcript,
        intent: 'navigate',
        targetNav: 'settings',
        summary: 'Opening System Settings',
      };
    }

    // 2. Check for 3D view toggle
    if (lower.includes('3d') || lower.includes('tilt') || lower.includes('drone')) {
      return {
        rawTranscript: transcript,
        intent: 'toggle_3d',
        summary: 'Toggling 3D Drone Perspective',
      };
    }

    // 3. Check for basemap toggle (satellite vs dark)
    if (lower.includes('satellite') || lower.includes('aerial') || lower.includes('dark map') || lower.includes('vector map')) {
      return {
        rawTranscript: transcript,
        intent: 'toggle_map',
        summary: 'Toggling Map Layer Basemap',
      };
    }

    // 4. Extract Location Entity
    let matchedLocation = locations.find(l => 
      lower.includes(l.name.toLowerCase()) || 
      lower.includes(l.id.toLowerCase()) ||
      lower.includes(l.area.toLowerCase())
    );

    // Fuzzy aliases
    if (!matchedLocation) {
      if (lower.includes('brigade')) matchedLocation = locations.find(l => l.id === 'brigade-road');
      else if (lower.includes('mg road') || lower.includes('m.g.') || lower.includes('mg')) matchedLocation = locations.find(l => l.id === 'mg-road');
      else if (lower.includes('commercial')) matchedLocation = locations.find(l => l.id === 'commercial-street');
      else if (lower.includes('ub city') || lower.includes('ub')) matchedLocation = locations.find(l => l.id === 'ub-city');
      else if (lower.includes('kora') || lower.includes('koramangala')) matchedLocation = locations.find(l => l.id === 'koramangala');
      else if (lower.includes('indira') || lower.includes('indiranagar')) matchedLocation = locations.find(l => l.id === 'indiranagar');
      else if (lower.includes('whitefield') || lower.includes('itpl')) matchedLocation = locations.find(l => l.id === 'whitefield');
      else if (lower.includes('jayanagar')) matchedLocation = locations.find(l => l.id === 'jayanagar');
    }

    // 5. Extract Date Entity
    let targetDate: Date | undefined;
    let dateLabel: string | undefined;

    if (lower.includes('tomorrow')) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      targetDate = d;
      dateLabel = 'Tomorrow';
    } else if (lower.includes('today')) {
      targetDate = new Date();
      dateLabel = 'Today';
    }

    // 6. Extract Time Entity
    let targetTime: string | undefined;
    // Look for e.g. "7 pm", "7:30 pm", "18:00", "8 am", "at 9"
    const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3].toUpperCase();
      const paddedH = h < 10 ? `0${h}` : `${h}`;
      const paddedM = m < 30 ? '00' : '30'; // Snap to 30-min slots
      targetTime = `${paddedH}:${paddedM} ${meridiem}`;
    } else if (lower.includes('noon')) {
      targetTime = '12:00 PM';
    } else if (lower.includes('midnight')) {
      targetTime = '12:00 AM';
    } else if (lower.includes('evening')) {
      targetTime = '07:00 PM';
    } else if (lower.includes('morning')) {
      targetTime = '09:00 AM';
    }

    // 7. Check for prediction trigger
    const isPredictIntent = lower.includes('predict') || lower.includes('forecast') || lower.includes('calculate') || lower.includes('run');

    if (matchedLocation || targetDate || targetTime) {
      return {
        rawTranscript: transcript,
        intent: 'set_location',
        locationId: matchedLocation?.id,
        locationName: matchedLocation?.name,
        targetDate,
        dateLabel,
        targetTime,
        summary: `Setting ${matchedLocation ? matchedLocation.name : ''} ${dateLabel ? dateLabel : ''} ${targetTime ? targetTime : ''}`.trim(),
      };
    }

    if (isPredictIntent) {
      return {
        rawTranscript: transcript,
        intent: 'predict',
        summary: 'Calculating Violation Forecast',
      };
    }

    return {
      rawTranscript: transcript,
      intent: 'unknown',
      summary: `Heard: "${transcript}"`,
    };
  }

  private processTranscript(transcript: string): void {
    const cmd = this.parseText(transcript);
    this.setState('processing', cmd.summary);
    audioFx.playSuccess();

    this.commandListeners.forEach((fn) => fn(cmd));

    setTimeout(() => {
      this.setState('idle');
    }, 2400);
  }
}

export const voiceCommander = new VoiceCommander();
