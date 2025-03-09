// pages/templates/edit/[id].tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TemplateEditor from '../../../components/TemplateEditor';
import styles from '../../../styles/EditTemplatePage.module.css';

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = router.query;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Fetch the template data
  useEffect(() => {
    const fetchTemplate = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`/api/templates/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setTemplateData({
            ...data,
            tags: data.tags.map((tag) => tag.name).join(', '),
          });
        } else {
          console.error('Error fetching template:', data.error);
          setErrorMessage(data.error || 'Error fetching template data.');
          router.push('/templates/my-templates');
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        setErrorMessage('Error fetching template data.');
        router.push('/templates/my-templates');
      }
    };

    if (id && isLoggedIn) {
      fetchTemplate();
    }
  }, [id, isLoggedIn, router]);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTemplateSubmit = async (updatedData) => {
    if (!id) {
      setErrorMessage('Template ID is missing.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        router.push('/templates/my-templates');
      } else {
        const errorData = await response.json();
        console.error('Error updating template:', errorData.error);
        setErrorMessage(errorData.error || 'An error occurred while updating the template.');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      setErrorMessage('An error occurred while updating the template.');
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? 'dark' : ''}`}>
      {/* Navigation Button */}
      <div className={styles.navigationButtonWrapper}>
        <button onClick={() => router.push('/templates/my-templates')} className={styles.navigationButton}>
          Back to My Templates
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <div className={styles.darkModeButtonWrapper}>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={styles.darkModeButton}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Page Title */}
      <h1 className={styles.title}>Edit Template</h1>

      {/* Display Error Message */}
      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}

      {/* Template Editor */}
      {templateData ? (
        <TemplateEditor
          onSubmit={handleTemplateSubmit}
          isDarkMode={isDarkMode}
          initialData={templateData}
        />
      ) : (
        <p>Loading template data...</p>
      )}
    </div>
  );
}
