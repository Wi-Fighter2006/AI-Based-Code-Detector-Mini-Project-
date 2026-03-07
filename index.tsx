
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Types ---
interface StudentSubmission {
  id: string;
  studentName: string; // University Roll No.
  code: string;
  timestamp: number;
}

interface AIAnalysisResult {
  score: number;
  markers: string[];
  reasoning: string;
  confidence: 'Low' | 'Medium' | 'High';
}

interface PlagiarismMatch {
  studentA: string;
  studentB: string;
  similarityScore: number;
  logicFingerprint: string;
}

interface ComprehensiveReport {
  aiDetection: Record<string, AIAnalysisResult>;
  crossComparison: PlagiarismMatch[];
  summary: string;
}

// --- Constants ---
const DEMO_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "s-101",
    studentName: "ROLL-2024-001",
    code: `function fib(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    let t = a + b;\n    a = b;\n    b = t;\n  }\n  return b;\n}`,
    timestamp: Date.now() - 120000
  },
  {
    id: "s-102",
    studentName: "ROLL-2024-042",
    code: `const getFibonacci = (num) => {\n  if (num < 2) return num;\n  let prev = 0, curr = 1;\n  for (let i = 2; i <= num; i++) {\n    const next = prev + curr;\n    prev = curr;\n    curr = next;\n  }\n  return curr;\n};`,
    timestamp: Date.now() - 60000
  }
];

// --- Components ---

