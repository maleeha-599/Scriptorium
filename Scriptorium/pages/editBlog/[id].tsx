import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from "../../styles/editBlog.module.css";
import Navbar from '../../components/navbar'

const EditBlog = () => {
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetch(`/api/auth/blog/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPost(data);
          setTitle(data.title);
          setDescription(data.description);
          setContent(data.content);
        })
        .catch(() => setError('Error fetching post details.'));
    }
  }, [id]);

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not authorized to perform this action.');
      return;
    }

    try {
      const res = await fetch(`/api/auth/blog/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, content, tags }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to update post');
        return;
      }

      const updatedPost = await res.json();
      router.push(`/blogs/${updatedPost.id}`);
    } catch {
      setError('Error updating the post.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.container}>
      <Navbar />
      </div>
      
      <h1 className={styles.title}>Edit Blog Post</h1>
      {error && <div className={styles.error}>{error}</div>}
      {post ? (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <label className={styles.label}>Description</label>
          <input
            className={styles.input}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className={styles.label}>Content</label>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className={styles.label}>Tags</label>
          <input
            className={styles.input}
            type="text"
            value={tags.join(', ')}
            onChange={(e) =>
              setTags(e.target.value.split(',').map((tag) => tag.trim()))
            }
          />

          <button className={styles.button} onClick={handleUpdate}>
            Save Changes
          </button>
        </form>
      ) : (
        <p className={styles.loading}>Loading post...</p>
      )}
    </div>
  );
};

export default EditBlog;
