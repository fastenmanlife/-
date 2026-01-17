
import React, { useState, useEffect } from 'react';
import { Library } from './components/Library';
import { Progress } from './components/Progress';
import { RecitationMode } from './components/RecitationMode';
import { Button } from './components/ui/Button';
import { AppView, Hadith, Difficulty, Sensitivity } from './types';
import { LayoutGrid, Book, Trophy, Settings, Bell, ChevronRight, Volume2, Languages, ShieldCheck, Download, Mic, Sliders } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.INTERMEDIATE);
  const [sensitivity, setSensitivity] = useState<Sensitivity>(Sensitivity.LOW);
  const [showTashkeel, setShowTashkeel] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState(false);

  useEffect(() => {
    checkMicPermission();
  }, []);

  const checkMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicPermission(true);
    } catch (e) {
      setHasMicPermission(false);
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (view !== 'practice') setSelectedHadith(null);
      }}
      className={`flex flex-col items-center gap-1 p-3 transition-all rounded-2xl ${
        currentView === view ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-6 h-6 ${currentView === view ? 'stroke-[2.5px]' : 'stroke-2'}`} />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-32 pt-6 bg-[#fcfdfd] selection:bg-emerald-100">
      <header className="px-6 mb-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 transition-transform hover:scale-105 cursor-pointer" onClick={() => setCurrentView('library')}>
            <span className="text-white text-2xl font-bold">ح</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-emerald-900">حافظ الحديث</h1>
            <p className="text-xs text-emerald-600 font-medium tracking-wide uppercase">AI Hadith Companion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!hasMicPermission && (
            <button 
              onClick={checkMicPermission}
              className="hidden md:flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse border border-red-100"
            >
              <Mic className="w-3 h-3" /> الميكروفون معطل
            </button>
          )}
          <button className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold shadow-inner">أ</div>
            <span className="text-sm font-semibold text-gray-700">أحمد محمد</span>
          </div>
        </div>
      </header>

      <main className="px-6 max-w-7xl mx-auto">
        {selectedHadith ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <Button variant="ghost" className="w-fit" onClick={() => setSelectedHadith(null)}>
                <ChevronRight className="w-5 h-5 ml-1" /> العودة للفهرس
              </Button>
              <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-[1.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 px-3 border-l border-gray-100">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-400">الدقة:</span>
                  <select 
                    className="bg-transparent text-sm font-bold text-emerald-700 outline-none cursor-pointer"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value as Sensitivity)}
                  >
                    <option value={Sensitivity.LOW}>مرن (ذكي)</option>
                    <option value={Sensitivity.MEDIUM}>متوسط</option>
                    <option value={Sensitivity.HIGH}>دقيق جداً</option>
                  </select>
                </div>
                <button 
                  onClick={() => setShowTashkeel(!showTashkeel)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${showTashkeel ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  {showTashkeel ? 'بالتشكيل' : 'بدون تشكيل'}
                </button>
              </div>
            </div>
            <RecitationMode 
              hadith={selectedHadith} 
              difficulty={difficulty} 
              sensitivity={sensitivity}
              showTashkeel={showTashkeel}
              onComplete={(score) => {
                alert(`إنجاز مبارك! درجة الحفظ: ${score}%`);
                setSelectedHadith(null);
                setCurrentView('progress');
              }}
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {currentView === 'library' && (
              <Library onSelectHadith={(h) => {
                setSelectedHadith(h);
                setCurrentView('practice');
              }} />
            )}
            {currentView === 'progress' && <Progress />}
            {currentView === 'news' && (
              <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-[3rem] border border-gray-50 shadow-sm">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Bell className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">لا توجد تحديثات حالياً</h2>
                <p className="text-gray-500 max-w-xs mx-auto">سيتم إخطارك هنا بأي مجموعات حديثية جديدة تضاف للمكتبة.</p>
              </div>
            )}
            {currentView === 'settings' && (
              <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <h2 className="text-3xl font-bold mb-8">إعدادات التطبيق</h2>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                         <Mic className="text-emerald-600 w-5 h-5" />
                       </div>
                       <div>
                         <span className="font-bold block text-gray-900">إذن الميكروفون</span>
                         <span className="text-xs text-gray-500">مطلوب لعملية التسميع الصوتي</span>
                       </div>
                     </div>
                     <span className={hasMicPermission ? "bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold" : "bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold"}>
                       {hasMicPermission ? "مفعل" : "غير مفعل"}
                     </span>
                   </div>

                   <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                         <Volume2 className="text-amber-600 w-5 h-5" />
                       </div>
                       <div>
                         <span className="font-bold block text-gray-900">صوت القارئ (AI)</span>
                         <span className="text-xs text-gray-500">تحويل النص إلى صوت بجودة عالية</span>
                       </div>
                     </div>
                     <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold">نشط</span>
                   </div>
                </div>
              </div>
            )}
          </div >
        )}
      </main>

      <nav className="fixed bottom-6 inset-x-6 bg-white/80 backdrop-blur-2xl border border-white/40 px-6 py-2 flex justify-between items-center z-40 max-w-lg mx-auto rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <NavItem view="news" icon={LayoutGrid} label="الأخبار" />
        <NavItem view="library" icon={Book} label="الفهرس" />
        <div className="relative -top-10">
           <button 
            onClick={() => {
              if (selectedHadith) setCurrentView('practice');
              else setCurrentView('library');
            }}
            className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-400 border-[8px] border-[#fcfdfd] transition-all active:scale-90 hover:scale-105 group"
           >
             <Mic className="w-10 h-10 group-hover:animate-pulse" />
           </button>
        </div>
        <NavItem view="progress" icon={Trophy} label="إنجازاتي" />
        <NavItem view="settings" icon={Settings} label="الإعدادات" />
      </nav>
    </div>
  );
};

export default App;
