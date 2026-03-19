import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("submissions.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    author TEXT
  )
`);

// Add dummy data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM submissions").get() as { count: number };
if (count.count === 0) {
  const dummySubmissions = [
    {
      author: "Sample Student 1",
      code: `public class Factorial {
    public static int calculate(int n) {
        if (n == 0) return 1;
        return n * calculate(n - 1);
    }
    
    public static void main(String[] args) {
        System.out.println(calculate(5));
    }
}`
    },
    {
      author: "Sample Student 2",
      code: `import java.util.Scanner;

public class CircleArea {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter radius: ");
        double radius = scanner.nextDouble();
        double area = Math.PI * Math.pow(radius, 2);
        System.out.println("Area: " + area);
    }
}`
    },
    {
      author: "Sample Student 3",
      code: `public class BubbleSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}`
    }
  ];

  const insert = db.prepare("INSERT INTO submissions (code, author) VALUES (?, ?)");
  dummySubmissions.forEach(sub => insert.run(sub.code, sub.author));
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Feature Extraction Logic (Stylometry)
function extractFeatures(code: string) {
  const lines = code.split("\n");
  const totalLines = lines.length;
  const avgLineLength = lines.reduce((acc, line) => acc + line.length, 0) / totalLines || 0;
  
  const comments = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
  const commentRatio = comments / totalLines || 0;
  
  const indentationPatterns = lines.filter(l => l.startsWith("    ") || l.startsWith("\t")).length;
  const indentRatio = indentationPatterns / totalLines || 0;
  
  const functionCount = (code.match(/(public|private|protected|static|\s) +[\w\<\>\[\]]+\s+(\w+) *\([^\)]*\) *(\{?|[^;])/g) || []).length;
  const classCount = (code.match(/\b(class|interface|enum)\b\s+\w+/g) || []).length;
  
  const keywords = ["public", "private", "protected", "static", "final", "class", "interface", "extends", "implements", "new", "return", "if", "else", "for", "while", "try", "catch", "void", "int", "double", "boolean"];
  const keywordFreq: Record<string, number> = {};
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, "g");
    keywordFreq[kw] = (code.match(regex) || []).length;
  });

  return {
    totalLines,
    avgLineLength,
    commentRatio,
    indentRatio,
    functionCount,
    classCount,
    keywordFreq
  };
}

// Simple Similarity Check (Jaccard Similarity on tokens)
function calculateSimilarity(code1: string, code2: string) {
  const tokens1 = new Set(code1.split(/\W+/).filter(t => t.length > 2));
  const tokens2 = new Set(code2.split(/\W+/).filter(t => t.length > 2));
  
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return intersection.size / union.size;
}

// API Routes
app.post("/api/analyze", async (req, res) => {
  const { code, author } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    // 1. Feature Extraction
    const features = extractFeatures(code);

    // 2. Similarity Check
    const previousSubmissions = db.prepare("SELECT code FROM submissions").all() as { code: string }[];
    let maxSimilarity = 0;
    for (const sub of previousSubmissions) {
      const sim = calculateSimilarity(code, sub.code);
      if (sim > maxSimilarity) maxSimilarity = sim;
    }

    // 3. AI Detection (using Gemini)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following Java code and determine if it is likely AI-generated or human-written. 
      Consider variable naming, structure, and common LLM patterns. 
      Return a JSON object with:
      - ai_probability: (float 0-1)
      - reasoning: (string)
      - risk_level: (Low, Medium, High)
      
      Code:
      ${code}`,
      config: { responseMimeType: "application/json" }
    });

    const aiResponse = await model;
    const aiResult = JSON.parse(aiResponse.text || "{}");

    // 4. Store submission
    db.prepare("INSERT INTO submissions (code, author) VALUES (?, ?)").run(code, author || "Anonymous");

    res.json({
      features,
      similarity: {
        maxScore: maxSimilarity,
        status: maxSimilarity > 0.8 ? "High Risk" : maxSimilarity > 0.5 ? "Suspicious" : "Clean"
      },
      aiDetection: aiResult
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/submissions", (req, res) => {
  const submissions = db.prepare("SELECT * FROM submissions ORDER BY timestamp DESC LIMIT 10").all();
  res.json(submissions);
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
