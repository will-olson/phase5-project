import React from 'react';

function News({ news }) {
    return (
        <div className="container">
            <h2 className="section-title">News for {news.company_name}</h2>
            {news.articles.length === 0 ? (
                <p>No news available.</p>
            ) : (
                <div className="company-tiles">
                    {news.articles.map((article, index) => (
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
