import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DataPage() {
    const [companies, setCompanies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [randomCompanies, setRandomCompanies] = useState([]);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));
    const [apiData, setApiData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const fetchApiData = async (companySymbol) => {
        try {
            setLoading(true);
            setError('');

            const [financialResponse, worldBankResponse] = await Promise.all([
                axios.get(`/financial-metrics/${companySymbol}`),
                axios.get(`/api/world-bank`, { params: { indicator: "SP.POP.TOTL" } }),
            ]);

            setApiData(prevState => ({
                ...prevState,
                [companySymbol]: {
                    financialMetrics: financialResponse.data,
                    worldBankData: worldBankResponse.data,
                },
            }));
        } catch (err) {
            setError(`Failed to fetch data for ${companySymbol}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Data Insights</h2>

            {!userId && (
                <div className="company-tile">
                    <p>You must be logged in to view data insights.</p>
                </div>
            )}

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
                    <h3>Data Insights</h3>
                    <div className="company-grid">
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map(company => (
                                <div key={company.id} className="data-tile">
                                    <h4>{company.name}</h4>
                                    <button onClick={() => fetchApiData(company.symbol)}>
                                        Fetch Data
                                    </button>
                                    {loading && <p>Loading data...</p>}
                                    {error && <p>{error}</p>}

                                    {apiData[company.symbol] && (
                                        <>
                                            <h5>Financial Metrics</h5>
                                            <ul>
                                                {Object.entries(apiData[company.symbol].financialMetrics || {}).map(
                                                    ([key, value]) => (
                                                        <li key={key}>
                                                            <strong>{key}:</strong> {value}
                                                        </li>
                                                    )
                                                )}
                                            </ul>

                                            <h5>World Bank Regional Insights</h5>
                                            <ul>
                                                {apiData[company.symbol].worldBankData[1] &&
                                                    apiData[company.symbol].worldBankData[1]
                                                        .slice(0, 5) 
                                                        .map((region, index) => (
                                                            <li key={index}>
                                                                <strong>{region.country.value}:</strong> {region.value}
                                                            </li>
                                                        ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
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

export default DataPage;