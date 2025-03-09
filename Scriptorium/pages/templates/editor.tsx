// pages/templates/editor.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import TemplateEditor from '../../components/TemplateEditor';
import styles from '../../styles/EditorPage.module.css';

export default function EditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<{
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    stdin?: string;
  } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTemplate(id as string);
    }
  }, [id]);

  const fetchTemplate = async (templateId: string) => {
    try {
      const response = await axios.get(`/api/templates/${templateId}`);
      // Ensure that the response data includes the necessary fields
      const fetchedTemplate = {
        id: response.data.id,
        title: response.data.title,
        description: response.data.description,
        code: response.data.code,
        language: response.data.language,
        tags: response.data.tags || [], // Ensure tags is always an array
        stdin: response.data.stdin,
      };
      setTemplate(fetchedTemplate);
    } catch (error: any) {
      console.error('Error fetching template:', error);
      alert(
        `Error fetching template: ${error.response?.data?.error || 'Unknown error'}`
      );
      router.push('/templates');
    }
  };

  const handleSubmit = async (templateData: TemplateData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to edit templates.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      if (templateData.id) {
        // Update existing template
        await axios.put(
          `/api/templates/${templateData.id}`,
          templateData,
          { headers }
        );
        alert('Template updated successfully!');
      } else {
        // Create new template
        await axios.post('/api/templates', templateData, { headers });
        alert('Template created successfully!');
      }

      router.push('/templates');
    } catch (error: any) {
      console.error('Error submitting template:', error);
      alert(
        `Error submitting template: ${
          error.response?.data?.error || 'Unknown error'
        }`
      );
    }
  };

  const handleDelete = async () => {
    if (!template) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to delete templates.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`/api/templates/${template.id}`, { headers });
      alert('Template deleted successfully!');
      router.push('/templates');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      alert(
        `Error deleting template: ${
          error.response?.data?.error || 'Unknown error'
        }`
      );
    }
  };

  if (id && !template) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={`${styles.pageContainer} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.navigationButtonWrapper}>
        <button
          onClick={() => router.push('/templates')}
          className={styles.navigationButton}
        >
          Back to Templates
        </button>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={styles.darkModeButton}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <TemplateEditor
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isDarkMode={isDarkMode}
        initialData={template || undefined} // Pass undefined if creating a new template
      />
    </div>
  );
}
