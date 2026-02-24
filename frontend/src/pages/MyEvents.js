import React, {useState, useEffect} from 'react';
import {QRCodeSVG} from 'qrcode.react';
import api from '../api/axios';
import {Calendar, Package, Clock, XCircle, Ticket} from 'lucide-react';

const MyEvents = () => {
    const [data, setData] = useState({ upcomingEvents: [], participationHistory: {} });
    const [activeTab, setActiveTab] = useState('normal');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try{
                const res = await api.get('/users/my-events');
                setData(res.data);
            } 
            catch(err){
                console.error("Error fetching my events", err);
            } 
            finally{
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    if(loading) return <div>Loading your dashboard...</div>;

    const renderEventList = (events) => (
        <div className="history-list">
            {events?.length > 0 ? events.map(reg => (
                <div key={reg._id} className="history-item">
                    <div className="history-info">
                        <h4>{reg.event.name}</h4>
                        <p>{reg.event.organizer.organizerName} • {new Date(reg.event.startDate).toLocaleDateString()}</p>
                        {reg.status === 'Registered' && <span className="status-badge-mini">Confirmed</span>}
                    </div>
                    
                    <div className="ticket-info">
                        <div className="ticket-id-tag">
                            <span>{reg.ticketID}</span>
                        </div>

                        {/* Scannable QR Image for Merchandise */}
                        {reg.event.eventType === 'Merchandise' && reg.qrCode && (
                            <div className="qr-visual-container">
                                <span className="qr-label">COLLECTION QR</span>
                                <div className="qr-wrapper">
                                    <QRCodeSVG 
                                        value={reg.qrCode} 
                                        size={80}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                <code className="qr-code-text-small">{reg.qrCode}</code>
                            </div>
                        )}
                    </div>
                </div>
            )) : <p>No events found in this category.</p>}
        </div>
    );

    return (
        <div className="my-events-container">
            {/* Upcoming Events */}
            <section className="upcoming-section">
                <h2>📅 Registered Upcoming Events</h2>
                <div className="upcoming-grid">
                    {data.upcomingEvents.length > 0 ? data.upcomingEvents.map(reg => (
                        <div key={reg._id} className="upcoming-card">
                            <h3>{reg.event.name}</h3>
                            <p><strong>Type:</strong> {reg.event.eventType}</p>
                            <p><strong>Starts:</strong> {new Date(reg.event.startDate).toLocaleString()}</p>
                            <p><strong>Organizer:</strong> {reg.event.organizer.organizerName}</p>
                        </div>
                    )) : <p>No upcoming events registered.</p>}
                </div>
            </section>

            {/* Participation History Tabs */}
            <section className="history-section">
                <h2>Participation History</h2>
                <div className="tabs">
                    <button className={activeTab === 'normal' ? 'active' : ''} onClick={() => setActiveTab('normal')}>Normal</button>
                    <button className={activeTab === 'merchandise' ? 'active' : ''} onClick={() => setActiveTab('merchandise')}>Merchandise</button>
                    <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>Completed</button>
                    <button className={activeTab === 'cancelled' ? 'active' : ''} onClick={() => setActiveTab('cancelled')}>Cancelled</button>
                </div>

                <div className="tab-content">
                    {renderEventList(data.participationHistory[activeTab])}
                </div>
            </section>
        </div>
    );
};

export default MyEvents;