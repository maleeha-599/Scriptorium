import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from "../styles/flagPost.module.css";
import Navbar from '../components/navbar'

const FlagPost = () => {
  const router = useRouter();
  const { type, id } = router.query; // Extract 'type' and 'id' from the query
  const [explanation, setExplanation] = useState('');
  const [postId, setPostId] = useState('');
  const [commentId, setCommentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the type and id are available in the query, set the postId or commentId accordingly
    if (type && id) {
      if (type === 'blogPost') {
        setPostId(id as string); // Set the postId if the type is 'blogPost'
        setCommentId(''); // Clear commentId
      } else if (type === 'comment') {
        setCommentId(id as string); // Set the commentId if the type is 'comment'
        setPostId(''); // Clear postId
      }
    }
  }, [type, id]); // Only update when type or id change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token'); // Assuming auth token is stored in localStorage

    if (!token) {
      setError('You must be signed in to report content');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/flagging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ explanation, postId, commentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        alert("Thank you for submitting a report!");
        // Optionally, redirect to another page or reset the form
        router.push('/blogs/idx'); // Example: redirect to a thank you page
      }
    } catch (error) {
      console.error('Error flagging content:', error);
      setError('Error reporting content');
    }

    setLoading(false);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Include the Navbar */}
      <Navbar />

      {/* Main content container */}
      <div className={styles.content}>
        <h1 className={styles.heading}>Flag Post or Comment</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="explanation" className={styles.formLabel}>Explanation:</label>
            <textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              required
              placeholder="Provide a reason for flagging the post or comment"
              className={styles.textarea}
            />
          </div>

          {type === 'blogPost' && (
            <div>
              <label htmlFor="postId" className={styles.formLabel}>Post ID:</label>
              <input
                type="text"
                id="postId"
                value={postId}
                readOnly
                className={styles.readOnly}
              />
            </div>
          )}

          {type === 'comment' && (
            <div>
              <label htmlFor="commentId" className={styles.formLabel}>Comment ID:</label>
              <input
                type="text"
                id="commentId"
                value={commentId}
                readOnly
                className={styles.readOnly}
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FlagPost;