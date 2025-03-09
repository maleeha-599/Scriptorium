// pages/templates/index.tsx

import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from "../../styles/templates.module.css";
import Navbar from '../../components/navbar';

export default function TemplatesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const templatesPerPage = 5;
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        let endpoint = '';
        let data = null;

        if (searchTerm) {
          // When a search term is provided, fetch templates matching the search term
          endpoint = `/api/templates?search=${encodeURIComponent(searchTerm)}`;
          const response = await fetch(endpoint);
          data = await response.json();

          if (response.ok) {
            setTemplates(data.templates || []);
            setTotalPages(1);
          } else {
            setTemplates([]);
            console.error("No templates found:", data.error || "No templates match the search term.");
          }
        } else {
          // When no search term is provided, fetch templates with pagination
          endpoint = `/api/templates?page=${currentPage}&limit=${templatesPerPage}`;
          const response = await fetch(endpoint);
          data = await response.json();

          if (response.ok) {
            setTemplates(data.templates || []);
            setTotalPages(data.pagination?.totalPages || 1);
          } else {
            console.error("Error fetching templates:", data.error || "Unknown error");
          }
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [searchTerm, currentPage]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? "dark" : ""}`}>
      {/* Navigation Button */}
      <div className={styles.navigationButtonWrapper}>
        <Navbar/>
      </div>

      {/* Dark Mode Toggle */}
      <div className={styles.darkModeButtonWrapper}>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={styles.darkModeButton}>
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Create Template Button */}
      {isLoggedIn && (
        <div className={styles.createButtonWrapper}>
          <button
            onClick={() => router.push('/templates/create')}
            className={styles.myTemplatesButton}
          >
            Create Template
          </button>
        </div>
      )}

      {/* My Templates Button */}
      {isLoggedIn && (
        <div className={styles.myTemplatesButtonWrapper}>
          <button
            onClick={() => router.push('/templates/my-templates')}
            className={styles.myTemplatesButton}
          >
            My Templates
          </button>
        </div>
      )}

      {/* Page Title */}
      <h1 className={styles.title}>Templates</h1>

      {/* Search Bar */}
      <div className={styles.searchBarContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          placeholder="Search by title or tag..."
          className={`${styles.searchInput} ${isDarkMode ? styles.darkInput : ""}`}
        />
      </div>

      {/* Display Loading Indicator */}
      {isLoading && <p className={styles.loadingMessage}>Loading templates...</p>}

      {/* Display Templates */}
      {templates.length > 0 && (
        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <div
              key={template.id}
              className={`${styles.templateCard} ${isDarkMode ? styles.darkTemplateCard : ""}`}
            >
              <h2 className={styles.templateTitle}>{template.title}</h2>
              <p className={styles.templateDescription}>{template.description}</p>
              <div className={styles.tagsContainer}>
                {template.tags.map((tag) => (
                  <span key={tag.id} className={`${styles.tag} ${isDarkMode ? styles.darkTag : ""}`}>
                    {tag.name}
                  </span>
                ))}
              </div>
              <button
                className={styles.buttonLink}
                onClick={() => router.push(`/templates/run/${template.id}`)}
              >
                Run Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Display Message if No Templates Available */}
      {templates.length === 0 && !isLoading && (
        <p className={styles.noResultsMessage}>
          {searchTerm ? `No templates found matching "${searchTerm}"` : "No templates available."}
        </p>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            className={`${styles.paginationButton} ${isDarkMode ? styles.darkPaginationButton : ""}`}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={styles.pageIndicator}>Page {currentPage}</span>
          <button
            className={`${styles.paginationButton} ${isDarkMode ? styles.darkPaginationButton : ""}`}
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
