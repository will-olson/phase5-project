import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DataPage() {
    const [companies, setCompanies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [companySymbols, setCompanySymbols] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));
    const [apiData, setApiData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [topCountries, setTopCountries] = useState([]);
    const [topStocks, setTopStocks] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5555/companies', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                setCompanies(data);
                setCompanySymbols(data.map(company => company.symbol));
            })
            .catch(error => console.log('Error fetching companies:', error));

        fetchTopCountries();
        fetchTopStocks();

        const handleStorageChange = () => {
            setUserId(localStorage.getItem('user_id'));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    
    const fetchTopCountries = async () => {
        try {
            const response = await axios.get('https://api.worldbank.org/v2/country?format=json');
            const countries = response.data[1].map(country => ({
                name: country.name,
                population: country.population || 'N/A',
                GDP: country.gdp || 'N/A',
                gdpPerCapita: country.gdpPerCapita || 'N/A',
            }));
            setTopCountries(countries.slice(0, 5));
        } catch (err) {
            console.error('Error fetching top countries:', err);
        }
    };

    
    const fetchTopStocks = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5555/api/top-stocks');
            setTopStocks(response.data.slice(0, 5));
        } catch (err) {
            console.error('Error fetching top stocks:', err);
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSelectChange = (event) => {
        setSelectedSymbol(event.target.value);
    };

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

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {userId && !searchQuery && (
                <>
                    <h3>Top 5 Countries by Population, GDP, and GDP Per Capita</h3>
                    <div className="top-countries">
                        {topCountries.map((country, index) => (
                            <div key={index} className="country-tile">
                                <h4>{country.name}</h4>
                                <p>Population: {country.population}</p>
                                <p>GDP: {country.GDP}</p>
                                <p>GDP per capita: {country.gdpPerCapita}</p>
                            </div>
                        ))}
                    </div>

                    <h3>Top 5 Stocks by Market Cap</h3>
                    <div className="top-stocks">
                        {topStocks.map((stock, index) => (
                            <div key={index} className="stock-tile">
                                <h4>{stock.Name} ({stock.symbol})</h4>
                                <p>Market Cap: {stock.MarketCapitalization}</p>
                                <button onClick={() => fetchApiData(stock.symbol)}>Fetch Data</button>
                                {apiData[stock.symbol] && (
                                    <>
                                        <h5>Financial Metrics</h5>
                                        <ul>
                                            {Object.entries(apiData[stock.symbol].financialMetrics || {}).map(
                                                ([key, value]) => (
                                                    <li key={key}>
                                                        <strong>{key}:</strong> {value}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {userId && searchQuery && (
                <>
                    <h3>Search Results</h3>
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
                                                {Object.entries(apiData[company.symbol].worldBankData || {}).map(
                                                    ([key, value]) => (
                                                        <li key={key}>
                                                            <strong>{key}:</strong> {value}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No companies found</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default DataPage;
