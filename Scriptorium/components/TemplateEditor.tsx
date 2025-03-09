// components/TemplateEditor.tsx

import { useState, useEffect } from 'react';
import styles from '../styles/TemplateEditor.module.css';

interface TemplateEditorProps {
  onSubmit: (templateData: TemplateData) => void;
  onDelete?: () => void; // Optional prop for deletion
  isDarkMode: boolean;
  initialData?: TemplateData;
}

interface TemplateData {
  id?: string; // Optional id for editing
  title: string;
  description: string;
  code: string;
  language: string;
  tags?: string[]; // Made optional
  stdin?: string;
}

export default function TemplateEditor({
  onSubmit,
  onDelete,
  isDarkMode,
  initialData,
}: TemplateEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [tagsInput, setTagsInput] = useState(''); // Input as string
  const [stdin, setStdin] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCode(initialData.code);
      setLanguage(initialData.language);
      // Handle tags: array or undefined
      if (initialData.tags && Array.isArray(initialData.tags)) {
        setTagsInput(initialData.tags.join(', '));
      } else {
        setTagsInput(''); // Default to empty string if tags are undefined or not an array
      }
      setStdin(initialData.stdin || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert comma-separated string to array
    const tagsArray = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    const templateData: TemplateData = {
      ...(initialData?.id && { id: initialData.id }),
      title,
      description,
      code,
      language,
      tags: tagsArray,
      stdin: stdin || '',
    };
    onSubmit(templateData);
  };

  const handleDelete = () => {
    if (onDelete) {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this template?'
      );
      if (confirmDelete) {
        onDelete();
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${isDarkMode ? styles.darkForm : ''}`}
    >
      <h2 className={styles.formTitle}>
        {initialData?.id ? 'Edit Template' : 'Create Template'}
      </h2>

      <label className={styles.label}>
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${styles.input} ${
            isDarkMode ? styles.darkInput : ''
          }`}
          required
        />
      </label>

      <label className={styles.label}>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${styles.textarea} ${
            isDarkMode ? styles.darkTextarea : ''
          }`}
          required
        />
      </label>

      <label className={styles.label}>
        Code:
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`${styles.codeEditor} ${
            isDarkMode ? styles.darkCodeEditor : ''
          }`}
          required
        />
      </label>

      <label className={styles.label}>
        Language:
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`${styles.input} ${
            isDarkMode ? styles.darkInput : ''
          }`}
          required
        />
      </label>

      <label className={styles.label}>
        Standard Input (stdin):
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          className={`${styles.textarea} ${
            isDarkMode ? styles.darkTextarea : ''
          }`}
          placeholder="Optional input for your code"
        />
      </label>

      <label className={styles.label}>
        Tags (comma-separated):
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={`${styles.input} ${
            isDarkMode ? styles.darkInput : ''
          }`}
        />
      </label>

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.submitButton}>
          {initialData?.id ? 'Update Template' : 'Create Template'}
        </button>
        {initialData?.id && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className={styles.deleteButton}
          >
            Delete Template
          </button>
        )}
      </div>
    </form>
  );
}
