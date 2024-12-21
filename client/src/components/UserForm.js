import React, { useState } from 'react';

function UserForm({ onLogin }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isLogin ? 'http://127.0.0.1:5555/login' : 'http://127.0.0.1:5555/users';
        const method = 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            if (onLogin) onLogin(isLogin);
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="user-form">
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Create an Account' : 'Already have an Account? Login'}
            </button>
        </div>
    );
}

export default UserForm;
