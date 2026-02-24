import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {Save, RefreshCw} from 'lucide-react';

const EditEvent = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [status, setStatus] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            const res = await api.get(`/events/${id}`);
            setEvent(res.data.event);
            setStatus(res.data.event.status);
            setDescription(res.data.event.description);
        };
        fetchEvent();
    }, [id]);

    const handleUpdate = async () => {
        try{
            // Fulfills Section 10.4: Sending status and description
            await api.put(`/events/update/${id}`, { status, description });
            toast.success("Event updated!");
            navigate('/organizer/dashboard');
        } 
        catch(err){
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    if (!event) return <div>Loading...</div>;

    return (
        <div className="edit-container">
            <h2>Manage Event: {event.name}</h2>
            <div className="form-block">
                <label>Current Status: <strong>{event.status}</strong></label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                </select>
                
                <label>Update Description</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                />
                
                <button onClick={handleUpdate} className="publish-btn">
                    <RefreshCw size={16} /> Save Changes
                </button>
            </div>
        </div>
    );
};

export default EditEvent;