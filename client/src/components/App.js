import React, { useState, useEffect } from 'react';
import '../index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './NavBar';
import ProfilePage from './ProfilePage';
import IndustryNews from './IndustryNews';
import CompaniesPage from './CompaniesPage';

const API_BASE_URL = 'http://127.0.0.1:5555';

function App() {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [newUserName, setNewUserName] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newCompany, setNewCompany] = useState({
        name: '',
        link: '',
        indeed: '',
        category_name: '',
    });
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [loginData, setLoginData] = useState({ name: '', password: '' });
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/users`)
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {
        fetch(`${API_BASE_URL}/companies`)
            .then((response) => response.json())
            .then((data) => setCompanies(data))
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            setLoggedInUser({ id: userId, name: 'User' });
            fetchFavorites(userId);
        }
    }, []);

    const fetchFavorites = (userId) => {
        fetch(`${API_BASE_URL}/users/${userId}/favorites`)
            .then((response) => response.json())
            .then((data) => setFavorites(data))
            .catch((error) => console.log(error));
    };

    const handleLogin = () => {
        fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'Login successful!') {
                    localStorage.setItem('user_id', data.user_id);
                    setLoggedInUser({ id: data.user_id, name: loginData.name });
                    fetchFavorites(data.user_id);
                } else {
                    alert('Invalid credentials');
                }
            })
            .catch((error) => console.log(error));
    };

    const handleLogout = () => {
        fetch(`${API_BASE_URL}/logout`, { method: 'POST' })
            .then(() => {
                localStorage.removeItem('user_id');
                setLoggedInUser(null);
                setFavorites([]);
            })
            .catch((error) => console.log(error));
    };

    const handleAddUser = () => {
        fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newUserName, password: newUserPassword }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.id) {
                    setUsers([...users, data]);
                    alert('User added successfully!');
                } else {
                    alert('Error adding user');
                }
                setNewUserName('');
                setNewUserPassword('');
            })
            .catch((error) => console.log(error));
    };

    const handleAddCompany = () => {
        fetch(`${API_BASE_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCompany),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    setCompanies([...companies, newCompany]);
                    alert(`Company ${newCompany.name} added successfully!`);
                } else {
                    alert('Error adding company');
                }
                setNewCompany({ name: '', link: '', indeed: '', category_name: '' });
            })
            .catch((error) => console.log(error));
    };

    return (
        <Router>
            <div className="App">
                <Navbar isLoggedIn={loggedInUser} onLogout={handleLogout} />

                <Routes>
                    <Route
                        path="/profile"
                        element={
                            <ProfilePage
                                loggedInUser={loggedInUser}
                                favorites={favorites}
                                fetchFavorites={() => fetchFavorites(loggedInUser?.id)}
                            />
                        }
                    />
                    <Route path="/industry-news" element={<IndustryNews />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route
                        path="/"
                        element={
                            loggedInUser ? (
                                <div>
                                    <h2>Welcome, {loggedInUser.name}!</h2>
                                    <h3>Add New Company</h3>
                                    <input
                                        type="text"
                                        placeholder="Company Name"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Company Link"
                                        value={newCompany.link}
                                        onChange={(e) => setNewCompany({ ...newCompany, link: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Indeed Link"
                                        value={newCompany.indeed}
                                        onChange={(e) => setNewCompany({ ...newCompany, indeed: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Category"
                                        value={newCompany.category_name}
                                        onChange={(e) => setNewCompany({ ...newCompany, category_name: e.target.value })}
                                    />
                                    <button onClick={handleAddCompany}>Add Company</button>
                                    <ProfilePage
                                        loggedInUser={loggedInUser}
                                        favorites={favorites}
                                        fetchFavorites={() => fetchFavorites(loggedInUser?.id)}
                                    />
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            ) : (
                                <div>
                                    <h2>Users</h2>
                                    <ul>
                                        {users.map((user) => (
                                            <li key={user.id}>{user.name}</li>
                                        ))}
                                    </ul>
                                    <input
                                        type="text"
                                        placeholder="Add New User"
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                    />
                                    <button onClick={handleAddUser}>Add User</button>
                                    <h3>Login</h3>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={loginData.name}
                                        onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    />
                                    <button onClick={handleLogin}>Login</button>
                                </div>
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
