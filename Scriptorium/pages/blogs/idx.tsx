import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogPost } from "@prisma/client";
import { useRouter } from 'next/router';
import styles from "../../styles/blog.module.css";
import Navbar from '../../components/navbar';

export default function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();

  const fetchPosts = async (page = 1, search = "") => {
    const res = await fetch(`/api/blogs/idx?page=${page}&search=${search}`);
    const data = await res.json();
    setPosts(data.posts);
    setPagination({
      totalPages: data.pagination.totalPages,
      currentPage: data.pagination.currentPage,
    });
  };

  useEffect(() => {
    fetchPosts(); // Default fetch for the first page
  }, []);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchTerm(query);
    fetchPosts(1, query); // Fetch results when search term changes
  };

  // Handle pagination
  const handlePagination = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      fetchPosts(page, searchTerm);
    }
  };

  const handleVote = async (targetId: number, targetType: "blogPost" | "comment", rating: number) => {
    const token = localStorage.getItem("token"); // Assuming token is stored in localStorage

    const res = await fetch("/api/rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, targetId, targetType }),
    });

    if (res.ok) {
      const updatedPost = await res.json();
      // Optionally, update the post or comment data here to reflect the new vote count
      fetchPosts(); // Re-fetch posts to update the UI
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  };

  const truncateContent = (content: string, length: number) => {
    return content.length > length ? content.substring(0, length) + "..." : content;
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <div>
      <Navbar />

      <div className={styles.mainContent}>
        <h1>Blog Posts</h1>

        {/* Create Blog Post Button */}
        <Link href="/blogs/create">
          <button className={styles.createButton}>Create Blog Post</button>
        </Link>

        {/* Search input field */}
        <input
          type="text"
          placeholder="Search by title, content, or tags..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        <ul>
          {posts.map((post) => (
            <li key={post.id} className={styles.blogPost}>
              
              <Link href={`/blogs/${post.id}`}>
                <h2 className={styles.blogTitle}>{truncateContent(post.title, 30)}</h2>
              </Link>
              <p className={styles.blogDescription}>By: {post.author.username}</p>

              <p className={styles.blogDescription}>{truncateContent(post.description, 100)}</p>
              

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

              <div className={styles.votes}>
                <button onClick={() => handleVote(post.id, "blogPost", 1)}className={`${styles.voteButton} ${styles.upvote}`}
                    >
                        Upvote</button>
                <span> {post.numOfUpvotes} </span>
                <button onClick={() => handleVote(post.id, "blogPost", -1)}className={`${styles.voteButton} ${styles.downvote}`}
                    >
                        Downvote</button>
                <span> {post.numOfDownvotes} </span>
              </div>

              {post.templates.length > 0 && (
                <div className={styles.templates}>
                  <h3>Template IDs:</h3>
                  <ul>
                    {post.templates.map((template) => (
                      <li key={template.id}>
                        <Link href={`/templates/run/${template.id}`} className={styles.templateLink}>
                          {template.id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </li>
          ))}
        </ul>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button
            onClick={() => handlePagination(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePagination(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
