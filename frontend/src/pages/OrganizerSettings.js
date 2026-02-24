import React, {useState, useEffect} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {Key, History, Send, MessageSquare} from 'lucide-react';

const PasswordResetManager = () => {
    const [newPassword, setNewPassword] = useState('');
    const [reason, setReason] = useState('');
    const [history, setHistory] = useState([]);

    const fetchHistory = async () => {
        try{
            const res = await api.get('/users/reset-history');
            setHistory(res.data);
        } 
        catch(err){
            console.error("Failed to load history");
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleRequest = async (e) => {
        e.preventDefault();
        try{
            await api.post('/users/request-reset', {newPassword, reason});
            toast.success("Request sent to Admin for approval.");
            setNewPassword('');
            setReason('');
            fetchHistory();
        } 
        catch(err){
            toast.error(err.response?.data?.message || "Request failed");
        }
    };

    return (
        <div className="reset-manager">
            {/* Request Form */}
            <section className="request-section" style={{ marginBottom: '40px' }}>
                <h3><Key size={20} /> Request Password Reset</h3>
                <form onSubmit={handleRequest}>
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                    />
                    <textarea 
                        placeholder="Reason for reset (optional)" 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <button type="submit"><Send size={16} /> Submit Request</button>
                </form>
            </section>

            {/* History Table */}
            <section className="history-section">
                <h3><History size={20} /> Reset Request History</h3>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Admin Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((req, idx) => (
                            <tr key={idx}>
                                <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-tag ${req.status.toLowerCase()}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td>{req.adminComments || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default PasswordResetManager;