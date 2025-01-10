import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CareerAssistant = () => {
  const [inputs, setInputs] = useState({
    prompt: '',
    scope_of_analysis: [],
    sentiment_tone: 'Neutral',
    level_of_detail: 'Brief',
    preferred_sources: [],
    time_frame: 'Last 30 days',
    industry_focus: [],
    specific_topics: '',
    preferred_format: 'Bullet Points',
  });
  const [responses, setResponses] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user_id'));
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUserFavorites = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5555/favorites?user_id=${userId}`);
      if (response.data && response.data.favorites) {
        setUserFavorites(response.data.favorites);
      } else {
        setUserFavorites([]);
      }
    } catch (error) {
      setError('Failed to load favorites');
      console.error('Error fetching user favorites:', error);
    }
  };

  const fetchNewsArticles = async () => {
    const newsPromises = userFavorites.map(async (favorite) => {
      try {
        
        const response = await axios.get(`http://localhost:5555/news/${favorite.id}`);
        if (response.data && response.data.articles) {
          return {
            company_name: favorite.name,
            articles: response.data.articles,
          };
        }
        return { company_name: favorite.name, articles: [] };
      } catch (error) {
        console.error('Error fetching news for', favorite.name, error);
        return { company_name: favorite.name, articles: [] };
      }
    });
  
    try {
      const allNews = await Promise.all(newsPromises);
      setNewsArticles(allNews);
    } catch (error) {
      setError('Failed to load news');
      console.error('Error fetching news articles:', error);
    }
  };
  

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      setLoggedInUser(userId);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      setLoading(true);
      fetchUserFavorites(loggedInUser);
    }
  }, [loggedInUser]);

  
  useEffect(() => {
    if (userFavorites.length > 0) {
      fetchNewsArticles();
    }
    setLoading(false);
  }, [userFavorites, inputs.time_frame]);

  const handleSubmit = async () => {
    try {
      
      const companyNames = userFavorites.map(favorite => favorite.name).join(', ');
  
      const payload = {
        ...inputs,
        user_favorites: userFavorites,
        news_articles: newsArticles,
        user_id: loggedInUser,
        prompt: `${inputs.prompt} Please check if any of the following companies are mentioned: ${companyNames}. If any of these companies are mentioned, provide the latest news articles and ensure that the links to these articles are clickable.`,
        include_reports: inputs.include_reports,
      };
  
      const res = await axios.post('http://localhost:5555/career-assistant', payload);
      const newResponse = res.data.response;
  
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: inputs.prompt, answer: newResponse },
      ]);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: inputs.prompt, answer: 'An error occurred. Please try again.' },
      ]);
    }
  };
  

  const handleInputChange = (e, field) => {
    const { value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (field === 'include_reports') {
        setInputs((prevInputs) => ({ ...prevInputs, [field]: checked }));
      } else {
        setInputs((prevInputs) => {
          const newArray = checked
            ? [...prevInputs[field], value]
            : prevInputs[field].filter((val) => val !== value);
          return { ...prevInputs, [field]: newArray };
        });
      }
    } else {
      setInputs((prevInputs) => ({ ...prevInputs, [field]: value }));
    }
  };
  

  const formatResponse = (response) => {
    
    response = response.replace(/(https?:\/\/[^\s]+)(?=\s|$|[.,;?!)(]*)(?=\b)/g, (match) => {
        return `<a href="${match}" target="_blank">${match}</a>`;
    });

    
    response = response.replace(/\* (.*?)\n/g, '<ul><li>$1</li></ul>');
    response = response.replace(/^(#) (.*?)$/gm, '<h1>$2</h1>');
    response = response.replace(/^(##) (.*?)$/gm, '<h2>$2</h2>');
    response = response.replace(/^(###) (.*?)$/gm, '<h3>$2</h3>');
    response = response.replace(/^(####) (.*?)$/gm, '<h4>$2</h4>');
    response = response.replace(/\n/g, '<br />');

    return response;
};


  
  if (!loggedInUser) {
    return <div>You must be logged in to use the Career Assistant.</div>;
  }

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const copyToClipboard = (response) => {
    
    const formattedResponse = formatResponse(response);
  
    
    if (navigator.clipboard.write) {
      const htmlBlob = new Blob([formattedResponse], { type: 'text/html' });
  
      
      navigator.clipboard.write([
        new ClipboardItem({ 'text/html': htmlBlob })
      ]).then(() => {
        alert('Response copied');
      }).catch((error) => {
        console.error('Error copying to clipboard', error);
      });
    } else {
      
      navigator.clipboard.writeText(formattedResponse).then(() => {
        alert('Response copied to clipboard!');
      }).catch((error) => {
        console.error('Error copying to clipboard', error);
      });
    }
  };
  

  return (
    <div className="career-assistant-container">
    {/* Left Side: Personalization Inputs */}
    <div className="input-section">
        <h3>Personalize Your Business Analysis</h3>

        {/* Question Prompt Input */}
        <div>
            <label htmlFor="prompt">Prompt:</label>
            <textarea
                id="prompt"
                value={inputs.prompt}
                onChange={(e) => setInputs({ ...inputs, prompt: e.target.value })}
                rows="4"
                placeholder="Enter your question here"
            />
        </div>

        {/* Scope of Analysis (Checkboxes) */}
        <div className="prompt-criteria">
            <label>Scope of Analysis</label>
            <div>
                {['Market Trends', 'Company-Specific Risks', 'Growth Opportunities', 'Competitor Comparison', 'Innovation & R&D'].map((option) => (
                    <label key={option}>
                        <input
                            type="checkbox"
                            value={option}
                            checked={inputs.scope_of_analysis.includes(option)}
                            onChange={(e) => handleInputChange(e, 'scope_of_analysis')}
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>

        {/* Sentiment Tone (Dropdown) */}
        <div className="prompt-criteria">
            <label>Sentiment Tone</label>
            <select
                value={inputs.sentiment_tone}
                onChange={(e) => handleInputChange(e, 'sentiment_tone')}
            >
                {['Neutral', 'Optimistic', 'Critical', 'Balanced'].map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>

        {/* Level of Detail (Dropdown) */}
        <div className="prompt-criteria">
            <label>Level of Detail</label>
            <select
                value={inputs.level_of_detail}
                onChange={(e) => handleInputChange(e, 'level_of_detail')}
            >
                {['Brief (2-3 bullet points)', 'Moderate (Short paragraph)', 'Comprehensive (Detailed analysis)'].map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>

        {/* Preferred News Sources */}
        <div className="prompt-criteria">
            <label>Preferred News Sources</label>
            <div>
                {['Reuters', 'Bloomberg', 'The Verge', 'TechCrunch', 'Local News Sources'].map((option) => (
                    <label key={option}>
                        <input
                            type="checkbox"
                            value={option}
                            checked={inputs.preferred_sources.includes(option)}
                            onChange={(e) => handleInputChange(e, 'preferred_sources')}
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>

        {/* Time Frame */}
        <div className="prompt-criteria">
            <label>Time Frame</label>
            <div>
                {['Last 7 days', 'Last 30 days', 'Last 6 months'].map((option) => (
                    <label key={option}>
                        <input
                            type="radio"
                            value={option}
                            checked={inputs.time_frame === option}
                            onChange={(e) => handleInputChange(e, 'time_frame')}
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>

        {/* Industry Focus */}
        <div className="prompt-criteria">
            <label>Industry Focus</label>
            <div>
                {['Technology', 'Finance', 'Healthcare', 'Retail'].map((option) => (
                    <label key={option}>
                        <input
                            type="checkbox"
                            value={option}
                            checked={inputs.industry_focus.includes(option)}
                            onChange={(e) => handleInputChange(e, 'industry_focus')}
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
        {/* Include World Bank Reports Checkbox */}
        <div className="prompt-criteria">
            <label>
                <input
                    type="checkbox"
                    checked={inputs.include_reports}
                    onChange={(e) => handleInputChange(e, 'include_reports')}
                />
                Include relevant World Bank reports
            </label>
        </div>

        {/* Specific Topics */}
        <div className="prompt-criteria">
            <label>Specific Topics</label>
            <input
                type="text"
                value={inputs.specific_topics}
                onChange={(e) => handleInputChange(e, 'specific_topics')}
            />
        </div>

        {/* Preferred Format */}
        <div className="prompt-criteria">
            <label>Preferred Format</label>
            <div>
                {['Bullet Points', 'Short Summary', 'Detailed Report'].map((option) => (
                    <label key={option}>
                        <input
                            type="radio"
                            value={option}
                            checked={inputs.preferred_format === option}
                            onChange={(e) => handleInputChange(e, 'preferred_format')}
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>

        {/* Submit Button */}
        <button className="submit-button" onClick={handleSubmit}>Ask Career Assistant</button>
    </div>

    {/* Right Side: AI Chat Window */}
{/* Right Side: AI Chat Window */}
<div className="output-section">
      {/* Page Overview and Directions Tile */}
      <div className="header-tile">
  <h4>Welcome to Career Assistant</h4>
</div>

<div className="overview-tile">
  <p className="highlight">
    Use this tool to get personalized career insights and business analysis based on your questions and preferences. 
    Here’s how to get started:
  </p>
  <div className="custom-list-item">
    <span className="icon">➤</span> Use the left panel to input your career and business analysis questions.
  </div>
  <div className="custom-list-item">
    <span className="icon">➤</span> Choose the scope, sentiment tone, level of detail, response format, and more to inform the response.
  </div>
  <div className="custom-list-item">
    <span className="icon">➤</span> Click "Ask Career Assistant" to see your results below.
  </div>
  <p className="highlight italic-text">
    Remember, Career Assistant knows your favorite companies. When asked general career questions, it will use those favorite companies to establish your career preferences.
  </p>
  <p className="highlight italic-text">
  It can also provide strategic analyses across this set of companies, evaluate relative investment opporunities, recommend portolio allocations, and include recent news articles to further contextualize its commentary and recommendations.
  </p>
</div>



      <h3>Career Assistant's Response</h3>
      <div className="chat-window">
        {responses.map((response, index) => (
          <div key={index}>
            <div>
              <strong>Q:</strong> {response.question}
            </div>
            <div dangerouslySetInnerHTML={{ __html: formatResponse(response.answer) }} />
            {/* Copy Button */}
            <button onClick={() => copyToClipboard(response.answer)}>Copy Response</button>
          </div>
        ))}
      </div>
    </div>
  </div>
  
);

};

export default CareerAssistant;
