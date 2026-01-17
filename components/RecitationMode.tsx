
import React, { useState, useEffect, useRef } from 'react';
import { Hadith, Difficulty, Sensitivity } from '../types';
import { Button } from './ui/Button';
import { Mic, MicOff, Play, Pause, Volume2, Info, Headphones, ChevronLeft, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface RecitationModeProps {
  hadith: Hadith;
  difficulty: Difficulty;
  sensitivity: Sensitivity;
  showTashkeel: boolean;
  onComplete: (score: number) => void;
}

type WordStatus = 'pending' | 'correct' | 'wrong';

interface WordObj {
  text: string;
  cleanText: string;
  status: WordStatus;
}

export const RecitationMode: React.FC<RecitationModeProps> = ({ 
  hadith, 
  difficulty, 
  sensitivity, 
  showTashkeel, 
  onComplete 
}) => {
  const [words, setWords] = useState<WordObj[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListeningMode, setIsListeningMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [lastRecognized, setLastRecognized] = useState('');
  
  const currentIndexRef = useRef(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const normalizeArabic = (text: string) => {
    return text
      .replace(/[إأآا]/g, 'ا')
      .replace(/[ةه]/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/[ًٌٍَُِّْ]/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?!]/g,"")
      .trim()
      .toLowerCase();
  };

  useEffect(() => {
    const text = showTashkeel ? hadith.text_diacritic : hadith.text_plain;
    const rawWords = text.split(/\s+/).filter(w => w.length > 0);
    
    const wordList = rawWords.map((word) => ({
      text: word,
      cleanText: normalizeArabic(word),
      status: 'pending' as WordStatus,
    }));
    
    setWords(wordList);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    loadHadithAudio(text);

    return () => {
      stopAudio();
      stopRecognition();
    };
  }, [hadith, difficulty, showTashkeel]);

  const loadHadithAudio = async (text: string) => {
    setIsLoadingAudio(true);
    try {
      const buffer = await geminiService.generateSpeech(text);
      setAudioBuffer(buffer);
    } catch (e) {
      console.error("Audio Load Error", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playAudio = () => {
    if (!audioBuffer) return;
    stopAudio();
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlayingAudio(false);
    source.start();
    setIsPlayingAudio(true);
    audioSourceRef.current = source;
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch(e) {}
      audioSourceRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const setupRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const transcriptRaw = lastResult[0].transcript;
      const transcript = normalizeArabic(transcriptRaw);
      
      setLastRecognized(transcriptRaw);
      checkVoiceInput(transcript);
    };

    recognition.onend = () => {
      if (isRecording) {
        try { recognition.start(); } catch(e) {}
      }
    };
    
    recognitionRef.current = recognition;
  };

  const checkVoiceInput = (transcript: string) => {
    const startIdx = currentIndexRef.current;
    
    setWords(currentWords => {
      if (startIdx >= currentWords.length) return currentWords;

      // البحث عن تطابق في الكلمة الحالية أو الكلمتين التاليتين (قفز ذكي)
      const lookAheadRange = 3; 
      let matchedIdx = -1;

      for (let i = 0; i < lookAheadRange; i++) {
        const checkIdx = startIdx + i;
        if (checkIdx < currentWords.length) {
          if (transcript.includes(currentWords[checkIdx].cleanText)) {
            matchedIdx = checkIdx;
            break;
          }
        }
      }

      if (matchedIdx !== -1) {
        const updatedWords = [...currentWords];
        
        // ملء الكلمات التي تم القفز عنها بـ "تخطي"
        for (let j = startIdx; j < matchedIdx; j++) {
          updatedWords[j] = { ...updatedWords[j], status: 'wrong' };
        }

        // تمييز الكلمة المنطوقة بأنها صحيحة
        updatedWords[matchedIdx] = { ...updatedWords[matchedIdx], status: 'correct' };
        
        const nextIdx = matchedIdx + 1;
        currentIndexRef.current = nextIdx;
        setCurrentIndex(nextIdx);
        setLastRecognized('');

        if (nextIdx >= updatedWords.length) {
          setTimeout(finishRecitation, 500);
        }
        
        return updatedWords;
      }
      return currentWords;
    });
  };

  const startRecitation = () => {
    setIsListeningMode(false);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setWords(wds => wds.map(w => ({ ...w, status: 'pending' })));
    setLastRecognized('');
    stopAudio();
    if (!recognitionRef.current) setupRecognition();
    try {
        recognitionRef.current?.start();
    } catch (e) {}
    setIsRecording(true);
  };

  const stopRecognition = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  const skipWord = () => {
    const idx = currentIndexRef.current;
    setWords(prev => {
      const newWords = [...prev];
      if (newWords[idx]) {
        newWords[idx].status = 'wrong';
        currentIndexRef.current = idx + 1;
        setCurrentIndex(idx + 1);
        if (currentIndexRef.current >= newWords.length) {
          setTimeout(finishRecitation, 500);
        }
      }
      return newWords;
    });
  };

  const finishRecitation = () => {
    stopRecognition();
    const correctCount = words.filter(w => w.status === 'correct').length;
    const score = Math.round((correctCount / words.length) * 100);
    onComplete(score);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-emerald-50 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">الحديث رقم {hadith.number}</h4>
            <p className="text-xs text-emerald-600 font-medium">{hadith.narrator}</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
           <button 
            onClick={() => { setIsListeningMode(true); stopRecognition(); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${isListeningMode ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
           >
             <Headphones className="w-4 h-4" /> مراجعة
           </button>
           <button 
            onClick={startRecitation}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${!isListeningMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400'}`}
           >
             <Mic className="w-4 h-4" /> تسميع
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-emerald-50 relative min-h-[450px] flex flex-col justify-center overflow-hidden">
        {isLoadingAudio && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col items-center justify-center rounded-[2.5rem]">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
            <p className="text-emerald-900 font-bold text-lg animate-pulse">جاري تحضير صوت القارئ...</p>
          </div>
        )}

        <div className="hadith-font text-3xl md:text-5xl leading-[2.4] text-right text-gray-800 transition-all duration-500">
          {words.map((word, idx) => {
            const isTarget = !isListeningMode && idx === currentIndex;
            const isHidden = !isListeningMode && word.status === 'pending';
            const isPast = !isListeningMode && word.status !== 'pending';
            
            return (
              <span
                key={idx}
                className={`inline-block px-2 rounded-2xl transition-all duration-300 relative mx-1 ${
                  isTarget ? 'bg-amber-100 ring-2 ring-amber-400 scale-110 z-10 font-bold text-gray-900 shadow-sm' : ''
                } ${
                  isHidden && !isTarget ? 'bg-gray-100/40 text-transparent select-none blur-[10px]' : ''
                } ${
                  word.status === 'correct' ? 'text-emerald-600 font-bold' : 
                  word.status === 'wrong' ? 'text-red-300 font-medium line-through decoration-red-400/30' : ''
                }`}
              >
                {isListeningMode ? word.text : (isTarget ? '....' : word.text)}
                
                {isTarget && isRecording && (
                   <span className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[12px] px-5 py-2.5 rounded-full animate-bounce whitespace-nowrap shadow-2xl font-sans z-50 border border-gray-700 flex items-center gap-2">
                     <Sparkles className="w-3 h-3 text-amber-400" />
                     {lastRecognized ? `سمعت: ${lastRecognized}` : 'جاري الاستماع...'}
                   </span>
                )}
              </span>
            );
          })}
        </div>

        {!isListeningMode && (
          <div className="mt-16 pt-8 border-t-2 border-dashed border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="text-sm font-bold text-gray-400">التقدم:</span>
              <div className="flex-1 md:w-64 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out" 
                  style={{ width: `${(currentIndex / words.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-black text-emerald-700">
                {Math.round((currentIndex / words.length) * 100)}%
              </span>
            </div>
            
            <div className="flex gap-6">
               <div className="text-center">
                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">صحيح</p>
                 <p className="text-2xl font-black text-emerald-600">{words.filter(w => w.status === 'correct').length}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">تخطي</p>
                 <p className="text-2xl font-black text-red-400">{words.filter(w => w.status === 'wrong').length}</p>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {isListeningMode ? (
          <Button 
            variant="primary" 
            size="lg" 
            className="h-24 rounded-[2.5rem] text-2xl shadow-xl shadow-emerald-100 border-b-8 border-emerald-800 active:border-b-0 active:translate-y-2"
            onClick={isPlayingAudio ? stopAudio : playAudio}
          >
            {isPlayingAudio ? <Pause className="ml-3 w-8 h-8" /> : <Play className="ml-3 w-8 h-8" />}
            {isPlayingAudio ? 'إيقاف الاستماع' : 'استمع للحديث واحفظ'}
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={isRecording ? 'danger' : 'primary'} 
              size="lg" 
              className="h-24 rounded-[2.5rem] text-xl shadow-lg relative overflow-hidden group border-b-8 border-emerald-800"
              onClick={isRecording ? stopRecognition : startRecitation}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isRecording ? <MicOff className="ml-3 w-7 h-7" /> : <Mic className="ml-3 w-7 h-7 animate-pulse" />}
              {isRecording ? 'إيقاف الميكروفون' : 'ابدأ التسميع الآن'}
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="h-24 rounded-[2.5rem] text-xl shadow-lg border-b-8 border-amber-300"
              onClick={skipWord}
            >
              <ChevronLeft className="ml-3 w-7 h-7" /> تخطي الكلمة
            </Button>
          </div>
        )}
      </div>

      <div className="bg-emerald-900 text-emerald-100 rounded-[2rem] p-6 flex items-start gap-4 shadow-xl border border-emerald-700/30">
        <div className="bg-emerald-800 p-3 rounded-2xl shadow-inner">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h5 className="font-bold text-white mb-1">القفز الذكي مفعل:</h5>
          <p className="text-xs leading-relaxed opacity-80 font-sans">
            إذا نسيت كلمة ونطقت التي تليها (بحد أقصى كلمتين)، سيتعرف النظام عليك ويكمل التسميع من مكانك الجديد تلقائياً. 
          </p>
        </div>
      </div>
    </div>
  );
};
