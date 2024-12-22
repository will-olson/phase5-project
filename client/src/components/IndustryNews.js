import React, { useState, useEffect } from 'react';

function IndustryNews() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5555/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();

        
        const handleStorageChange = () => {
            setUserId(localStorage.getItem('user_id'));
        };

        window.addEventListener('storage', handleStorageChange);

        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleCategoryClick = async (categoryName) => {
        setSelectedCategory(categoryName);

        try {
            const response = await fetch(`http://127.0.0.1:5555/categories/${categoryName}`);
            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
            }
        } catch (error) {
            console.error('Error fetching companies and news:', error);
        }
    };

    return (
        <div className="industry-news-container">
            {!userId ? (
                <div className="company-tile">
                    <h2>You must be logged in to view industry news and categories.</h2>
                </div>
            ) : (
                <>
                    <aside className="categories-sidebar">
                        <h2>Industry Categories</h2>
                        <ul className="categories-list">
                            {categories.map((category) => (
                                <li
                                    key={category.name}
                                    className={`category-item ${
                                        selectedCategory === category.name ? 'selected' : ''
                                    }`}
                                    onClick={() => handleCategoryClick(category.name)}
                                >
                                    {category.name}
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="news-content">
                        {selectedCategory ? (
                            <>
                                <h2>{selectedCategory} Companies and News</h2>
                                {companies.length > 0 ? (
                                    companies.map((company) => (
                                        <div key={company.company_name} className="company-section">
                                            <h3>{company.company_name}</h3>
                                            <ul>
                                                {company.news_articles.length > 0 ? (
                                                    company.news_articles.map((article, index) => (
                                                        <li key={index}>
                                                            <a
                                                                href={article.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {article.title}
                                                            </a>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li>No news articles available.</li>
                                                )}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <p>No companies found for this category.</p>
                                )}
                            </>
                        ) : (
                            <p>Please select a category to view companies and news articles.</p>
                        )}
                    </main>
                </>
            )}
        </div>
    );
}

export default IndustryNews;
