import React, {useState, useEffect} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {UserPlus, Trash2} from 'lucide-react';

const ManageOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);
    const [newOrg, setNewOrg] = useState({
        organizerName: '', email: '', password: '', 
        category: 'Technical', description: '', contactEmail: ''
    });

    const fetchOrganizers = async () => {
        const res = await api.get('/admin/organizers');
        setOrganizers(res.data);
    };

    useEffect(() => { fetchOrganizers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try{
            // Hits the backend function: exports.createOrganizer
            await api.post('/admin/create-organizer', newOrg);
            toast.success("Organizer account created!");
            fetchOrganizers();
            setNewOrg({ organizerName: '', email: '', password: '', category: 'Technical', description: '', contactEmail: '' });
        } 
        catch(err){
            toast.error("Failed to create organizer");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this organizer and all their events?")){
            await api.delete(`/admin/organizers/${id}`);
            fetchOrganizers();
        }
    };

    return (
        <div className="admin-manage-container">
            <h2><UserPlus /> Add New Club/Organizer</h2>
            <form onSubmit={handleCreate} className="admin-form">
                <input type="text" placeholder="Club Name" value={newOrg.organizerName} required onChange={e => setNewOrg({...newOrg, organizerName: e.target.value})} />
                <input type="email" placeholder="Login Email" value={newOrg.email} required onChange={e => setNewOrg({...newOrg, email: e.target.value})} />
                <input type="password" placeholder="Initial Password" value={newOrg.password} required onChange={e => setNewOrg({...newOrg, password: e.target.value})} />
                <input type="email" placeholder="Public Contact Email" value={newOrg.contactEmail} onChange={e => setNewOrg({...newOrg, contactEmail: e.target.value})} />
                <textarea placeholder="Club Description" value={newOrg.description} onChange={e => setNewOrg({...newOrg, description: e.target.value})} />
                <button type="submit">Create Account</button>
            </form>

            <h3>Existing Organizers</h3>
            <div className="org-list">
                {organizers.map(org => (
                    <div key={org._id} className="org-item">
                        <span>{org.organizerName} ({org.email})</span>
                        <button onClick={() => handleDelete(org._id)}><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageOrganizers;