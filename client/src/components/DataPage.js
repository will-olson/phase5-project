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
    const [topics, setTopics] = useState([]);
    const [topicSearchQuery, setTopicSearchQuery] = useState('');

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
            setTopCountries(shuffledCountries.slice(0, 5));
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

    const searchSymbol = async (companyName) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5555/symbol-search?company_name=${companyName}`);
            if (response.data && response.data.length > 0) {
                setSymbolMatches(response.data);
                setError('');
            } else {
                setError(response.data.error || 'No symbols found for the company');
            }
        } catch (err) {
            setError(`Error searching for company symbol: ${err.response?.data?.error || err.message}`);
        }
    };

    const [symbolMatches, setSymbolMatches] = useState([]);

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
        const selectedSymbol = event.target.value;
        setSelectedSymbol(selectedSymbol);
        fetchApiData(selectedSymbol);
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
            <div className="search-bar-container">
                <div className="company-search">
                <input
                    type="text"
                    placeholder="Search for companies..."
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
                    <h3>5 Countries by Region, Income Level, and Capital City</h3>
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
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map(company => (
                                <div key={company.id} className="data-tile">
                                    <h4>{company.name}</h4>
                                    <button onClick={() => fetchApiData(company.symbol)}>Fetch Data</button>
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
