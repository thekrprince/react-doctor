import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXAMPLES } from './examples';
import type { DiagnosticResult } from './examples';

// Helper to check if code matches any example
export function findMatchingExample(code: string) {
  const normalizedInput = code.trim().replace(/\s+/g, ' ');
  return EXAMPLES.find(ex => {
    const normalizedExample = ex.code.trim().replace(/\s+/g, ' ');
    return normalizedInput.includes(normalizedExample) || normalizedExample.includes(normalizedInput);
  });
}

// Custom simple fallback mock analyzer for custom components when key is missing
function generateMockDiagnosis(code: string): DiagnosticResult {
  const performanceIssues = [];
  const a11yIssues = [];
  const bestPracticesIssues = [];
  const securityIssues = [];
  const bundleIssues = [];
  
  let score = 90;

  if (code.includes('useEffect') && !code.includes('],') && !code.includes('];') && !code.includes('[]')) {
    performanceIssues.push({
      issue: "Potential infinite loop in useEffect due to missing dependency array.",
      severity: "high" as const,
      solution: "Add a dependency array to your useEffect hook.",
      line: 1
    });
    score -= 25;
  }

  if (code.includes('dangerouslySetInnerHTML')) {
    securityIssues.push({
      issue: "Usage of dangerouslySetInnerHTML detected.",
      severity: "high" as const,
      solution: "Sanitize the input HTML using DOMPurify before rendering it, or use standard text elements.",
      line: 1
    });
    score -= 30;
  }

  if (code.includes('img') && !code.includes('alt=')) {
    a11yIssues.push({
      issue: "Image tag missing an alt attribute.",
      severity: "medium" as const,
      solution: "Add alt=\"\" for decorative images or descriptive text for accessible images.",
      line: 1
    });
    score -= 15;
  }

  if (code.includes('onClick') && (code.includes('<div') || code.includes('<span')) && !code.includes('role=')) {
    a11yIssues.push({
      issue: "Click handler on non-interactive element.",
      severity: "high" as const,
      solution: "Change to a native <button> element or add role=\"button\" and key handlers.",
      line: 1
    });
    score -= 20;
  }

  if (code.includes('import * as') || code.includes("import _ from 'lodash'")) {
    bundleIssues.push({
      issue: "Wildcard or full library imports causing bundle bloat.",
      severity: "medium" as const,
      solution: "Import individual components or utilities (e.g. import { map } from 'lodash-es') or use native browser features.",
      line: 1
    });
    score -= 15;
  }

  if (code.includes('.map((item, index)')) {
    bestPracticesIssues.push({
      issue: "Using array index as key in map loop.",
      severity: "medium" as const,
      solution: "Use a unique stable property like item.id for the key.",
      line: 1
    });
    score -= 10;
  }

  score = Math.max(10, score);

  return {
    score,
    summary: `[MOCK MODE] Pre-audit completed for this custom component. Detected ${performanceIssues.length + a11yIssues.length + bestPracticesIssues.length + securityIssues.length + bundleIssues.length} warning items. Configure your Gemini API Key in the settings (gear icon) to run actual AI diagnostics.`,
    categories: {
      performance: performanceIssues,
      a11y: a11yIssues,
      bestPractices: bestPracticesIssues,
      security: securityIssues,
      bundle: bundleIssues
    },
    refactoredCode: `// Mock Refactored Code Preview\n// Configure Gemini API Key in settings to get real suggestions.\n\n${code}`
  };
}

export async function analyzeReactComponent(
  code: string,
  apiKey: string | null,
  modelName: string = 'gemini-2.5-flash'
): Promise<DiagnosticResult> {
  // 1. Check if it matches an example (even if key is provided, we can return the high-quality predefined report)
  const exampleMatch = findMatchingExample(code);
  if (exampleMatch) {
    return exampleMatch.mockResult;
  }

  // 2. If no key, return custom simulated mock feedback
  const actualApiKey = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
  if (!actualApiKey) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockDiagnosis(code)), 1500); // simulate delay
    });
  }

  // 3. Run actual Gemini diagnostics
  const genAI = new GoogleGenerativeAI(actualApiKey);
  
  const systemInstruction = `You are "React Doctor", a highly advanced React component compiler, optimizer, and security auditor.
Analyze the provided React component and return a detailed diagnostic JSON report.
Be extremely critical. Verify hook dependency arrays, check a11y tags, check security issues, and check bundle sizing.

You must return a JSON object adhering to this schema:
{
  "score": number (0 to 100 representing component quality),
  "summary": "String detailing the diagnosis summary",
  "categories": {
    "performance": [
      { "issue": "Description of performance issue", "severity": "high" | "medium" | "low", "solution": "How to fix it", "line": number }
    ],
    "a11y": [
      { "issue": "Accessibility violation", "severity": "high" | "medium" | "low", "solution": "How to fix it", "line": number }
    ],
    "bestPractices": [
      { "issue": "Best practice violation", "severity": "high" | "medium" | "low", "solution": "How to fix it", "line": number }
    ],
    "security": [
      { "issue": "Security risk or vulnerability", "severity": "high" | "medium" | "low", "solution": "How to fix it", "line": number }
    ],
    "bundle": [
      { "issue": "Bundle size or import optimization issue", "severity": "high" | "medium" | "low", "solution": "How to fix it", "line": number }
    ]
  },
  "refactoredCode": "The fully refactored, beautiful, optimized, and type-safe React component code"
}

Ensure the "refactoredCode" is clean, syntax-valid React component code, with no surrounding markdown, just the code itself.
`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: systemInstruction,
    });

    const prompt = `Analyze this React component code:\n\n\`\`\`tsx\n${code}\n\`\`\``;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const parsed: DiagnosticResult = JSON.parse(responseText);
    return parsed;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to analyze component using Gemini. Check your API key.");
  }
}
