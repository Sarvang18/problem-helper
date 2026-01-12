import { useState } from "react";
import { patterns } from "./patternEngine";

function App() {
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);

  // Very basic constraint detector (large input heuristic)
  const isLargeConstraint = (text) => {
    const match = text.match(/10\^5|10\^6|2e5|1e5|200000/);
    return match !== null;
  };

  const getHint = () => {
    const text = problem.toLowerCase();
    const largeInput = isLargeConstraint(text);

    setHintLevel(1); // reset and start hint flow

    const matchedPatterns = [];

    for (let pattern of patterns) {
      for (let key of pattern.keywords) {
        if (text.includes(key)) {
          matchedPatterns.push(pattern);
          break;
        }
      }
    }

    if (matchedPatterns.length === 0) {
      setResult([
        {
          name: "General Problem Solving",
          reason:
            "Break the problem into operations, constraints, and repeated steps.",
          note: "Recommended"
        }
      ]);
      return;
    }

    // Rank patterns based on constraints
    const ranked = matchedPatterns.map((p) => {
      if (largeInput && p.name.toLowerCase().includes("dynamic programming")) {
        return {
          ...p,
          note: "May TLE for large constraints"
        };
      }
      return {
        ...p,
        note: "Recommended"
      };
    });

    setResult(ranked);
  };

  // Progressive hint text
  const getHintText = (pattern, level) => {
    if (level === 1) {
      return `Direction: Identify the core operation this problem repeats.`;
    }

    if (level === 2) {
      return `Approach: Consider using ${pattern.name}.`;
    }

    if (level === 3) {
      return `Reasoning: ${pattern.reason}`;
    }

    return "";
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Problem Helper</h1>

      <textarea
        rows="10"
        cols="80"
        placeholder="Paste the full problem statement here (LeetCode / Codeforces etc.)"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <br />
      <br />

      <button onClick={getHint}>Get Hint</button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Progressive Hints</h3>

          {result.map((r, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #ccc"
              }}
            >
              <p>
                <b>{r.name}</b> — {r.note}
              </p>

              {hintLevel >= 1 && <p>{getHintText(r, 1)}</p>}
              {hintLevel >= 2 && <p>{getHintText(r, 2)}</p>}
              {hintLevel >= 3 && <p>{getHintText(r, 3)}</p>}
            </div>
          ))}

          {hintLevel < 3 && (
            <button onClick={() => setHintLevel(hintLevel + 1)}>
              Unlock Next Hint
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
