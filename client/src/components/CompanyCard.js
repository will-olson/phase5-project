import React, { useState, useEffect } from 'react';

function CompanyCard({ company, isFavorite = false, onFavoriteToggle }) {
    const [favorite, setFavorite] = useState(isFavorite);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));
    const [isEditing, setIsEditing] = useState(false);
    const [newLink, setNewLink] = useState(company.link);
    const [newIndeed, setNewIndeed] = useState(company.indeed);

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

        if (!company.id || !userId) {
            console.error('Company ID and User ID are required');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5555/favorites?user_id=${userId}&company_id=${company.id}`, {
                method: newFavoriteStatus ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, company_id: company.id }),
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

    const handleLinkUpdate = async () => {
        if (!company.id || !newLink || !newIndeed) return;

        try {
            const response = await fetch(`http://localhost:5555/companies/${company.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    link: newLink,
                    indeed: newIndeed
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update link');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating link:', error);
        }
    };


    const handleDelete = async () => {
        if (!company.id) return;

        try {
            const response = await fetch(`http://localhost:5555/companies/${company.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete company');
            }

            alert('Company deleted successfully');
            
        } catch (error) {
            console.error('Error deleting company:', error);
        }
    };

    useEffect(() => setFavorite(isFavorite), [isFavorite]);

    return (
        <div className="company-card">
            <h3>{company.name || 'Company Name Not Available'}</h3>
            <h4>{company.category || 'Category Not Available'}</h4>

            <div className="company-links">
                {!isEditing ? (
                    <>
                        {company.link && (
                            <a href={company.link} target="_blank" rel="noopener noreferrer" className="company-link">
                                LinkedIn
                            </a>
                        )}
                        {company.indeed && (
                            <a href={company.indeed} target="_blank" rel="noopener noreferrer" className="indeed-link">
                                Indeed
                            </a>
                        )}
                    </>
                ) : (
                    <div>
                        <input
                            type="text"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            placeholder="Update LinkedIn URL"
                        />
                        <input
                            type="text"
                            value={newIndeed}
                            onChange={(e) => setNewIndeed(e.target.value)}
                            placeholder="Update Indeed URL"
                        />
                    </div>
                )}
            </div>

            <div className="button-group">
                <button
                    className={`favorite-button ${favorite ? 'favorited' : ''}`}
                    onClick={() => handleFavoriteClick(!favorite)}
                    aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {favorite ? '★' : '☆'}
                </button>
                {isEditing ? (
                    <button onClick={handleLinkUpdate}>Save Links</button>
                ) : (
                    <button onClick={() => setIsEditing(true)}>Edit Links</button>
                )}
                <button onClick={handleDelete} className="delete-button">Delete</button>
            </div>
        </div>
    );
}

export default CompanyCard;
