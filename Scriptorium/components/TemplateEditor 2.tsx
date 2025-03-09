// components/TemplateEditor.tsx

import { useState, useEffect } from 'react';
import styles from '../styles/TemplateEditor.module.css';

interface TemplateEditorProps {
  onSubmit: (templateData: TemplateData) => void;
  isDarkMode: boolean;
  initialData?: TemplateData;
}

interface TemplateData {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string;
  stdin?: string;
}

export default function TemplateEditor({ onSubmit, isDarkMode, initialData }: TemplateEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState('');
  const [stdin, setStdin] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCode(initialData.code);
      setLanguage(initialData.language);
      setTags(initialData.tags);
      setStdin(initialData.stdin || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const templateData: TemplateData = {
      title,
      description,
      code,
      language,
      tags,
      stdin: stdin || null,
    };
    onSubmit(templateData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${isDarkMode ? styles.darkForm : ''}`}
    >
      <h2 className={styles.formTitle}>Template Editor</h2>

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
        Code:
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`${styles.codeEditor} ${isDarkMode ? styles.darkCodeEditor : ''}`}
          required
        />
      </label>

      <label className={styles.label}>
        Language:
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`${styles.input} ${isDarkMode ? styles.darkInput : ''}`}
          required
        />
      </label>

      <label className={styles.label}>
        Standard Input (stdin):
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          className={`${styles.textarea} ${isDarkMode ? styles.darkTextarea : ''}`}
          placeholder="Optional input for your code"
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

      <button type="submit" className={styles.submitButton}>
        Submit
      </button>
    </form>
  );
}
