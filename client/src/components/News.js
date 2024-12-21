// client/src/components/News.js
import React, { useState, useEffect } from 'react';

function News({ companyName }) {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        fetch(`http://127.0.0.1:5555/news/${companyName}`)
            .then(response => response.json())
            .then(data => setArticles(data))
            .catch(error => console.log(error));
    }, [companyName]);

    return (
        <div className="container">
            <h2 className="section-title">News for {companyName}</h2>
            {articles.length === 0 ? (
                <p>No news available.</p>
            ) : (
                <div className="company-tiles">
                    {articles.map((article, index) => (
                        <div key={index} className="content-square">
                            <a href={article.url} className="link" target="_blank" rel="noopener noreferrer">
                                {article.title}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default News;
