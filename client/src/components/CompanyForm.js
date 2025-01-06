import React, { useState } from 'react';

function CompanyForm({ onCompanyAdd }) {
    const [company, setCompany] = useState({
        name: '',
        link: '',
        indeed: '',
        category_name: ''
    });

    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        
        if (!company.name || !company.link) {
            setError('Company name and link are required');
            return;
        }

        fetch('http://127.0.0.1:5555/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(company),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    onCompanyAdd(data);
                    setCompany({ name: '', link: '', indeed: '', category_name: '' });
                    setError('');
                } else {
                    setError('Category must exist');
                }
            })
            .catch((error) => {
                console.log(error);
                setError('An error occurred while adding the company');
            });
    };

    return (
        <div className="content-square">
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="text"
                    placeholder="Company Name"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="input"
                />
                <input
                    type="text"
                    placeholder="Company Link"
                    value={company.link}
                    onChange={(e) => setCompany({ ...company, link: e.target.value })}
                    className="input"
                />
                <input
                    type="text"
                    placeholder="Indeed Link"
                    value={company.indeed}
                    onChange={(e) => setCompany({ ...company, indeed: e.target.value })}
                    className="input"
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={company.category_name}
                    onChange={(e) => setCompany({ ...company, category_name: e.target.value })}
                    className="input"
                />
                <button type="submit" className="button">Add Company</button>
            </form>
        </div>
    );
}

export default CompanyForm;
