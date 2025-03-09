// pages/code/index.tsx

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import styles from "../styles/OnlineIDE.module.css";
import { useRouter } from 'next/router';
import Navbar from '../components/navbar';

export default function OnlineIDE() {
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("python");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const executeCode = async () => {
    try {
      const response = await fetch('/api/code/run', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeContent: code, language, stdin }),
      });

      const result = await response.json();

      if (response.ok) {
        setOutput(result.output || "No Output");
        setError(result.error || "No Errors");
      } else {
        setError(result.error || "An unknown error occurred.");
        setOutput("");
      }
    } catch (err) {
      console.error("Error executing code:", err);
      setError("An error occurred while executing the code.");
    }
  };

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className={`${styles.container} ${isDarkMode ? "dark" : ""}`}>
      {/* Navigation Buttons */}
      <div className={styles.navigationButtonWrapper}>
        <Navbar/>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={styles.darkModeButton}>
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <h1 className={styles.title}>Online IDE</h1>

      {/* Language Selection */}
      <div className={styles.languageSelector}>
        <label htmlFor="language">Language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={styles.languageDropdown}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="c++">C++</option>
          <option value="ruby">Ruby</option>
          <option value="go">Go</option>
          <option value="php">PHP</option>
          <option value="rust">Rust</option>
          <option value="swift">Swift</option>
          <option value="kotlin">Kotlin</option>
          <option value="csharp">C#</option>
          <option value="perl">Perl</option>
          <option value="haskell">Haskell</option>
          <option value="r">R</option>
        </select>
      </div>

      {/* Code Editor */}
      <Editor
        height="400px"
        language={language}
        theme={isDarkMode ? "vs-dark" : "light"}
        value={code}
        onChange={(value) => setCode(value)}
      />

      {/* Input Editor */}
      <textarea
        className={`${styles.inputEditor} ${isDarkMode ? styles.darkInputEditor : ""}`}
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        rows={3}
        placeholder="Enter input for your program here..."
      ></textarea>

      {/* Execute Button */}
      <button
        onClick={executeCode}
        className={`${styles.executeButton} ${isDarkMode ? styles.darkExecuteButton : ""}`}
      >
        Run Code
      </button>

      {/* Output and Error Display */}
      <div className={styles.outputContainer}>
        <h3>Output:</h3>
        <pre className={`${styles.outputBox} ${isDarkMode ? styles.darkOutputBox : ""}`}>
          {output || "No Output Yet"}
        </pre>
        <h3>Error:</h3>
        <pre className={`${styles.errorBox} ${isDarkMode ? styles.darkErrorBox : ""}`}>
          {error || "No Errors"}
        </pre>
      </div>
    </div>
  );
}
