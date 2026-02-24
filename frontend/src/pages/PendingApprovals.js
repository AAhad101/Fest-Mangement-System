import React, {useState, useEffect} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {Check, X, ExternalLink, Clock, User, CreditCard} from 'lucide-react';

const PendingApprovals = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try{
            // This calls the backend function we added to registrationController
            const res = await api.get('/events/organizer/approvals'); 
            setPending(res.data);
        } 
        catch(err){
            toast.error("Failed to fetch pending approvals");
        } 
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (registrationId, action) => {
        const confirmMsg = `Are you sure you want to ${action.toLowerCase()} this registration?`;
        if(!window.confirm(confirmMsg)) return;

        try{
            // Calls the approvePayment function in your registrationController
            await api.put('/registrations/approve', { registrationId, action });
            toast.success(`Registration ${action === 'Approved' ? 'approved! Ticket sent.' : 'rejected.'}`);
            fetchPending(); // Refresh list
        } 
        catch(err){
            toast.error(err.response?.data?.message || "Action failed");
        }
    };

    if(loading) return <div className="loading">Loading approvals...</div>;

    return (
        <div className="approvals-container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2><Clock size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Payment Approvals</h2>
                <span className="badge">{pending.length} Pending</span>
            </div>

            {pending.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '50px', border: '1px dashed #ccc' }}>
                    <p>No pending payments to review.</p>
                </div>
            ) : (
                <div className="approvals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {pending.map(reg => (
                        <div key={reg._id} className="approval-card" style={{ 
                            border: '1px solid #eee', 
                            borderRadius: '12px', 
                            padding: '20px', 
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>{reg.event.name}</span>
                                <h3 style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={18} /> {reg.participant.firstName} {reg.participant.lastName}
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#444' }}>{reg.participant.email}</p>
                            </div>

                            <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888' }}>PAYMENT PROOF SCREENSHOT</label>
                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                    <img 
                                        src={reg.paymentProof} 
                                        alt="Payment Proof" 
                                        style={{ maxWidth: '100%', maxHeight: '200px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ddd' }}
                                        onClick={() => window.open(reg.paymentProof)} 
                                    />
                                    <p style={{ fontSize: '0.7rem', color: '#007bff', marginTop: '5px' }}>Click image to enlarge</p>
                                </div>
                            </div>

                            <div className="approval-actions" style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => handleAction(reg._id, 'Approved')} 
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: '#28a745', 
                                        color: '#fff', 
                                        border: 'none', 
                                        padding: '10px', 
                                        borderRadius: '6px', 
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                    }}
                                >
                                    <Check size={18} /> Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(reg._id, 'Rejected')} 
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: '#fff', 
                                        color: '#dc3545', 
                                        border: '1px solid #dc3545', 
                                        padding: '10px', 
                                        borderRadius: '6px', 
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                    }}
                                >
                                    <X size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingApprovals;