import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); // Clear any previous errors
        try {
            alert('Account created successfully!');
            navigate('/login'); // Redirect to the login page after successful registration
        } catch (error) {
            console.error('Error creating account:', error);
            setError('Failed to create account. Please try again.');
        }
    };

    return (
        <div className="profile-container">
            <h2 className="profile-name">Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="profile-input-group">
                    <label className="profile-label" htmlFor="username">Username:</label>
                    <input
                        id="username"
                        className="profile-input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="profile-input-group">
                    <label className="profile-label" htmlFor="email">Email:</label>
                    <input
                        id="email"
                        className="profile-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="profile-input-group">
                    <label className="profile-label" htmlFor="password">Password:</label>
                    <input
                        id="password"
                        className="profile-input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <p className="profile-error">{error}</p>}
                <div className="profile-action-buttons">
                    <button type="submit" className="profile-edit-button">Sign Up</button>
                    <button
                        type="button"
                        className="profile-logout-button"
                        onClick={() => navigate('/login')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUpPage;