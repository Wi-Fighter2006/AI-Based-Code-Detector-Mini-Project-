import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Search, 
  History, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  ChevronRight,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnalysisResponse, Submission } from "./types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [code, setCode] = useState("");
  const [author, setAuthor] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [history, setHistory] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const analyzeCode = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, author })
      });
      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-indigo-600 w-5 h-5" />
            <span className="font-semibold text-lg tracking-tight">CodeGuard</span>
          </div>
          <nav className="flex gap-6">
            <button 
              onClick={() => setActiveTab("analyze")}
              className={cn(
                "text-sm font-medium transition-colors",
                activeTab === "analyze" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Analyze
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={cn(
                "text-sm font-medium transition-colors",
                activeTab === "history" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {activeTab === "analyze" ? (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Code Analysis</h1>
                <p className="text-gray-500">Detect AI-generated content and potential plagiarism.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Student Name</label>
                  <input 
                    type="text" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter student name or ID"
                    className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Source Code</label>
                  <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste Java code here..."
                    className="w-full h-64 bg-white border border-gray-300 p-4 rounded-lg font-mono text-sm focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={analyzeCode}
                  disabled={isAnalyzing || !code}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="animate-spin w-4 h-4" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                </button>
              </div>

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-8 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Score */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">AI Probability</span>
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          result.aiDetection.risk_level === "High" ? "bg-red-100 text-red-700" : 
                          result.aiDetection.risk_level === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                        )}>
                          {result.aiDetection.risk_level} Risk
                        </span>
                      </div>
                      <div className="text-4xl font-bold">{Math.round(result.aiDetection.ai_probability * 100)}%</div>
                      <p className="text-sm text-gray-600 italic">"{result.aiDetection.reasoning}"</p>
                    </div>

                    {/* Plagiarism Score */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Plagiarism Score</span>
                        {result.similarity.maxScore > 0.5 ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-4xl font-bold">{Math.round(result.similarity.maxScore * 100)}%</div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            result.similarity.maxScore > 0.7 ? "bg-red-500" : 
                            result.similarity.maxScore > 0.4 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${result.similarity.maxScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Recent Submissions</h2>
              <div className="space-y-3">
                {history.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center hover:border-indigo-300 transition-colors cursor-pointer group"
                    onClick={() => {
                      setCode(sub.code);
                      setAuthor(sub.author);
                      setActiveTab("analyze");
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{sub.author || "Anonymous"}</div>
                        <div className="text-xs text-gray-400">{new Date(sub.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-12 text-gray-400">No submissions yet.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
