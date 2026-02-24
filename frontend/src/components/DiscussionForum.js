import React, {useState, useEffect} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {MessageCircle, Send, Reply, User} from 'lucide-react';

const DiscussionForum = ({eventId, isOrganizer}) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null); // Stores ID of comment being replied to

    const fetchComments = async () => {
        try{
            const res = await api.get(`/comments/${eventId}`);
            setComments(res.data);
        } 
        catch(err){
            console.error("Failed to load comments");
        }
    };

    useEffect(() => {
        fetchComments();
        // Optional: Set up polling every 10 seconds for "real-time" feel
        const interval = setInterval(fetchComments, 10000);
        return () => clearInterval(interval);
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await api.post('/comments', { 
                eventId, 
                text: newComment, 
                parentId: replyTo?._id 
            });
            setNewComment('');
            setReplyTo(null);
            fetchComments();
            toast.success("Message posted");
        } 
        catch(err){
            toast.error("Failed to post message");
        }
    };

    return (
        <div className="discussion-forum" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3><MessageCircle size={20} /> Event Discussion</h3>

            {/* Comment List */}
            <div className="comment-feed" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                {comments.filter(c => !c.parentComment).map(parent => (
                    <div key={parent._id} className="comment-group" style={{ marginBottom: '15px' }}>
                        {/* Parent Question */}
                        <div className="main-comment" style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                                <strong>{parent.user.firstName} {parent.user.lastName}</strong>
                                <span>{new Date(parent.createdAt).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: '5px 0' }}>{parent.text}</p>
                            {isOrganizer && (
                                <button 
                                    onClick={() => setReplyTo(parent)}
                                    style={{ fontSize: '0.75rem', border: 'none', background: 'none', color: '#007bff', cursor: 'pointer' }}
                                >
                                    <Reply size={12} /> Reply as Organizer
                                </button>
                            )}
                        </div>

                        {/* Replies Section */}
                        {comments.filter(child => child.parentComment === parent._id).map(reply => (
                            <div key={reply._id} className="reply-comment" style={{ marginLeft: '30px', marginTop: '5px', padding: '8px', borderLeft: '2px solid #007bff', backgroundColor: '#fff' }}>
                                <div style={{ fontSize: '0.75rem', color: '#007bff', fontWeight: 'bold' }}>
                                    Official Reply from {reply.user.organizerName || 'Organizer'}
                                </div>
                                <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>{reply.text}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {replyTo && (
                    <div style={{ fontSize: '0.8rem', backgroundColor: '#e7f3ff', padding: '5px 10px', borderRadius: '4px' }}>
                        Replying to <strong>{replyTo.user.firstName}</strong> 
                        <button onClick={() => setReplyTo(null)} style={{ marginLeft: '10px', border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Cancel</button>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isOrganizer && replyTo ? "Type your official reply..." : "Ask a question about this event..."}
                        style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DiscussionForum;