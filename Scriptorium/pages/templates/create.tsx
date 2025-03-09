// pages/templates/create.tsx


import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/CreateTemplatePage.module.css';
import Navbar from '../../components/navbar';

export default function CreateTemplatePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState('');
  const [stdin, setStdin] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a template.');
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          code,
          language,
          stdin,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Template created successfully!');
        router.push('/templates');
      } else {
        alert('Error creating template: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('An error occurred while creating the template.');
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

      <h1 className={styles.title}>Create Template</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${styles.input} ${isDarkMode ? styles.darkInput : ''}`}
            required
          />
        </label>

        <label className={styles.label}>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${styles.textarea} ${isDarkMode ? styles.darkTextarea : ''}`}
            required
          />
        </label>

        <label className={styles.label}>
          Language:
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`${styles.select} ${isDarkMode ? styles.darkSelect : ''}`}
            required
          >
            <option value="">Select a language</option>
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
        </label>

        <label className={styles.label}>
          Code:
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${styles.textarea} ${isDarkMode ? styles.darkTextarea : ''}`}
            required
          />
        </label>

        <label className={styles.label}>
          Standard Input:
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            className={`${styles.textarea} ${isDarkMode ? styles.darkTextarea : ''}`}
          />
        </label>

        <label className={styles.label}>
          Tags (comma-separated):
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={`${styles.input} ${isDarkMode ? styles.darkInput : ''}`}
          />
        </label>

        <button type="submit" className={`${styles.submitButton} ${isDarkMode ? styles.darkSubmitButton : ''}`}>
          Create Template
        </button>
      </form>
    </div>
  );
}
