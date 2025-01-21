import React, { useState, useEffect } from 'react';
import CompanyCard from './CompanyCard';
import News from './News';

const ProfilePage = ({ loggedInUser }) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (loggedInUser) {
          setUser(loggedInUser);
          fetchFavorites(loggedInUser.id);
        } else {
          console.log('User not logged in');
        }
      } catch (error) {
        setError('Failed to load user data');
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [loggedInUser]);

  const fetchFavorites = async (userId) => {
    try {
      const response = await fetch(`/favorites?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const favoritesData = await response.json();

        
        const updatedFavorites = favoritesData.map(favorite => ({
          id: favorite.company_id,
          name: favorite.company_name,
          link: favorite.link,
          category: favorite.category,
          indeed: favorite.indeed,
        }));

        setFavorites(updatedFavorites);
        fetchNewsForFavorites(updatedFavorites);
      }
    } catch (error) {
      setError('Failed to load favorites');
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchNewsForFavorites = async (favoriteCompanies) => {
    const newsPromises = favoriteCompanies.map(async (favorite) => {
      const response = await fetch(`/news/${favorite.id}`);
      if (response.ok) {
        const newsData = await response.json();
        return {
          company_name: newsData.company_name,
          articles: newsData.articles
        };
      }
      return { company_name: favorite.name, articles: [] };
    });

    try {
      const allNews = await Promise.all(newsPromises);
      setNews(allNews);
    } catch (error) {
      setError('Failed to load news');
      console.error("Error fetching news:", error);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleFavoriteToggle = (companyId, newFavoriteStatus) => {
    setFavorites(prevFavorites => {
        if (newFavoriteStatus) {
            return [...prevFavorites, companyId];
        } else {
            return prevFavorites.filter(favorite => favorite.id !== companyId);
        }
    });
};

const handleCompanyDelete = (companyId) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(favorite => favorite.id !== companyId)
    );
};


  return (
    <div className="container">
      <div className="header">
        <h1>{user.name}'s Profile</h1>
      </div>
      <div className="content-square">
        <h2 className="section-title">Favorite Companies</h2>
        <div className="company-tiles">
          {favorites.length > 0 ? (
            favorites.map((favorite, index) => (
              <div className="company-tile" key={index}>
                <CompanyCard
                  company={{
                    id: favorite.id,
                    name: favorite.name,
                    link: favorite.link,
                    category: favorite.category,
                    indeed: favorite.indeed
                  }}
                  isFavorite={true}
                  onFavoriteToggle={handleFavoriteToggle}
                  onDelete={handleCompanyDelete}
                />
              </div>
            ))
          ) : (
            <p>No favorite companies yet.</p>
          )}
        </div>
      </div>

      <div className="content-square">
        <h2 className="section-title">Related News</h2>
        <div className="news-tile">
          {news.length > 0 ? (
            news.map((newsItem, index) => (
              <News key={index} news={newsItem} />
            ))
          ) : (
            <p>No news available for your favorited companies.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
