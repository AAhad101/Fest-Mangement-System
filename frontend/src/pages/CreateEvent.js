import React, {useState} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';
import {PlusCircle, Trash2, Calendar, Users, IndianRupee, Info} from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        name: '', 
        description: '', 
        eventType: 'Normal', 
        category: 'Technical',
        eligibility: 'All', 
        registrationDeadline: '', 
        startDate: '', 
        endDate: '',
        registrationLimit: '', 
        registrationFee: 0, 
        tags: []
    });

    const [customFields, setCustomFields] = useState([]);

    const addField = () => {
        setCustomFields([...customFields, { label: '', type: 'text', required: true }]);
    };

    const removeField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const handleSubmit = async (status) => {
        try{
            // Validation: Ensure required dates are present even for Drafts to satisfy Schema
            if (!eventData.registrationDeadline || !eventData.startDate || !eventData.endDate) {
                return toast.error("Please fill in all date fields.");
            }

            const payload = { 
                ...eventData, 
                status: status, 
                customFormFields: eventData.eventType === 'Normal' ? customFields : undefined,
                // Ensure numbers are sent as numbers
                registrationLimit: eventData.registrationLimit ? Number(eventData.registrationLimit) : undefined,
                registrationFee: Number(eventData.registrationFee)
            };

            await api.post('/events/create', payload);
            toast.success(`Event ${status === 'Published' ? 'published' : 'saved as draft'}!`);
            navigate('/organizer/dashboard');
        } 
        catch(err){
            console.error("Backend Error:", err.response?.data);
            toast.error(err.response?.data?.message || "Failed to create event");
        }
    };

    return (
        <div className="create-event-container">
            <h2>Create New Event</h2>
            
            <div className="form-sections">
                {/* 1. Basic Info */}
                <section className="form-block">
                    <h3><Info size={18} /> Basic Information</h3>
                    <input type="text" placeholder="Event Name" required onChange={e => setEventData({...eventData, name: e.target.value})} />
                    <textarea placeholder="Description" required onChange={e => setEventData({...eventData, description: e.target.value})} />
                    
                    <div className="form-row">
                        <select onChange={e => setEventData({...eventData, eventType: e.target.value})}>
                            <option value="Normal">Normal Event</option>
                            <option value="Merchandise">Merchandise</option>
                        </select>
                        <select onChange={e => setEventData({...eventData, category: e.target.value})}>
                            <option value="Technical">Technical</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Sports">Sports</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <input type="text" placeholder="Eligibility (e.g. UG All, IIIT Only)" onChange={e => setEventData({...eventData, eligibility: e.target.value})} />
                </section>

                {/* 2. Scheduling & Limits */}
                <section className="form-block">
                    <h3><Calendar size={18} /> Scheduling & Limits</h3>
                    <div className="date-grid">
                        <div className="input-group">
                            <label>Registration Deadline</label>
                            <input type="datetime-local" required onChange={e => setEventData({...eventData, registrationDeadline: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Event Start Date</label>
                            <input type="datetime-local" required onChange={e => setEventData({...eventData, startDate: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Event End Date</label>
                            <input type="datetime-local" required onChange={e => setEventData({...eventData, endDate: e.target.value})} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label><Users size={16}/> Capacity (Optional)</label>
                            <input type="number" placeholder="No limit" onChange={e => setEventData({...eventData, registrationLimit: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label><IndianRupee size={16}/> Fee (0 for Free)</label>
                            <input type="number" placeholder="0" onChange={e => setEventData({...eventData, registrationFee: e.target.value})} />
                        </div>
                    </div>
                </section>

                {/* 3. Dynamic Form Builder */}
                {eventData.eventType === 'Normal' && (
                    <section className="form-block">
                        <h3>Registration Form Builder</h3>
                        <p className="hint">Add fields you want participants to fill (e.g. GitHub, T-Shirt Size)</p>
                        {customFields.map((field, index) => (
                            <div key={index} className="field-row">
                                <input type="text" placeholder="Label" value={field.label}
                                    onChange={e => {
                                        const updated = [...customFields];
                                        updated[index].label = e.target.value;
                                        setCustomFields(updated);
                                    }} 
                                />
                                <select value={field.type} onChange={e => {
                                    const updated = [...customFields];
                                    updated[index].type = e.target.value;
                                    setCustomFields(updated);
                                }}>
                                    <option value="text">Short Text</option>
                                    <option value="number">Number</option>
                                </select>
                                <button type="button" className="delete-btn" onClick={() => removeField(index)}><Trash2 size={16}/></button>
                            </div>
                        ))}
                        <button type="button" onClick={addField} className="add-field-btn">
                            <PlusCircle size={16} /> Add Custom Field
                        </button>
                    </section>
                )}
            </div>

            <div className="form-actions">
                <button onClick={() => handleSubmit('Draft')} className="draft-btn">Save as Draft</button>
                <button onClick={() => handleSubmit('Published')} className="publish-btn">Publish Event</button>
            </div>
        </div>
    );
};

export default CreateEvent;