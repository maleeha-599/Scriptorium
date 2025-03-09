// pages/templates/my-templates.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/myTemplates.module.css';
import Navbar from '../../components/navbar';

export default function MyTemplatesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Fetch user's templates
  useEffect(() => {
    const fetchMyTemplates = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/templates/my-templates', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          console.log('Fetched templates:', data.templates); // Debugging line
          setTemplates(data.templates);
        } else {
          console.error('Error fetching my templates:', data.error);
        }
      } catch (error) {
        console.error('Error fetching my templates:', error);
      }
    };

    if (isLoggedIn) {
      fetchMyTemplates();
    }
  }, [isLoggedIn]);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleEdit = (templateId) => {
    router.push(`/templates/edit/${templateId}`);
  };

  const handleDelete = async (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setTemplates((prevTemplates) => prevTemplates.filter((t) => t.id !== templateId));
          alert('Template deleted successfully.');
        } else {
          const data = await response.json();
          console.error('Error deleting template:', data.error);
          alert('Error deleting template: ' + data.error);
        }
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Error deleting template.');
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Navbar fixed at the top */}
      <div className={styles.navigationButtonWrapper}>
        <Navbar />
      </div>
  
      {/* Dark Mode Toggle */}
      <div className={styles.darkModeButtonWrapper}>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={styles.darkModeButton}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
  
      {/* Main Content */}
      <h1 className={styles.title}>My Templates</h1>
      {templates.length > 0 ? (
        <div className={styles.templateList}>
          {templates.map((template) => (
            <div
              key={template.id}
              className={`${styles.templateCard} ${isDarkMode ? styles.darkTemplateCard : ''}`}
            >
              <h2 className={styles.templateTitle}>{template.title}</h2>
              <p className={styles.templateDescription}>{template.description}</p>
              <div className={styles.tagsContainer}>
                {template.tags.map((tag) => (
                  <span key={tag.id} className={styles.tag}>
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => handleEdit(template.id)}
                  className={styles.editButton}
                >
                  Modify
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noTemplatesMessage}>
          You have not created any templates yet.
        </p>
      )}
    </div>
  );
}  