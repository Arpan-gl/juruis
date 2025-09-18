import { useState } from 'react';
import axios from '../axios';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const fieldClasses = "w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/70";

export default function SchemesAdvisor() {
  const [form, setForm] = useState({
    category: '',
    gender: '',
    education_level: '',
    current_study: '',
    income: '',
    state: '',
    abroad: 'no',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  type SchemeCard = {
    title: string;
    why: string;
    eligibility: string;
    benefits: string;
    raw: string;
  };

  const parseSchemes = (text: string): SchemeCard[] => {
    if (!text) return [];

    const lines = text.split('\n');
    const startIdxs: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*\d+\./.test(lines[i])) startIdxs.push(i);
    }
    if (startIdxs.length === 0) return [];

    const blocks: string[] = [];
    for (let i = 0; i < startIdxs.length; i++) {
      const start = startIdxs[i];
      const end = i + 1 < startIdxs.length ? startIdxs[i + 1] : lines.length;
      blocks.push(lines.slice(start, end).join('\n'));
    }

    const getSection = (block: string, label: string): string => {
      const blines = block.split('\n');
      const idx = blines.findIndex(l => l.toLowerCase().includes(label.toLowerCase()))
      if (idx === -1) return '';
      const collected: string[] = [];
      for (let i = idx; i < blines.length; i++) {
        const current = blines[i];
        if (i === idx) {
          const afterColon = current.split(':').slice(1).join(':').trim();
          if (afterColon) collected.push(afterColon.replace(/^\*+|\*+$/g, '').trim());
          continue;
        }
        if (/^\s*\*\*/.test(current)) break;
        if (/^\s*\d+\./.test(current)) break;
        collected.push(current.trim());
      }
      return collected.join('\n').trim();
    };

    return blocks.map(b => {
      const title = getSection(b, 'Scheme Name');
      const why = getSection(b, 'Why it matches');
      const eligibility = getSection(b, 'Key Eligibility');
      const benefits = getSection(b, 'Benefit Summary');
      return { title, why, eligibility, benefits, raw: b.trim() };
    }).filter(s => s.title);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post('/schemes/recommend', form);
      setResult(res.data?.result || '');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_45rem_at_120%_-10%,#93c5fd20,transparent)]" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Schemes Advisor</h1>
            <p className="text-slate-600 mt-3 max-w-3xl mx-auto">Answer a few questions and get tailored scheme recommendations based on your profile. Refined, accurate, and easy to understand.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <form onSubmit={submit} className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 gap-4">
                <select className={fieldClasses} value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
                  <option value="">Category</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>OBC</option>
                  <option>General</option>
                </select>
                <select className={fieldClasses} value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
                  <option value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <select className={fieldClasses} value={form.education_level} onChange={e=>setForm({...form, education_level:e.target.value})}>
                  <option value="">Highest education</option>
                  <option>Class 10</option>
                  <option>Class 12</option>
                  <option>Undergrad</option>
                  <option>Postgrad</option>
                </select>
                <input className={fieldClasses} placeholder="Current study / Target course" value={form.current_study} onChange={e=>setForm({...form, current_study:e.target.value})} />
                <input className={fieldClasses} placeholder="Family income (lakhs)" value={form.income} onChange={e=>setForm({...form, income:e.target.value})} />
                <input className={fieldClasses} placeholder="State/UT (optional)" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} />
                <select className={fieldClasses} value={form.abroad} onChange={e=>setForm({...form, abroad:e.target.value})}>
                  <option value="no">Interested in overseas studies? No</option>
                  <option value="yes">Interested in overseas studies? Yes</option>
                </select>
              </div>
              <Button disabled={loading} className="mt-6 w-full">
                {loading ? 'Finding schemes...' : 'Get Recommendations'}
              </Button>
              {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
            </form>

            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-md border border-slate-200">
              <h2 className="text-xl font-semibold mb-3">Recommendations</h2>
              {!result && <p className="text-slate-500">Fill the form and submit to see suggestions here.</p>}
              {result && (() => {
                const schemes = parseSchemes(result);
                if (!schemes.length) {
                  return <pre className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">{result}</pre>;
                }
                return (
                  <div className="grid gap-5">
                    {schemes.map((s, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition bg-white/90">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold">{idx + 1}. {s.title}</h3>
                          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">#{idx + 1}</span>
                        </div>
                        {s.why && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-slate-700">Why it matches</p>
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{s.why}</p>
                          </div>
                        )}
                        {s.eligibility && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-slate-700">Key Eligibility</p>
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{s.eligibility}</p>
                          </div>
                        )}
                        {s.benefits && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-slate-700">Benefit Summary</p>
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{s.benefits}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {!chatOpen && (
            <button
              aria-label="Open chat"
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:scale-95 transition flex items-center justify-center z-[1000]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75a9.72 9.72 0 01-4.548-1.128l-3.627.907a.75.75 0 01-.902-.902l.907-3.627A9.72 9.72 0 012.25 12z" />
              </svg>
            </button>
          )}

          {chatOpen && (
            <div className="fixed bottom-6 right-6 z-[1000] w-[92vw] max-w-[520px] h-[600px] md:w-[480px] md:h-[640px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <span className="font-semibold">Ask more questions</span>
                <button onClick={() => setChatOpen(false)} className="rounded-md px-2 py-1 hover:bg-white/20">
                  Close
                </button>
              </div>
              <div className="p-2 md:p-3 flex-1">
                <ChatInterface />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


