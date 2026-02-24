import React, {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import api from '../api/axios';
import {Plus, Users, DollarSign, FileText, Settings, Send} from 'lucide-react';
import {toast} from 'react-hot-toast';

const OrganizerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try{
            const res = await api.get('/events/organizer/dashboard');
            setEvents(res.data.carouselEvents);
            setStats(res.data.analytics);
        } 
        catch(err){
            toast.error("Failed to load dashboard data");
        } 
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handlePublish = async (eventId) => {
        try {
            // Trigger status change to Published
            await api.put(`/events/update/${eventId}`, { status: 'Published' });
            toast.success("Event is now live!");
            fetchDashboardData(); // Refresh list
        } catch (err) {
            toast.error("Failed to publish event");
        }
    };

    if(loading) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="organizer-container">
            <header className="dashboard-header">
                <h1>Organizer Dashboard</h1>
                <Link to="/organizer/create" className="create-event-btn">
                    <Plus size={18} /> Create New Event
                </Link>
            </header>

            {/* Analytics Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <Users size={24} color="#007bff" />
                    <div className="stat-content">
                        <span>Total Registrations</span>
                        <h3>{stats?.totalRegistrations || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <DollarSign size={24} color="#10b981" />
                    <div className="stat-content">
                        <span>Total Revenue</span>
                        <h3>₹{stats?.totalRevenue || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Event Carousel/List */}
            <section className="managed-events">
                <h2>Your Events</h2>
                <div className="event-list">
                    {events.length > 0 ? events.map(event => (
                        <div key={event._id} className="organizer-event-item">
                            <div className="event-main-info">
                                <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h4 style={{ cursor: 'pointer', borderBottom: '1px dashed #ccc' }}>
                                        {event.name}
                                    </h4>
                                </Link>

                                <span className={`status-pill ${event.status.toLowerCase()}`}>
                                    {event.status}
                                </span>
                                <small>{event.eventType} • {new Date(event.startDate).toLocaleDateString()}</small>
                            </div>
                            <div className="event-actions">
                                {event.status === 'Draft' && (
                                    <button className="publish-mini-btn" onClick={() => handlePublish(event._id)}>
                                        <Send size={14} /> Publish
                                    </button>
                                )}
                                <button onClick={() => navigate(`/organizer/event/${event._id}/participants`)}>
                                    <FileText size={16} /> Participants
                                </button>
                                <button onClick={() => navigate(`/organizer/event/${event._id}/edit`)}>
                                    <Settings size={16} /> Manage
                                </button>
                            </div>
                        </div>
                    )) : <p>You haven't created any events yet.</p>}
                </div>
            </section>
        </div>
    );
};

export default OrganizerDashboard;