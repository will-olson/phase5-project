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
      // Prepare the dynamic list of company names and links
      const companyNames = userFavorites.map(favorite => favorite.name).join(', ');
  
      const payload = {
        ...inputs,
        user_favorites: userFavorites,
        news_articles: newsArticles,
        user_id: loggedInUser,
        prompt: `${inputs.prompt} Please check if any of the following companies are mentioned: ${companyNames}. If any of these companies are mentioned, provide the latest news articles and ensure that the links to these articles are clickable.`,
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
      setInputs((prevInputs) => {
        const newArray = checked
          ? [...prevInputs[field], value]
          : prevInputs[field].filter((val) => val !== value);
        return { ...prevInputs, [field]: newArray };
      });
    } else {
      setInputs((prevInputs) => ({ ...prevInputs, [field]: value }));
    }
  };

  const formatResponse = (response) => {
    
    response = response.replace(/(https?:\/\/[^\s]+(?:[^\s.<>,;()]*))/g, (match) => {
      
      let cleanMatch = match.replace(/[.,;?!\)]*$/, '');
      
      return `<a href="${match}" target="_blank">${cleanMatch}</a>`;
    });
  
    
    response = response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.*?)\n/g, '<ul><li>$1</li></ul>')
      .replace(/^(#) (.*?)$/gm, '<h1>$2</h1>')
      .replace(/^(##) (.*?)$/gm, '<h2>$2</h2>')
      .replace(/^(###) (.*?)$/gm, '<h3>$2</h3>')
      .replace(/^(####) (.*?)$/gm, '<h4>$2</h4>')
      .replace(/\n/g, '<br />');
  
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

    return (
        <div className="career-assistant-container" style={{ display: 'flex' }}>
            {/* Left Side: Personalization Inputs */}
            <div className="input-section" style={{ width: '40%', padding: '10px' }}>
                <h3>Personalize Your Career Analysis</h3>

                {/* Question Prompt Input */}
                <div>
                    <label htmlFor="prompt">Ask Your Career Question:</label>
                    <textarea
                        id="prompt"
                        value={inputs.prompt}
                        onChange={(e) => setInputs({ ...inputs, prompt: e.target.value })}
                        rows="4"
                        placeholder="Enter your question here"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Scope of Analysis (Checkboxes) */}
                <div>
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
                <div>
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
                <div>
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
                <div>
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
                <div>
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
                <div>
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

                {/* Specific Topics */}
                <div>
                    <label>Specific Topics</label>
                    <input
                        type="text"
                        value={inputs.specific_topics}
                        onChange={(e) => handleInputChange(e, 'specific_topics')}
                    />
                </div>

                {/* Preferred Format */}
                <div>
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
                <button onClick={handleSubmit}>Get Career Advice</button>
            </div>

            {/* Right Side: AI Chat Window */}
            <div className="output-section" style={{ width: '60%', padding: '10px', borderLeft: '1px solid #ccc' }}>
                <h3>AI's Response</h3>
                <div className="chat-window" style={{ border: '1px solid #ccc', padding: '10px' }}>
                    {responses.map((response, index) => (
                        <div key={index}>
                            <div><strong>Q:</strong> {response.question}</div>
                            <div dangerouslySetInnerHTML={{ __html: formatResponse(response.answer) }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareerAssistant;
