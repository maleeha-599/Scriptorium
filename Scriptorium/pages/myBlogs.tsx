
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/myBlogs.module.css';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  author: { username: string };
  tags: Array<{ id: string; name: string }>;
  created_at: string;
  updated_at: string;
}

const MyBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalPosts: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/myBlogs?page=${page}&search=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('API Error:', errData);
        setError(errData.error || `Error: ${res.status}`);
        return;
      }

      const data = await res.json();
      setPosts(data.posts);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Network Error:', error);
      setError('Network error: Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsAuthenticated(true);

    fetch('/api/updateUser', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserName(data.user.first_name);
        setUserAvatar(data.user.avatar);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleDelete = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not authorized to perform this action.');
      return;
    }

    try {
      const res = await fetch(`/api/auth/blog/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('API Error:', errData);
        setError(errData.error || `Error: ${res.status}`);
        return;
      }

      const { message } = await res.json();
      setNotification(message);

      // Remove the deleted post from the state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setPagination((prev) => ({
        ...prev,
        totalPosts: prev.totalPosts - 1,
      }));
    } catch (error) {
      console.error('Network Error:', error);
      setError('Network error: Unable to delete the post.');
    }
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timeout = setTimeout(() => setNotification(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to logout:', response.statusText);
        return;
      }

      localStorage.removeItem('token');
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchPosts(pagination.currentPage);
  }, [pagination.currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  const truncateContent = (content: string, length: number) =>
    content.length > length ? content.substring(0, length) + '...' : content;

  const handleLogoClick = () => {
    router.push('/');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      {notification && <div className={styles.notification}>{notification}</div>}

      <header className={styles.header}>
        <img
          src="/uploads/logos/logo.png"
          alt="Logo"
          className={styles.logo}
          onClick={handleLogoClick}
        />
        <div className={styles.authButtons}>
          {!isAuthenticated ? (
            <>
              <button
                className={`${styles.button} ${styles.blueButton}`}
                onClick={() => router.push('/login')}
              >
                Login
              </button>
              <button
                className={`${styles.button} ${styles.blueButton}`}
                onClick={() => router.push('/signup')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <div className={styles.dropdownContainer}>
                <button
                  className={styles.profileButton}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {userAvatar && (
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className={styles.avatar}
                    />
                  )}
                  <span>Hi, {userName}!</span>
                </button>
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <button
                      onClick={() => router.push('/profile')}
                      className={styles.dropdownItem}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => router.push('/myBlogs')}
                      className={styles.dropdownItem}
                    >
                      My Blog Posts
                    </button>
                    <button
                      onClick={() => router.push('/templates/my-templates')}
                      className={styles.dropdownItem}
                    >
                      My Templates
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className={`${styles.button} ${styles.blueButton}`}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <div className={styles.mainContent}>
        <h1>Your Blog Posts</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.totalPosts}>
              <span>{pagination.totalPosts} Blog Post(s)</span>
            </div>

            <ul className={styles.blogList}>
              {posts.length === 0 ? (
                <p>No blog posts found. Try adjusting your search or create a new post!</p>
              ) : (
                posts.map((post) => (
                  <li key={post.id} className={styles.blogItem}>
                    <div className={styles.titleContainer}>
                      <Link href={`/blogs/${post.id}`}>
                        <h2 className={styles.blogTitle}>{post.title}</h2>
                      </Link>
                      <span className={styles.blogAuthor}>by {post.author.username}</span>
                    </div>
                    <p className={styles.blogDescription}>{post.description}</p>
                    <p>{truncateContent(post.content, 100)}</p>
                    <Link href={`/blogs/${post.id}`}>
                      <h4 className={styles.readMore}>View full post with comments</h4>
                    </Link>
                    <div className={styles.tags}>
                      {post.tags.map((tag) => (
                        <span key={tag.id} className={styles.tag}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <button
                      className={`${styles.button} ${styles.redButton}`}
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </button>
                    
                    <button
                      className={`${styles.button} ${styles.blueButton}`}
                      onClick={() => router.push(`/editBlog/${post.id}`)} // Navigate to the edit page
                    >
                      Edit
                    </button>

                  </li>
                ))
              )}
            </ul>

            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBlog;
