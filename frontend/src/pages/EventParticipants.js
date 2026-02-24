import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../api/axios';
import {Download, CheckCircle, XCircle, Users, QrCode, Clock} from 'lucide-react';
import {toast} from 'react-hot-toast';

const EventParticipants = () => {
    const {eventId} = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchParticipants = async () => {
        try{
            const res = await api.get(`/events/organizer/event/${eventId}/participants`);
            setData(res.data);
        } 
        catch(err){
            toast.error("Error fetching participant list");
        } 
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, [eventId]);

    const handleExport = async () => {
        try{
            const response = await api.get(`/events/organizer/event/${eventId}/export`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${data.eventName}_Attendance_Report.csv`);
            document.body.appendChild(link);
            link.click();
            toast.success("Attendance Report Exported!");
        } 
        catch(err){
            toast.error("Export failed");
        }
    };

    if (loading) return <div className="loading">Loading Participant Data...</div>;

    // Calculate live attendance stats
    const totalRegistered = data.participants.length;
    const presentCount = data.participants.filter(p => p.attended).length;
    const absentCount = totalRegistered - presentCount;

    return (
        <div className="participants-container">
            <div className="header-actions">
                <div>
                    <h1>{data.eventName}</h1>
                    <p className="subtitle">Participant Management & Live Attendance</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="scan-btn" onClick={() => navigate('/organizer/scan')}>
                        <QrCode size={18} /> Open Scanner
                    </button>
                    <button className="export-btn" onClick={handleExport}>
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Attendance Dashboard Stats */}
            <div className="attendance-dashboard">
                <div className="stat-card blue">
                    <Users size={24} />
                    <div>
                        <span>Total Registered</span>
                        <h3>{totalRegistered}</h3>
                    </div>
                </div>
                <div className="stat-card green">
                    <CheckCircle size={24} />
                    <div>
                        <span>Present</span>
                        <h3>{presentCount}</h3>
                    </div>
                </div>
                <div className="stat-card red">
                    <XCircle size={24} />
                    <div>
                        <span>Absent</span>
                        <h3>{absentCount}</h3>
                    </div>
                </div>
            </div>

            <table className="participant-table">
                <thead>
                    <tr>
                        <th>Participant Name</th>
                        <th>Email Address</th>
                        <th>Attendance Status</th>
                        <th>Check-in Time</th>
                        <th>Responses / Items</th>
                    </tr>
                </thead>
                <tbody>
                    {data.participants.map((p, idx) => (
                        <tr key={idx} className={p.attended ? 'row-present' : 'row-absent'}>
                            <td>{p.name}</td>
                            <td>{p.email}</td>
                            <td>
                                <span className={`attendance-tag ${p.attended ? 'present' : 'absent'}`}>
                                    {p.attended ? 'PRESENT' : 'ABSENT'}
                                </span>
                            </td>
                            <td>
                                {p.attended ? (
                                    <span className="time-stamp">
                                        <Clock size={12} /> {new Date(p.attendanceTimestamp).toLocaleTimeString()}
                                    </span>
                                ) : '-'}
                            </td>
                            <td>
                                <button className="view-details-link" onClick={() => alert(JSON.stringify(p.responses, null, 2))}>
                                    View Data
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventParticipants;