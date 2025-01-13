import React, { useState, useEffect } from 'react';
import '../index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Navbar from './NavBar';
import ProfilePage from './ProfilePage';
import IndustryNews from './IndustryNews';
import CompaniesPage from './CompaniesPage';
import CompanyForm from './CompanyForm';
import CareerAssistant from './CareerAssistant';
import DataPage from './DataPage';

const API_BASE_URL = 'http://127.0.0.1:5555';

function App() {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
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
        fetch(`${API_BASE_URL}/favorites?user_id=${userId}`)
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

    const handleAddUser = (values) => {
        fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.id) {
                    setUsers([...users, data]);
                    alert('User added successfully!');
                } else {
                    alert('Unable to add user. Try a different name.');
                }
            })
            .catch((error) => console.log(error));
    };

    const validationSchema = Yup.object({
        name: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(15, 'Username must not exceed 15 characters')
            .required('Username is required')
            .test('username-unique', 'Username is already taken', async (value) => {
                const usernameExists = users.some((user) => user.name === value);
                if (usernameExists) {
                    return false;
                }
                return true;
            }),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    });

    return (
        <Router>
            <div className="App">
                <Navbar isLoggedIn={loggedInUser} onLogout={handleLogout} />

                <Routes>
                    <Route path="/profile" element={<ProfilePage loggedInUser={loggedInUser} favorites={favorites} fetchFavorites={() => fetchFavorites(loggedInUser?.id)} />} />
                    <Route path="/industry-news" element={<IndustryNews />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/data" element={<DataPage />} />
                    <Route path="/career-assistant" element={<CareerAssistant />} />
                    <Route
                        path="/"
                        element={
                            loggedInUser ? (
                                <div>
                                    <h2>Welcome, {loggedInUser.name}!</h2>
                                    <h3>Add New Company</h3>
                                    <CompanyForm />
                                    <ProfilePage loggedInUser={loggedInUser} favorites={favorites} fetchFavorites={() => fetchFavorites(loggedInUser?.id)} />
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            ) : (
                                <div>
                                    <h2>Users</h2>
                                    <div className="users-container">
                                        {users.map((user) => (
                                            <div key={user.id} className="user-container">
                                                <div className="user-info">
                                                    <h4>{user.name}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Formik
                                        initialValues={{ name: '', password: '' }}
                                        validationSchema={validationSchema}
                                        onSubmit={(values) => handleAddUser(values)}
                                    >
                                        <Form>
                                            <div>
                                                <Field type="text" name="name" placeholder="Username" />
                                                <ErrorMessage name="name" component="div" className="error" />
                                            </div>
                                            <div>
                                                <Field type="password" name="password" placeholder="Password" />
                                                <ErrorMessage name="password" component="div" className="error" />
                                            </div>
                                            <button type="submit">Add User</button>
                                        </Form>
                                    </Formik>
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
