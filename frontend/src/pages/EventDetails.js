import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {Calendar, Users, Info, AlertCircle} from 'lucide-react';

const EventDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try{
                const res = await api.get(`/events/${id}`);
                setData(res.data);
            } 
            catch(err){
                toast.error("Event not found");
                navigate('/browse');
            } 
            finally{
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if(loading) return <div>Loading details...</div>;

    const {event, availability} = data;

    return (
        <div className="details-container">
            <div className="details-header">
                <h1>{event.name}</h1>
                <span className={`badge ${event.category.toLowerCase()}`}>{event.category}</span>
            </div>

            <div className="details-grid">
                <div className="main-info">
                    <p className="description">{event.description}</p>
                    
                    <div className="meta-info">
                        <div className="meta-item">
                            <Calendar size={20} />
                            <div>
                                <strong>Date & Time</strong>
                                <p>{new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="meta-item">
                            <Info size={20} />
                            <div>
                                <strong>Eligibility</strong>
                                <p>{event.eligibility}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="registration-sidebar">
                    <div className="price-card">
                        <h3>Registration</h3>
                        <p className="fee">{event.registrationFee > 0 ? `₹${event.registrationFee}` : 'FREE'}</p>
                        
                        {!availability.isOpen ? (
                            <div className="status-error">
                                <AlertCircle size={18} />
                                <span>{availability.message}</span>
                            </div>
                        ) : (
                            <button 
                                className="register-now-btn"
                                onClick={() => navigate(`/events/${id}/register`)}
                            >
                                Proceed to Register
                            </button>
                        )}
                        <p className="deadline">Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="organizer-box">
                        <h4>Organized by</h4>
                        <p><strong>{event.organizer.organizerName}</strong></p>
                        <p>{event.organizer.contactEmail}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;