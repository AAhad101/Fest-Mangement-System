import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api/axios';
import {toast} from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'Participant'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await api.post('/auth/register', formData);
            toast.success("Registration successful! Please login.");
            navigate('/login');
        } 
        catch(err){
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Participant Registration</h2>
                <input type="text" placeholder="First Name" required onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <input type="text" placeholder="Last Name" required onChange={e => setFormData({...formData, lastName: e.target.value})} />
                <input type="email" placeholder="Email (IIIT Domain)" required onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="password" placeholder="Password" required onChange={e => setFormData({...formData, password: e.target.value})} />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Register;