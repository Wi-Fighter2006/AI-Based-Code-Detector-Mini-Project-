export interface AnalysisFeatures {
  totalLines: number;
  avgLineLength: number;
  commentRatio: number;
  indentRatio: number;
  functionCount: number;
  classCount: number;
  keywordFreq: Record<string, number>;
}

export interface AIDetectionResult {
  ai_probability: number;
  reasoning: string;
  risk_level: "Low" | "Medium" | "High";
}

export interface SimilarityResult {
  maxScore: number;
  status: "High Risk" | "Suspicious" | "Clean";
}

export interface AnalysisResponse {
  features: AnalysisFeatures;
  similarity: SimilarityResult;
  aiDetection: AIDetectionResult;
}

export interface Submission {
  id: number;
  code: string;
  timestamp: string;
  author: string;
}
