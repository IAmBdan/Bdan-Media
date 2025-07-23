import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LogIn.css';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, { email, password });
            const { token, user } = response.data;
    
            // Save token and user data to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
    
            alert(`Welcome back, ${user.username}`);
            navigate(`/profile/${user.username}`);
        } catch (error) {
            console.error('Login error:', error);
            alert('Invalid email or password');
        }
    };

    return (
        <div className="container">
            <div className="login-container">
                <h2 className="login-header">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />
                <button onClick={handleLogin} className="login-button">
                    Login
                </button>
            </div>
        </div>
    );
};

export default LoginPage;