import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import api from '../api/axios';
import {toast} from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await api.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);
            toast.success('Welcome back!');
            
            // Redirect based on role
            if (res.data.user.role === 'Admin') navigate('/admin/dashboard');
            else if (res.data.user.role === 'Organizer') navigate('/organizer/dashboard');
            else navigate('/dashboard');
        } 
        catch(err){
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Login to Felicity</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
};

export default Login;
