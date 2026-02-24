import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import api from '../api/axios';
import {Download, CheckCircle, XCircle, Users} from 'lucide-react';
import {toast} from 'react-hot-toast';

const EventParticipants = () => {
    const { eventId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchParticipants();
    }, [eventId]);

    const handleExport = async () => {
        try{
            const response = await api.get(`/events/organizer/event/${eventId}/export`, {
                responseType: 'blob', // Important for file downloads
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${data.eventName}_Participants.csv`);
            document.body.appendChild(link);
            link.click();
            toast.success("CSV Exported successfully!");
        } 
        catch(err){
            toast.error("Export failed");
        }
    };

    if(loading) return <div>Loading participants...</div>;

    return (
        <div className="participants-container">
            <header className="page-header">
                <div>
                    <h1>{data.eventName}</h1>
                    <p>Total Registrations: {data.analytics.totalRegistrations}</p>
                </div>
                <button onClick={handleExport} className="export-btn">
                    <Download size={18} /> Export CSV
                </button>
            </header>

            {/* Analytics Cards */}
            <div className="analytics-mini-grid">
                <div className="mini-card">
                    <h4>Revenue</h4>
                    <p>₹{data.analytics.totalRevenue}</p>
                </div>
                <div className="mini-card">
                    <h4>Total Teams</h4>
                    <p>{data.analytics.totalTeams}</p>
                </div>
                <div className="mini-card">
                    <h4>Attendance (Est.)</h4>
                    <p>{data.analytics.attendanceMock}</p>
                </div>
            </div>

            <table className="participant-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Team</th>
                        <th>Responses / Items</th>
                    </tr>
                </thead>
                <tbody>
                    {data.participants.map((p, idx) => (
                        <tr key={idx}>
                            <td>{p.name}</td>
                            <td>{p.email}</td>
                            <td><span className="status-tag">{p.status}</span></td>
                            <td>{p.team}</td>
                            <td>
                                <pre className="json-render">
                                    {JSON.stringify(p.responses, null, 2)}
                                </pre>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventParticipants;