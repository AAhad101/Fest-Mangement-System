import React, {useState, useEffect} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {ShieldAlert, Calendar, Trash2, StopCircle, RefreshCw} from 'lucide-react';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try{
            // Uses the function: getAllEventsAdmin
            const res = await api.get('/admin/events');
            setEvents(res.data);
        } 
        catch(err){
            toast.error("Failed to fetch events for moderation");
        } 
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleModerate = async (eventId, newStatus) => {
        try{
            // Uses the function: moderateEvent
            await api.put(`/admin/events/${eventId}/moderate`, { status: newStatus });
            toast.success(`Event moderated to ${newStatus}`);
            fetchEvents(); 
        } 
        catch(err){
            toast.error("Moderation action failed");
        }
    };

    if(loading) return <div className="loading">Loading Admin Panel...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1><ShieldAlert size={28} /> Admin Control: Event Moderation</h1>
                <button onClick={fetchEvents} className="refresh-btn">
                    <RefreshCw size={18} /> Refresh List
                </button>
            </header>

            <section className="moderation-section">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Organizer</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length > 0 ? events.map(event => (
                                <tr key={event._id}>
                                    <td><strong>{event.name}</strong></td>
                                    <td>{event.organizer?.organizerName || 'Unknown'}</td>
                                    <td>{event.category}</td>
                                    <td>
                                        <span className={`status-pill ${event.status.toLowerCase()}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="admin-actions">
                                        <button 
                                            className="moderate-btn close"
                                            onClick={() => handleModerate(event._id, 'Closed')}
                                        >
                                            <StopCircle size={14} /> Close
                                        </button>
                                        <button 
                                            className="moderate-btn delete"
                                            onClick={() => handleModerate(event._id, 'Deleted')}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="empty-row">No events found on the platform.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;