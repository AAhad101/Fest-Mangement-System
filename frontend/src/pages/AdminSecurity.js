import React, {useState, useEffect} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {ShieldCheck, UserX, UserCheck, AlertCircle} from 'lucide-react';

const AdminResetApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [comment, setComment] = useState('');

    const fetchRequests = async () => {
        try{
            const res = await api.get('/admin/reset-requests');
            setRequests(res.data);
        }
        catch(err){
            toast.error("Error loading requests");
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleApproval = async (userId, requestId, action) => {
        try{
            await api.put('/admin/handle-reset', { 
                userId, requestId, action, comments: comment 
            });
            toast.success(`Request ${action}`);
            setComment('');
            fetchRequests();
        }
        catch(err){
            toast.error("Action failed");
        }
    };

    return (
        <div className="admin-approvals">
            <h2>Manage Organizer Security Requests</h2>
            {requests.filter(r => r.status === 'Pending').map((req) => (
                <div key={req._id} className="approval-card">
                    <h4>{req.organizerName} ({req.email})</h4>
                    <p><strong>Reason:</strong> {req.reason || "No reason provided"}</p>
                    
                    <input 
                        type="text" 
                        placeholder="Add admin comment..." 
                        onChange={(e) => setComment(e.target.value)} 
                    />
                    
                    <div className="btn-group">
                        <button onClick={() => handleApproval(req.userId, req._id, 'Approved')}>Approve</button>
                        <button onClick={() => handleApproval(req.userId, req._id, 'Rejected')}>Reject</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminResetApprovals;
