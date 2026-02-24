import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import { CreditCard, Info } from 'lucide-react';

const RegisterEvent = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectedItems, setSelectedItems] = useState([]); // For Merch
    const [teamName, setTeamName] = useState('');
    const [paymentProof, setPaymentProof] = useState(''); // New state for Tier A

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
            // Tier A Validation: If there is a fee, payment proof is mandatory
            if (event.registrationFee > 0 && !paymentProof) {
                return toast.error("Please provide a transaction ID or proof of payment.");
            }

            const payload = {
                eventId: id,
                formData: event.eventType === 'Normal' ? formData : undefined,
                purchasedItems: event.eventType === 'Merchandise' ? selectedItems : undefined,
                teamName,
                paymentProof: event.registrationFee > 0 ? paymentProof : undefined // Sent for Tier A
            };

            const res = await api.post('/registrations/register', payload);
            
            // Success handling based on status
            if (res.data.status === 'Pending') {
                toast.success("Payment proof submitted! Awaiting organizer approval.");
            } else {
                toast.success("Registration Successful!");
            }
            
            navigate('/my-events');
        }
        catch(err){
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    if (!event) return <div>Loading...</div>;

    return (
        <div className="registration-container">
            <h2>Register for {event.name}</h2>
            <form onSubmit={handleRegister} className="registration-form">
                
                {/* Normal Event: Custom Form Fields */}
                {event.eventType === 'Normal' && event.customFormFields?.map((field, idx) => (
                    <div key={idx} className="form-group">
                        <label>{field.label} {field.required && '*'}</label>
                        <input 
                            type={field.fieldType} 
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
                                <small>Stock: {item.quantity}</small>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tier A: Payment Section (Only if Fee > 0) */}
                {event.registrationFee > 0 && (
                    <div className="payment-approval-box" style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        border: '2px solid #007bff', 
                        borderRadius: '8px',
                        backgroundColor: '#f0f7ff' 
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0056b3' }}>
                            <CreditCard size={20} /> Payment Required: ₹{event.registrationFee}
                        </h3>
                        <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                            <Info size={14} /> <strong>Organizer Note:</strong> This event requires manual payment verification. Please pay via UPI and provide your Transaction ID below.
                        </p>
                        <input 
                            type="text"
                            placeholder="Enter Transaction ID or Link to Screenshot"
                            value={paymentProof}
                            onChange={(e) => setPaymentProof(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            required
                        />
                    </div>
                )}

                <button type="submit" className="submit-reg-btn" style={{ marginTop: '20px' }}>
                    {event.registrationFee > 0 ? "Submit for Approval" : "Complete Registration"}
                </button>
            </form>
        </div>
    );
};

export default RegisterEvent;