const SubmissionCard = ({ submission, onRemove }: { submission: StudentSubmission; onRemove: (id: string) => void }) => (
  <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 group-hover:bg-indigo-600"></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">{submission.studentName}</h3>
        <p className="text-[10px] text-slate-400 font-medium">Unique ID: {submission.id}</p>
      </div>
      <button onClick={() => onRemove(submission.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
    <div className="bg-slate-900 rounded-xl p-3 text-[10px] font-mono text-indigo-300 max-h-20 overflow-hidden relative border border-slate-800">
      <pre className="whitespace-pre-wrap leading-relaxed">{submission.code}</pre>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </div>
  </div>
);

const AnalysisDashboard = ({ report, submissions }: { report: ComprehensiveReport; submissions: StudentSubmission[] }) => {
  const aiData = useMemo(() => Object.entries(report.aiDetection).map(([id, result]) => {
    const student = submissions.find(s => s.id === id);
    return {
      name: student?.studentName || id,
      score: result.score,
      reasoning: result.reasoning,
      markers: result.markers
    };
  }), [report, submissions]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
          <p className="text-3xl font-black text-slate-900">{submissions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Usage Probability</p>
          <p className="text-3xl font-black text-indigo-600">
            {Math.round(aiData.reduce((acc, c) => acc + c.score, 0) / (aiData.length || 1))}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Similarity Flags</p>
          <p className="text-3xl font-black text-orange-600">{report.crossComparison.filter(p => p.similarityScore > 50).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">AI Content Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={32}>
                  {aiData.map((e, i) => <Cell key={i} fill={e.score > 70 ? '#ef4444' : e.score > 40 ? '#f59e0b' : '#6366f1'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 max-h-[380px] overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Detection Details</h3>
          <div className="space-y-6">
            {aiData.map((d, i) => (
              <div key={i} className="border-l-2 border-slate-100 pl-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 text-sm">{d.name}</span>
                  <span className="text-[9px] font-black text-indigo-500 uppercase">{d.score}% match</span>
                </div>
                <p className="text-[11px] text-slate-500 italic mb-2 leading-relaxed">"{d.reasoning}"</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.markers.map((m, j) => <span key={j} className="text-[8px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 uppercase">{m}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <h3 className="text-xl font-black mb-4 flex items-center gap-3 tracking-tight">Final Check Summary</h3>
        <p className="text-slate-300 text-md leading-relaxed font-medium">{report.summary}</p>
      </div>
    </div>
  );
};

const App = () => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addSubmission = () => {
    if (!currentName || !currentCode) return;
    setSubmissions([...submissions, { id: `s-${Math.random().toString(36).substr(2, 5)}`, studentName: currentName, code: currentCode, timestamp: Date.now() }]);
    setCurrentName(''); setCurrentCode(''); setReport(null);
  };

  const handleAnalyze = async () => {
    if (submissions.length < 1) return setError("Please add at least one student submission.");
    setIsAnalyzing(true); setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze academic integrity (AI generation likelihood and plagiarism) for these student submissions. 
        Provide detailed reasoning for AI score and identify logic overlaps between students.
        \nSubmissions:\n${submissions.map(s => `[${s.studentName}, ID: ${s.id}]\nCODE:\n${s.code}\n---`).join('\n')}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiDetection: { 
                type: Type.OBJECT, 
                properties: { studentId: { type: Type.STRING } },
                additionalProperties: {
                  type: Type.OBJECT,
                  properties: { 
                    score: { type: Type.NUMBER }, 
                    markers: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                    reasoning: { type: Type.STRING }, 
                    confidence: { type: Type.STRING, enum: ["Low", "Medium", "High"] } 
                  },
                  required: ["score", "markers", "reasoning", "confidence"]
                }
              },
              crossComparison: {
                type: Type.ARRAY,
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    studentA: { type: Type.STRING }, 
                    studentB: { type: Type.STRING }, 
                    similarityScore: { type: Type.NUMBER }, 
                    logicFingerprint: { type: Type.STRING } 
                  },
                  required: ["studentA", "studentB", "similarityScore"]
                }
              },
              summary: { type: Type.STRING }
            },
            required: ["aiDetection", "crossComparison", "summary"]
          }
        }
      });
      setReport(JSON.parse(response.text));
    } catch (e: any) { setError(e.message); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 glass-panel h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
          <span className="font-bold text-slate-900">CodeGuardian AI</span>
        </div>
        <button onClick={() => setSubmissions(DEMO_SUBMISSIONS)} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 px-3 py-1.5 rounded-full transition-all">Try Demo Submissions</button>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Smart Code Checking.</h1>
          <p className="text-slate-500 font-medium max-w-xl">Detecting AI-generated code and copied logic to ensure fair student work.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100">
              <h2 className="text-xl font-bold mb-6">New Submission</h2>
              <div className="space-y-4">
                <input type="text" value={currentName} onChange={e => setCurrentName(e.target.value)} placeholder="University Roll No." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium" />
                <textarea rows={8} value={currentCode} onChange={e => setCurrentCode(e.target.value)} placeholder="Paste source code here..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm" />
                <button onClick={addSubmission} disabled={!currentName || !currentCode} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Add to List</button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Submissions Ready to Check ({submissions.length})</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {submissions.length === 0 ? <p className="text-slate-400 text-center py-10 font-medium">No submissions added yet.</p> : submissions.map(s => <SubmissionCard key={s.id} submission={s} onRemove={id => setSubmissions(submissions.filter(x => x.id !== id))} />)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-sm">
                <div className="w-20 h-20 border-[5px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                <h3 className="text-2xl font-black">Checking for AI & Copied Work...</h3>
                <p className="text-slate-400 text-sm mt-2">Analyzing patterns and comparing logic across all files.</p>
              </div>
            ) : report ? (
              <AnalysisDashboard report={report} submissions={submissions} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center mb-6"><svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                <h3 className="text-2xl font-black mb-4">Ready to Check</h3>
                <p className="text-slate-500 font-medium max-w-xs mb-10">Add student code to your list above, then click the button below to start the analysis.</p>
                <button onClick={handleAnalyze} disabled={submissions.length === 0} className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-20 transition-all shadow-2xl active:scale-95">Start Detection Check</button>
              </div>
            )}
            {error && <div className="mt-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">{error}</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
