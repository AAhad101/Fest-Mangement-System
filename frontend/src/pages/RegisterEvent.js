import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../api/axios';
import {toast} from 'react-hot-toast';

const RegisterEvent = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectedItems, setSelectedItems] = useState([]); // For Merch
    const [teamName, setTeamName] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try{
                const res = await api.get(`/events/${id}`);
                setEvent(res.data.event);
            } 
            catch(err){
                toast.error("Error loading form");
            }
        };
        fetchEvent();
    }, [id]);

    const handleFormChange = (label, value) => {
        setFormData({ ...formData, [label]: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try{
            const payload = {
                eventId: id,
                formData: event.eventType === 'Normal' ? formData : undefined,
                purchasedItems: event.eventType === 'Merchandise' ? selectedItems : undefined,
                teamName
            };
            await api.post('/registrations/register', payload);
            toast.success("Registration Successful!");
            navigate('/my-events');
        }
        catch(err){
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    if (!event) return <div>Loading form...</div>;

    return (
        <div className="registration-form-container">
            <h2>Register for {event.name}</h2>
            <form onSubmit={handleRegister}>
                {/* Team Name Field */}
                <div className="form-group">
                    <label>Team Name (Optional)</label>
                    <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" />
                </div>

                {/* Normal Event: Custom Form Builder Logic */}
                {event.eventType === 'Normal' && event.customFormFields?.map((field, index) => (
                    <div key={index} className="form-group">
                        <label>{field.label} {field.required && '*'}</label>
                        <input 
                            type={field.type === 'number' ? 'number' : 'text'} 
                            required={field.required}
                            onChange={(e) => handleFormChange(field.label, e.target.value)}
                        />
                    </div>
                ))}

                {/* Merchandise Event: Item Selection */}
                {event.eventType === 'Merchandise' && (
                    <div className="merch-selection">
                        <h3>Select Items</h3>
                        {event.itemDetails.map((item, idx) => (
                            <div key={idx} className="merch-item">
                                <span>{item.itemName} ({item.size}) - ₹{item.price}</span>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max={item.purchaseLimit} 
                                    onChange={(e) => {
                                        const qty = parseInt(e.target.value);
                                        const updated = [...selectedItems].filter(i => i.itemName !== item.itemName || i.size !== item.size);
                                        if (qty > 0) updated.push({ ...item, quantity: qty });
                                        setSelectedItems(updated);
                                    }}
                                />
                                <small>Stock: {item.stockQuantity}</small>
                            </div>
                        ))}
                    </div>
                )}

                <button type="submit" className="submit-reg-btn">Complete Registration</button>
            </form>
        </div>
    );
};

export default RegisterEvent;