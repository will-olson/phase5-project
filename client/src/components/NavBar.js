import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode', !isDarkMode);
    };

    const handleLogout = async () => {
        const response = await fetch('http://127.0.0.1:5555/logout', {
            method: 'POST',
        });

        if (response.ok) {
            onLogout(false);
            navigate('/');
        }
    };

    const handleLogin = () => {
        navigate('/');
    };

    return (
        <nav className="navbar">
            <button onClick={() => navigate('/')} className="navbar-link">Home</button>
            <button onClick={() => navigate('/companies')} className="navbar-link">Companies</button>
            <button onClick={() => navigate('/industry-news')} className="navbar-link">Industry News</button>

            <button onClick={toggleDarkMode} className="navbar-link">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

           
            <button onClick={isLoggedIn ? handleLogout : handleLogin} className="navbar-link">
                {isLoggedIn ? 'Logout' : 'Login'}
            </button>
        </nav>
    );
}

export default Navbar;