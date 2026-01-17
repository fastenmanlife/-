
import React, { useState } from 'react';
import { ARBAIN_NAWAWI } from '../data/hadiths';
import { Hadith } from '../types';
import { Search, Filter, BookOpen, ChevronLeft } from 'lucide-react';

interface LibraryProps {
  onSelectHadith: (hadith: Hadith) => void;
}

export const Library: React.FC<LibraryProps> = ({ onSelectHadith }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredHadiths = ARBAIN_NAWAWI.filter(h => 
    h.text_plain.includes(searchQuery) || 
    h.narrator.includes(searchQuery) ||
    h.number.toString() === searchQuery
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900">فهرس الأحاديث</h1>
        <p className="text-gray-600">اختر حديثاً لتبدأ عملية الحفظ والمراجعة</p>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن كلمة، راوي، أو رقم الحديث..."
              className="w-full pr-12 pl-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHadiths.map((hadith) => (
          <div 
            key={hadith.id}
            onClick={() => onSelectHadith(hadith)}
            className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 group-hover:w-3 transition-all"></div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                #{hadith.number}
              </span>
              <BookOpen className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>

            <h3 className="hadith-font text-xl font-bold text-gray-900 mb-2 truncate">
              {hadith.text_plain.substring(0, 60)}...
            </h3>
            
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {hadith.narrator}
            </p>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
              <span className="text-xs text-gray-400">{hadith.isnad}</span>
              <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-[-4px] transition-transform">
                ابدأ الحفظ <ChevronLeft className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}

        {filteredHadiths.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">لم يتم العثور على أحاديث تطابق بحثك.</p>
          </div>
        )}
      </div>
    </div>
  );
};
