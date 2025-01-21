import React, { useState, useEffect } from 'react';
import CompanyCard from './CompanyCard';

function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [randomCompanies, setRandomCompanies] = useState([]);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));

    useEffect(() => {
        fetch('http://127.0.0.1:5555/companies', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                setCompanies(data);
                setRandomCompanies(getRandomCompanies(data, 10));
            })
            .catch(error => console.log('Error fetching companies:', error));

        const handleStorageChange = () => {
            setUserId(localStorage.getItem('user_id'));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const getRandomCompanies = (companiesArray, count) => {
        const shuffled = [...companiesArray].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCompanyDelete = (companyId) => {
        setCompanies(prevCompanies =>
            prevCompanies.filter(company => company.id !== companyId)
        );
    };

    return (
        
        <div className="container">
            <h2>Companies</h2>

            {!userId && 
                <div className="company-tile">
                    <p>You must be logged in to view company details and add favorites.</p>
                </div>
            }

            {userId && (
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for companies..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
            )}

            {userId && (
                <>
                    <h3>All Companies</h3>
                    <div className="company-grid">
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map(company => (
                                <CompanyCard
                                    key={company.id}
                                    company={company}
                                    userId={userId}
                                    onDelete={handleCompanyDelete}
                                />
                            ))
                        ) : (
                            <p>No companies found matching your search.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default CompaniesPage;
