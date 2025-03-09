// pages/templates/run/[id].tsx

import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from "../../../styles/TemplateIDE.module.css";
import Editor from "@monaco-editor/react";

export default function TemplateIDEPage() {
  const [template, setTemplate] = useState(null);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const { id } = router.query;
    if (!id) return;

    // Fetch the template by ID
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${id}`);
        const data = await response.json();
        if (response.ok) {
          setTemplate(data);
          setCode(data.code);
          setStdin(data.stdin || "");
        } else {
          console.error("Error fetching template:", data.error);
        }
      } catch (err) {
        console.error("Error fetching template:", err);
      }
    };
    fetchTemplate();
  }, [router.isReady, router.query]);

  const executeCode = async () => {
    if (!template) return;

    try {
      const response = await fetch('/api/code/run', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeContent: code, language: template.language, stdin }),
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

  const forkTemplate = async () => {
    if (!template) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to save a template.');
      return;
    }

    try {
      const response = await fetch(`/api/templates/fork/${template.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          stdin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Template forked successfully!');
        // Optionally redirect to the new template or refresh the list
      } else {
        alert('Error forking template: ' + data.error);
        console.error('Forking error details:', data.details);
      }
    } catch (error) {
      console.error('Error forking template:', error);
      alert('An error occurred while forking the template.');
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
        <button onClick={() => router.back()} className={styles.navigationButton}>
          Back
        </button>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={styles.darkModeButton}>
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {template ? (
        <>
          <h1 className={styles.title}>{template.title}</h1>
          {/* Display Template ID */}
          <p className={styles.templateId}>Template ID: {router.query.id}</p>  {/* This will show the ID from the URL */}


          {/* Code Editor */}
          <Editor
            height="400px"
            language={template.language}
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

          {/* Save Template Button for Logged-In Users */}
          {isLoggedIn && (
            <button
              onClick={forkTemplate}
              className={`${styles.saveButton} ${isDarkMode ? styles.darkSaveButton : ""}`}
            >
              Save Template
            </button>
          )}

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
        </>
      ) : (
        <p>Loading template...</p>
      )}
    </div>
  );
}
