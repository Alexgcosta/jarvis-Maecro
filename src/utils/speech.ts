// Speech recognition & synthesis utility for J.A.R.V.I.S.

type SpeechCallback = (text: string, isFinal: boolean) => void;
type StatusCallback = (isListening: boolean) => void;

class SpeechEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;
  private speechListeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      this.synth = window.speechSynthesis || null;
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public isSpeechSynthesisSupported(): boolean {
    return !!this.synth;
  }

  public onSpeakingChange(cb: (speaking: boolean) => void) {
    this.speechListeners.add(cb);
    return () => this.speechListeners.delete(cb);
  }

  private notifySpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
    this.speechListeners.forEach((cb) => cb(speaking));
  }

  public startListening(
    language: string,
    onResult: SpeechCallback,
    onStatusChange?: StatusCallback,
    onError?: (err: string) => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.lang = language === 'en-US' ? 'en-US' : 'pt-BR';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStatusChange) onStatusChange(true);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        this.isListening = false;
        if (onStatusChange) onStatusChange(false);
        if (onError && event.error !== 'no-speech' && event.error !== 'aborted') {
          onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onStatusChange) onStatusChange(false);
      };

      this.recognition.start();
    } catch (e: any) {
      console.warn('Error starting speech recognition:', e);
      this.isListening = false;
      if (onStatusChange) onStatusChange(false);
      if (onError) onError(e?.message || 'Erro ao iniciar microfone.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
    this.isListening = false;
  }

  public speak(text: string, language: string = 'pt-BR', onEndCallback?: () => void) {
    if (!this.synth) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancel previous utterance
    this.synth.cancel();

    // Clean text of markdown stars and hashes for clean voice read
    const cleanText = text
      .replace(/[*#_`~[\]]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    if (!cleanText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'en-US' ? 'en-GB' : 'pt-BR'; // GB English fits JARVIS well!
    utterance.rate = 1.02;
    utterance.pitch = 0.95; // Slightly deeper, sophisticated AI resonance

    // Try finding best matching voice
    const voices = this.synth.getVoices();
    if (language === 'en-US') {
      const gbVoice = voices.find((v) => v.lang.includes('en-GB') || v.name.toLowerCase().includes('british') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('george'));
      if (gbVoice) utterance.voice = gbVoice;
    } else {
      const ptVoice = voices.find((v) => v.lang.includes('pt-BR') || v.lang.includes('pt'));
      if (ptVoice) utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      this.notifySpeaking(true);
    };

    utterance.onend = () => {
      this.notifySpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      this.notifySpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.notifySpeaking(false);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechEngine = new SpeechEngine();
