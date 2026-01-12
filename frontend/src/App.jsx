import { useState } from "react";

function App() {
  const [problem, setProblem] = useState("");
  const [hint, setHint] = useState("");

  const getHint = () => {
    if (problem.toLowerCase().includes("connect")) {
      setHint("Think about connectivity. A structure like DSU may help.");
    } else if (problem.toLowerCase().includes("subarray")) {
      setHint("This might involve a sliding window approach.");
    } else {
      setHint("Break the problem into operations and constraints.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Problem Helper</h1>

      <textarea
        rows="10"
        cols="80"
        placeholder="Paste the problem statement here..."
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <br /><br />

      <button onClick={getHint}>Get Hint</button>

      <h3>Hint:</h3>
      <p>{hint}</p>
    </div>
  );
}

export default App;
