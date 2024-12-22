import React, { useState, useEffect } from 'react';

function CompanyCard({ company, isFavorite = false, onFavoriteToggle }) {
    const [favorite, setFavorite] = useState(isFavorite);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));

    useEffect(() => {
        const handleStorageChange = () => {
            setUserId(localStorage.getItem('user_id'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const checkLoginStatus = () => {
        if (!userId) {
            alert('You must log in first to add to favorites');
            return false;
        }
        return true;
    };

    const handleFavoriteClick = async (newFavoriteStatus) => {
        if (!checkLoginStatus()) return;

        console.log('Company ID:', company.id);
        console.log('User ID:', userId);
        
    if (!company.id || !userId) {
        if (!company.id) {
            console.error('Company ID is missing');
        }
        if (!userId) {
            console.error('User ID is missing');
        }
        console.error('Company ID and User ID are required');
        return;
    }
    
        try {
            const url = `http://localhost:5555/favorites?user_id=${userId}&company_id=${company.id}`;
            console.log(`Sending request to: ${url}`);
    
            const response = await fetch(`http://localhost:5555/favorites?user_id=${userId}&company_id=${company.id}`, {
                method: newFavoriteStatus ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    company_id: company.id,
                }),
            });
            

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update favorite status');
            }

            setFavorite(newFavoriteStatus);
            onFavoriteToggle && onFavoriteToggle(company.id, newFavoriteStatus);
        } catch (error) {
            console.error('Failed to update favorite status:', error);
        }
    };

    useEffect(() => setFavorite(isFavorite), [isFavorite]);

    return (
        <div className="company-card">
            <h3>{company.name || 'Company Name Not Available'}</h3>
            <h4>{company.category || 'Category Not Available'}</h4>
            <div className="company-links">
                {company.link && (
                    <a href={company.link} target="_blank" rel="noopener noreferrer" className="company-link">LinkedIn</a>
                )}
                {company.indeed && (
                    <a href={company.indeed} target="_blank" rel="noopener noreferrer" className="indeed-link">Indeed</a>
                )}
            </div>
            <button
                className={`favorite-button ${favorite ? 'favorited' : ''}`}
                onClick={() => handleFavoriteClick(!favorite)}
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
                {favorite ? '★' : '☆'}
            </button>
        </div>
    );
}

export default CompanyCard;
