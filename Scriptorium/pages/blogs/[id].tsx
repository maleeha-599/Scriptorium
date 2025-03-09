import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/viewBlog.module.css";
import { BlogPost } from "@prisma/client";
import Navbar from '../../components/navbar'

export default function BlogDetails() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newComment, setNewComment] = useState("");
    const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);

    const router = useRouter();
    const { id } = router.query;
    const commentsPerPage = 5;

    // Navigation function
    const goToTemplates = () => {
        router.push("/templates");
    };

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/blogs/${id}`);
            if (!res.ok) throw new Error("Failed to fetch blog post.");
            const data = await res.json();
            setPost(data);
        } catch (error) {
            console.error("Error fetching blog post:", error);
        }
    };

    const fetchComments = async (page = 1) => {
        try {
            const res = await fetch(
                `/api/commenting?blog_post_id=${id}&page=${page}&limit=${commentsPerPage}`
            );
            if (!res.ok) throw new Error("Failed to fetch comments.");
            const data = await res.json();
            setComments(data.comments);
            setTotalPages(data.pagination.totalPages);
            setCurrentPage(data.pagination.currentPage);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    useEffect(() => {
        if (!id) return;

        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        setIsAuthenticated(!!storedToken);

        fetchPost();
        fetchComments();
    }, [id]);

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            alert("Comment cannot be empty.");
            return;
        }

        try {
            const res = await fetch(`/api/commenting`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: newComment,
                    blog_post_id: id,
                    parent_id: replyToCommentId,
                }),
            });

            if (res.ok) {
                setNewComment("");
                setReplyToCommentId(null);
                fetchComments(currentPage);
            } else {
                const error = await res.json();
                alert(`Failed to add comment: ${error.error}`);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleReply = (commentId: number) => {
        setReplyToCommentId(commentId);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            fetchComments(newPage);
        }
    };

    const handleVote = async (
        targetId: number,
        targetType: "blogPost" | "comment",
        rating: number
    ) => {
        const res = await fetch("/api/rating", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating, targetId, targetType }),
        });
    
        if (res.ok) {
            if (targetType === "blogPost") {
                // Fetch the updated blog post details after voting
                fetchPost();
            } else if (targetType === "comment") {
                // Re-fetch comments to update their votes
                fetchComments(currentPage);
            }
        } else {
            const error = await res.json();
            alert(`Error: ${error.error}`);
        }
    };
    

    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div key={comment.id} className={styles.commentBox}>
                <p>{comment.content}</p>
                <p>By: {comment.user.username}</p>
                <div className={styles.voteContainer}>
                    <button
                        onClick={() => handleVote(comment.id, "comment", 1)}
                        className={`${styles.voteButton} ${styles.upvote}`}
                    >
                        Upvote
                    </button>
                    <span className={styles.voteCount}>{comment.numOfUpvotes}</span>
                    <button
                        onClick={() => handleVote(comment.id, "comment", -1)}
                        className={`${styles.voteButton} ${styles.downvote}`}
                    >
                        Downvote
                    </button>
                    <span className={styles.voteCount}>{comment.numOfDownvotes}</span>
                </div>
                <button
                    onClick={() => handleReply(comment.id)}
                    className={styles.replyButton}
                >
                    Reply
                </button>
                <button
                    onClick={() => router.push(`/flagPost?type=comment&id=${comment.id}`)}
                    className={styles.reportButton}
                >
                    Report
                </button>
    
                {comment.replies && comment.replies.length > 0 && (
                    <div className={styles.replies}>{renderComments(comment.replies)}</div>
                )}
            </div>
        ));
    };
    

    if (!post) return <p>Loading...</p>;

    return (
        <div className={styles.pageContainer}>
    {/* Navbar at the top */}
    <Navbar />

    {/* Main Content Wrapper */}
    <div className={styles.mainContentWrapper}>
        {/* Blog post details */}
        <div className={styles.blogDetails}>
            <h1 className={styles.blogTitle}>{post.title}</h1>
            <p className={styles.blogDescription}>By: {post.author.username}</p>
            <p className={styles.blogDescription}>Description: {post.description}</p>
            <div className={styles.blogContent}>Content: {post.content}</div>
            <div className={styles.tags}> Tags: 
                {post.tags.map((tag) => (
                  <span key={tag.id} className={styles.tag}>
                    {tag.name}
                  </span>
                ))}
              </div>

            {/* Voting Section */}
            <div className={styles.votesContainer}>
                <button
                    onClick={() => handleVote(post.id, "blogPost", 1)}
                    className={`${styles.voteButton} ${styles.upvote}`}
                >
                    👍 Upvote
                </button>
                <span className={styles.voteCount}>  {post.numOfUpvotes}  </span>
                <button
                    onClick={() => handleVote(post.id, "blogPost", -1)}
                    className={`${styles.voteButton} ${styles.downvote}`}
                >
                    👎 Downvote
                </button>
                <span className={styles.voteCount}>  {post.numOfDownvotes}  </span>
            </div>
            <button
                onClick={() => router.push(`/flagPost?type=blogPost&id=${post.id}`)}
                className={styles.reportButton}
            >
                🚩 Report
            </button>
        </div>

        {/* Comments Section */}
        <div className={styles.commentsContainer}>
            <h3>Comments:</h3>
            {comments.length > 0 ? renderComments(comments) : <p>No comments yet.</p>}

            {isAuthenticated && (
                <div className={styles.addComment}>
                    <textarea
                        placeholder={
                            replyToCommentId
                                ? "Write your reply here..."
                                : "Write your comment here..."
                        }
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className={styles.commentInput}
                    />
                    <button onClick={handleAddComment} className={styles.commentButton}>
                        {replyToCommentId ? "Reply" : "Add Comment"}
                    </button>
                </div>
            )}

            <div className={styles.pagination}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</div>
    );
}
