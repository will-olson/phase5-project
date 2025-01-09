import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DataPage() {
    const [companies, setCompanies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [symbolMatches, setSymbolMatches] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));
    const [apiData, setApiData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [topCountries, setTopCountries] = useState([]);
    const [topStocks, setTopStocks] = useState([]);
    const [topics, setTopics] = useState([]);
    const [topicSearchQuery, setTopicSearchQuery] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:5555/companies', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => setCompanies(data))
            .catch(err => console.error('Error fetching companies:', err));

        fetchTopCountries();
        fetchTopStocks();

        const handleStorageChange = () => {
            setUserId(localStorage.getItem('user_id'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const fetchTopCountries = async () => {
        try {
            const countriesResponse = await axios.get('https://api.worldbank.org/v2/country?format=json');
            const countries = countriesResponse.data[1].map(country => ({
                id: country.id,
                name: country.name,
                region: country.region.value,
                incomeLevel: country.incomeLevel.value,
                capitalCity: country.capitalCity,
                longitude: country.longitude,
                latitude: country.latitude,
            }));
            const shuffledCountries = countries.sort(() => Math.random() - 0.5);
            setTopCountries(shuffledCountries.slice(0, 4));
        } catch (err) {
            console.error('Error fetching top countries:', err);
        }
    };

    const fetchCountries = async (query = '') => {
        try {
            const response = await axios.get('https://api.worldbank.org/v2/country?format=json');
            const countries = response.data[1].map(country => ({
                id: country.id,
                name: country.name,
                region: country.region.value,
                incomeLevel: country.incomeLevel.value,
                capitalCity: country.capitalCity,
                longitude: country.longitude,
                latitude: country.latitude,
            }));
    
            if (query) {
                
                const filteredCountries = countries.filter(country =>
                    country.name.toLowerCase().includes(query.toLowerCase())
                );
                setTopCountries(filteredCountries);
            } else {
                
                const shuffledCountries = countries.sort(() => Math.random() - 0.5);
                setTopCountries(shuffledCountries.slice(0, 5));
            }
        } catch (err) {
            console.error('Error fetching countries:', err);
        }
    };

    const [countrySearchQuery, setCountrySearchQuery] = useState('');

    const handleCountrySearchChange = (event) => {
        const query = event.target.value.trim();
        setCountrySearchQuery(query);
        fetchCountries(query);
    };
    
    const fetchTopStocks = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5555/api/top-stocks');
            setTopStocks(response.data.slice(0, 5));
        } catch (err) {
            console.error('Error fetching top stocks:', err);
        }
    };

    const searchSymbol = async (companyName) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5555/symbol-search`, {
                params: { company_name: companyName },
            });
            if (response.status === 200 && response.data.length > 0) {
                setSymbolMatches(response.data);
                setError('');
            } else {
                setSymbolMatches([]);
                setError('No matching symbols found.');
            }
        } catch (err) {
            setError(`Error searching for company symbols: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.trim();
        setSearchQuery(query);
        if (query.length > 2) {
            searchSymbol(query);
        } else {
            setSymbolMatches([]);
        }
    };

    const handleSelectChange = (event) => {
        const symbol = event.target.value;
        setSelectedSymbol(symbol);
        fetchApiData(symbol);
    };

    const fetchApiData = async (companySymbol) => {
        try {
            setLoading(true);
            setError('');
            const financialResponse = await axios.get(`/financial-metrics/${companySymbol}`);
            setApiData(prev => ({ ...prev, [companySymbol]: financialResponse.data }));
        } catch (err) {
            setError(`Failed to fetch data for ${companySymbol}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async (query) => {
        try {
            const response = await axios.get('https://api.worldbank.org/v2/topic?format=json');
            const allTopics = response.data[1].map(topic => ({
                id: topic.id,
                name: topic.value,
                description: topic.sourceNote || 'No description available',
            }));
            const filteredTopics = allTopics.filter(topic =>
                topic.name.toLowerCase().includes(query.toLowerCase())
            );
            setTopics(filteredTopics);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    const handleTopicSearchChange = (event) => {
        const query = event.target.value.trim();
        setTopicSearchQuery(query);
        if (query.length > 0) {
            fetchTopics(query);
        } else {
            setTopics([]);
        }
    };

    const [dataCatalogQuery, setDataCatalogQuery] = useState('');
    const [catalogResults, setCatalogResults] = useState([]);

    const handleDataCatalogSearchChange = (event) => {
        const query = event.target.value.trim();
        setDataCatalogQuery(query);
        if (query.length > 0) {
            fetchCatalogResults(query);
        } else {
            setCatalogResults([]);
        }
    };

    const fetchCatalogResults = async (query) => {
        try {
            const response = await axios.get('http://localhost:5555/api/search', {
                params: { q: query }
            });
    
            console.log("Full API Response:", response);
    
            console.log("Response Data Field:", response.data);
    
            if (Array.isArray(response.data.data)) {
                console.log("'data' is an array with length:", response.data.data.length);
            } else {
                console.warn("'data' is not an array or missing");
            }
    
            if (Array.isArray(response.data.data) && response.data.data.length > 0) {
                console.log("Setting catalog results with data:", response.data.data);
                setCatalogResults(response.data.data);
            } else {
                console.log("No results found, resetting catalog results.");
                setCatalogResults([]);
            }
        } catch (err) {
            console.error('Error fetching data catalog results:', err);
        }
    };
    
    
    return (
        <div className="container">
            <h2>Financial Metrics, Global Insights, & Detailed Reporting</h2>
    
            {!userId && (
                <div className="company-tile">
                    <p>You must be logged in to view data insights.</p>
                </div>
            )}
    
            {userId && (
                <div className="search-bar-container">
                    <div className="company-search">
                        <input
                            type="text"
                            placeholder="Search companies"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                    <div className="topic-search">
                        <input
                            type="text"
                            placeholder="Search topics"
                            value={topicSearchQuery}
                            onChange={handleTopicSearchChange}
                            className="search-input"
                        />
                    </div>
                    <div className="company-search">
                            <input
                                type="text"
                                placeholder="Search regions"
                                value={countrySearchQuery}
                                onChange={handleCountrySearchChange}
                                className="search-input"
                            />
                        </div>
                        <div className="topic-search">
                            <input
                                type="text"
                                placeholder="Search reports"
                                value={dataCatalogQuery}
                                onChange={handleDataCatalogSearchChange}
                                className="search-input"
                            />
                        </div>
                </div>
            )}
    
            {topics.length > 0 && (
                <div className="topics-list">
                    {topics.map(topic => (
                        <div key={topic.id}>
                            <h4>{topic.name}</h4>
                            <p>{topic.description}</p>
                        </div>
                    ))}
                </div>
            )}
    
            {userId && !searchQuery && (
                <>
                    <div className="tiles-container">
                        <div className="tile">
                            <em>Use company search to explore publicly traded companies and financial metrics.</em>
                        </div>
                        <div className="tile">
                            <em>Review topics to guide key considerations for global analyses.</em>
                        </div>
                        <div className="tile">
                            <em>Use region search to view income levels and capital cities.</em>
                        </div>
                        <div className="tile">
                            <em>Access data and reporting from The World Bank.</em>

                        </div>
                    </div>

                    <div className="data-catalog-results">
                        {catalogResults.length > 0 && (
                            catalogResults.map((item, index) => (
                                <div key={index} className="data-catalog-item">
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">View Report</a>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="top-countries">
                        {topCountries.map((country, index) => (
                            <div key={index} className="country-tile">
                                <h4>{country.name}</h4>
                                <p>Region: {country.region}</p>
                                <p>Income Level: {country.incomeLevel}</p>
                                <p>Capital City: {country.capitalCity}</p>
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
                        {symbolMatches.length > 0 ? (
                            symbolMatches.map(match => (
                                <div key={match.symbol} className="data-tile">
                                    <h4>{match.name} ({match.symbol})</h4>
                                    <button onClick={() => fetchApiData(match.symbol)}>Fetch Data</button>
                                    {apiData[match.symbol] && (
                                        <>
                                            <h5>Financial Metrics</h5>
                                            <ul>
                                                {Object.entries(apiData[match.symbol].financialMetrics || {}).map(
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
