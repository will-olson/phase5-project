import React, { useState, useEffect } from 'react';

function CompanyCard({ company, isFavorite = false, onFavoriteToggle, userId }) {
    const [favorite, setFavorite] = useState(isFavorite);

    const checkLoginStatus = async () => {
        if (!userId) {
            alert('You must log in first to add to favorites');
            return false;
        }
        return true;
    };

    const handleFavoriteClick = async (companyId, newFavoriteStatus) => {
        const isLoggedIn = await checkLoginStatus();
        if (!isLoggedIn) return;

        try {
            const response = await fetch(`http://localhost:5555/favorites`, {
                method: newFavoriteStatus ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    company_id: companyId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update favorite status');
            }

            setFavorite(newFavoriteStatus);

            if (onFavoriteToggle) {
                onFavoriteToggle(companyId, newFavoriteStatus);
            }
        } catch (error) {
            console.error('Failed to update favorite status:', error);
        }
    };

    useEffect(() => {
        setFavorite(isFavorite);
    }, [isFavorite]);

    return (
        <div className="company-card">
            <h3>{company.name}</h3>
            <h4>{company.category}</h4>
            <div className="company-links">
                <a href={company.link} target="_blank" rel="noopener noreferrer" className="company-link">LinkedIn</a>
                <a href={company.indeed} target="_blank" rel="noopener noreferrer" className="indeed-link">Indeed</a>
            </div>
            <button
                className={`favorite-button ${favorite ? 'favorited' : ''}`}
                onClick={() => {
                    const newFavoriteStatus = !favorite;
                    handleFavoriteClick(company.id, newFavoriteStatus);
                }}
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
                {favorite ? '★' : '☆'}
            </button>
        </div>
    );
}

export default CompanyCard;
