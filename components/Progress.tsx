
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Award, Target, Calendar, TrendingUp } from 'lucide-react';

const MOCK_DATA = [
  { day: 'السبت', words: 45 },
  { day: 'الأحد', words: 30 },
  { day: 'الاثنين', words: 60 },
  { day: 'الثلاثاء', words: 25 },
  { day: 'الأربعاء', words: 80 },
  { day: 'الخميس', words: 55 },
  { day: 'الجمعة', words: 90 },
];

const MOCK_PIE = [
  { name: 'محفوظ', value: 12, color: '#10b981' },
  { name: 'قيد المراجعة', value: 8, color: '#f59e0b' },
  { name: 'لم يبدأ', value: 20, color: '#e5e7eb' },
];

export const Progress: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900">لوحة الإنجازات</h1>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Award, label: 'أحاديث محفوظة', value: '12', color: 'text-amber-600', bg: 'bg-amber-100' },
          { icon: Target, label: 'دقة التسميع', value: '94%', color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { icon: Calendar, label: 'أيام متتالية', value: '15', color: 'text-blue-600', bg: 'bg-blue-100' },
          { icon: TrendingUp, label: 'مستوى الحفظ', value: 'متقدم', color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${stat.bg} p-4 rounded-2xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Activity */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> نشاط الأسبوع (كلمات محفوظة)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="words" radius={[6, 6, 0, 0]}>
                  {MOCK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#10b981' : '#d1fae5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mastered Ratio */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-6 w-full flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" /> توزيع المجموعة (الأربعون النووية)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_PIE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            {MOCK_PIE.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
