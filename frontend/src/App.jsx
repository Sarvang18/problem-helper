import { useState } from "react";
import { patterns } from "./patternEngine";

function App() {
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [interviewMode, setInterviewMode] = useState(false);

  /* =========================
     Utility Functions
     ========================= */

  const looksLikeCode = (text) => {
    const codeIndicators = [
      "for(",
      "while(",
      "if(",
      "return",
      "{",
      "}",
      ";",
      "#include",
      "int ",
      "vector<",
      "def ",
      "class "
    ];
    return codeIndicators.some((kw) => text.includes(kw));
  };

  const isLargeConstraint = (text) => {
    return /10\^5|10\^6|2e5|1e5|200000/.test(text);
  };

  /* =========================
     Problem Decomposition
     ========================= */

  const decomposeProblem = (text) => {
    const lower = text.toLowerCase();

    let inputs = "Not clearly identified";
    let operations = "Not clearly identified";
    let bottleneck = "Depends on constraints";

    if (lower.includes("array")) inputs = "Array of elements";
    if (lower.includes("nodes") || lower.includes("graph"))
      inputs = "Graph / nodes and edges";

    if (lower.includes("queries")) operations = "Repeated queries";
    if (lower.includes("connect")) operations = "Connectivity / union checks";
    if (lower.includes("subarray")) operations = "Subarray processing";

    if (isLargeConstraint(lower))
      bottleneck = "Large input size (time complexity critical)";

    return { inputs, operations, bottleneck };
  };

  /* =========================
     Learning Memory
     ========================= */

  const updateLearningStats = (patternName, hintLvl) => {
    const stats = JSON.parse(localStorage.getItem("learningStats")) || {};

    if (!stats[patternName]) {
      stats[patternName] = { attempts: 0, maxHintUsed: 0 };
    }

    stats[patternName].attempts += 1;
    stats[patternName].maxHintUsed = Math.max(
      stats[patternName].maxHintUsed,
      hintLvl
    );

    localStorage.setItem("learningStats", JSON.stringify(stats));
  };

  const getLearningStats = () => {
    return JSON.parse(localStorage.getItem("learningStats")) || {};
  };

  const resetLearningStats = () => {
    localStorage.removeItem("learningStats");
    setSessionSummary(null);
    alert("Learning data reset.");
  };

  /* =========================
     Practice Recommendation
     ========================= */

  const getPracticeAdvice = () => {
    const stats = getLearningStats();
    const advice = [];

    for (let pattern in stats) {
      const d = stats[pattern];
      if (d.maxHintUsed >= 3)
        advice.push(`Weak in ${pattern}. Practice more problems.`);
      else if (d.maxHintUsed === 2)
        advice.push(`Improving in ${pattern}. Keep practicing.`);
    }
    return advice;
  };

  /* =========================
     Core Logic
     ========================= */

  const getHint = () => {
    setSessionSummary(null);

    if (looksLikeCode(problem)) {
      setHintLevel(1);
      setResult([
        {
          name: "Thinking First Mode",
          note: "Solution blocked",
          reason:
            "This system enforces approach-first thinking, not code debugging.",
          decomposition: decomposeProblem(problem)
        }
      ]);
      return;
    }

    const text = problem.toLowerCase();
    const largeInput = isLargeConstraint(text);
    const decomposition = decomposeProblem(text);

    setHintLevel(1);

    const matched = [];
    for (let p of patterns) {
      for (let k of p.keywords) {
        if (text.includes(k)) {
          matched.push(p);
          break;
        }
      }
    }

    if (matched.length === 0) {
      setResult([
        {
          name: "General Problem Solving",
          note: "Recommended",
          reason:
            "Decompose the problem into inputs, operations, and constraints.",
          decomposition
        }
      ]);
      return;
    }

    setResult(
      matched.map((p) => ({
        ...p,
        note:
          largeInput && p.name.toLowerCase().includes("dynamic programming")
            ? "May TLE for large constraints"
            : "Recommended",
        decomposition
      }))
    );
  };

  const getHintText = (pattern, level) => {
    if (level === 1)
      return "Direction: Identify the repeated operation.";
    if (level === 2)
      return `Approach: Consider using ${pattern.name}.`;
    if (level === 3)
      return `Reasoning: ${pattern.reason}`;
    return "";
  };

  const learningStats = getLearningStats();
  const practiceAdvice = getPracticeAdvice();

  /* =========================
     UI
     ========================= */

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Problem Helper</h1>

      <label>
        <input
          type="checkbox"
          checked={interviewMode}
          onChange={() => setInterviewMode(!interviewMode)}
        />
        Interview Mode
      </label>

      <br /><br />

      <textarea
        rows="10"
        cols="80"
        placeholder="Paste problem statement (not code)"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <br /><br />

      <button onClick={getHint}>Get Hint</button>

      {interviewMode && (
        <>
          <hr />
          <h3>System Explanation (Interview Mode)</h3>
          <p>
            This system analyzes problem statements, detects algorithmic
            patterns, evaluates constraints, and provides progressive hints
            without revealing solutions. It tracks user weaknesses and
            recommends focused practice.
          </p>
        </>
      )}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Analysis & Hints</h3>

          {result.map((r, i) => (
            <div key={i} style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "15px" }}>
              <p><b>{r.name}</b> — {r.note}</p>

              {r.decomposition && (
                <>
                  <p><b>Inputs:</b> {r.decomposition.inputs}</p>
                  <p><b>Operations:</b> {r.decomposition.operations}</p>
                  <p><b>Bottleneck:</b> {r.decomposition.bottleneck}</p>
                </>
              )}

              {hintLevel >= 1 && <p>{getHintText(r, 1)}</p>}
              {hintLevel >= 2 && <p>{getHintText(r, 2)}</p>}
              {hintLevel >= 3 && <p>{getHintText(r, 3)}</p>}
            </div>
          ))}

          {hintLevel < 3 && (
            <button
              onClick={() => {
                const next = hintLevel + 1;
                setHintLevel(next);
                if (result && result[0])
                  updateLearningStats(result[0].name, next);
              }}
            >
              Unlock Next Hint
            </button>
          )}
        </div>
      )}

      <hr />
      <h3>Learning Insights</h3>

      {Object.keys(learningStats).length === 0 ? (
        <p>No learning data yet.</p>
      ) : (
        Object.entries(learningStats).map(([p, d], i) => (
          <p key={i}>
            <b>{p}</b> → attempts: {d.attempts}, max hint: {d.maxHintUsed}
          </p>
        ))
      )}

      <button onClick={resetLearningStats}>Reset Learning Data</button>

      <hr />
      <h3>Practice Recommendations</h3>

      {practiceAdvice.length === 0
        ? <p>You are doing well. Keep practicing.</p>
        : practiceAdvice.map((a, i) => <p key={i}>{a}</p>)}
    </div>
  );
}

export default App;
