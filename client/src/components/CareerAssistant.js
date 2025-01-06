import React, { useState } from 'react';
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
    const [response, setResponse] = useState('');

    const handleSubmit = async () => {
        try {
            const res = await axios.post('http://localhost:5555/career-assistant', inputs);
            setResponse(res.data.response);
        } catch (error) {
            console.error("Error:", error.response ? error.response.data : error.message);
            setResponse('An error occurred. Please try again.');
        }
    };
    

    const handleInputChange = (e, field) => {
        const { value, type, checked } = e.target;
        if (type === 'checkbox') {
            setInputs(prevInputs => {
                const newArray = checked
                    ? [...prevInputs[field], value]
                    : prevInputs[field].filter(val => val !== value);
                return { ...prevInputs, [field]: newArray };
            });
        } else {
            setInputs(prevInputs => ({ ...prevInputs, [field]: value }));
        }
    };

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
                        onChange={e => setInputs({ ...inputs, prompt: e.target.value })}
                        rows="4"
                        placeholder="Enter your question here"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Scope of Analysis (Checkboxes) */}
                <div>
                    <label>Scope of Analysis</label>
                    <div>
                        {['Market Trends', 'Company-Specific Risks', 'Growth Opportunities', 'Competitor Comparison', 'Innovation & R&D'].map(option => (
                            <label key={option}>
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={inputs.scope_of_analysis.includes(option)}
                                    onChange={e => handleInputChange(e, 'scope_of_analysis')}
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
                        onChange={e => handleInputChange(e, 'sentiment_tone')}
                    >
                        {['Neutral', 'Optimistic', 'Critical', 'Balanced'].map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Level of Detail (Dropdown) */}
                <div>
                    <label>Level of Detail</label>
                    <select
                        value={inputs.level_of_detail}
                        onChange={e => handleInputChange(e, 'level_of_detail')}
                    >
                        {['Brief (2-3 bullet points)', 'Moderate (Short paragraph)', 'Comprehensive (Detailed analysis)'].map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Preferred News Sources (Checkboxes or Multi-Select Dropdown) */}
                <div>
                    <label>Preferred News Sources</label>
                    <div>
                        {['Reuters', 'Bloomberg', 'The Verge', 'TechCrunch', 'Local News Sources'].map(option => (
                            <label key={option}>
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={inputs.preferred_sources.includes(option)}
                                    onChange={e => handleInputChange(e, 'preferred_sources')}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Time Frame (Radio Buttons) */}
                <div>
                    <label>Time Frame</label>
                    <div>
                        {['Last 7 days', 'Last 30 days', 'Last 6 months', 'Custom Range'].map(option => (
                            <label key={option}>
                                <input
                                    type="radio"
                                    value={option}
                                    checked={inputs.time_frame === option}
                                    onChange={e => handleInputChange(e, 'time_frame')}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Industry Focus (Checkboxes with "Other" option) */}
                <div>
                    <label>Industry Focus</label>
                    <div>
                        {['Technology', 'Finance', 'Healthcare', 'Retail'].map(option => (
                            <label key={option}>
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={inputs.industry_focus.includes(option)}
                                    onChange={e => handleInputChange(e, 'industry_focus')}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Specific Topics (Text Input) */}
                <div>
                    <label>Specific Topics</label>
                    <input
                        type="text"
                        value={inputs.specific_topics}
                        onChange={e => handleInputChange(e, 'specific_topics')}
                    />
                </div>

                {/* Preferred Format (Radio Buttons) */}
                <div>
                    <label>Preferred Format</label>
                    <div>
                        {['Bullet Points', 'Short Summary', 'Detailed Report'].map(option => (
                            <label key={option}>
                                <input
                                    type="radio"
                                    value={option}
                                    checked={inputs.preferred_format === option}
                                    onChange={e => handleInputChange(e, 'preferred_format')}
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
                <div className="chat-window" style={{ border: '1px solid #ddd', padding: '10px', minHeight: '300px' }}>
                    <p>{response}</p>
                </div>
            </div>
        </div>
    );
};

export default CareerAssistant;
