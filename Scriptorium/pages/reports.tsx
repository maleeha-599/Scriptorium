import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/reports.module.css'; // Adjust path if needed
import Navbar from '@/components/navbar';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/admin/reports`, {
        params: { page, pageSize },
      });
      setReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to fetch reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleHidePost = async (postId) => {
    try {
      const response = await axios.patch(`/api/admin/content/${postId}`);
      alert(response.data.message);
      fetchReports(); // Refresh reports list after hiding the post
    } catch (err) {
      console.error('Failed to hide post:', err);
      alert('Failed to hide post. Please try again.');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className={styles.reportsContainer}>
<div>
  <Navbar/>
</div>

      <h1 className={styles.heading}>Reported Posts</h1>

      {loading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p className={styles.noReports}>No reports found.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <>
          <table className={styles.reportsTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Explanation</th>
                <th>Reported By</th>
                <th>Post Title</th>
                <th>Post Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.explanation}</td>
                  <td>{`${report.reporter.first_name} ${report.reporter.last_name}`}</td>
                  <td>{report.post?.title || 'N/A'}</td>
                  <td>{report.post?.description || 'N/A'}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className={styles.hideButton}
                      onClick={() => handleHidePost(report.post.id)}
                    >
                      Hide
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <button onClick={handlePreviousPage} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page}</span>
            <button onClick={handleNextPage}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
