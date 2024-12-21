import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

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
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-link">Home</Link>
            <Link to="/companies" className="navbar-link">Companies</Link>

            <Link to="/industry-news" className="navbar-link">Industry News</Link>

            <button onClick={toggleDarkMode} className="navbar-link">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            {isLoggedIn ? (
                <button onClick={handleLogout} className="navbar-link">Logout</button>
            ) : (
                <Link to="/login" className="navbar-link">Login</Link>
            )}
        </nav>
    );
}

export default Navbar;
