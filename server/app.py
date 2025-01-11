#!/usr/bin/env python3

import time
import os
from dotenv import load_dotenv

from flask import Flask, request, jsonify, session
from config import db, api, migrate, CORS
from models import Company, Category, User, Favorites
import bcrypt
import requests
import openai
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

news_cache = {}
CACHE_TTL = 86400

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'mysecretkey'

db.init_app(app)
migrate.init_app(app, db)
api.init_app(app)
CORS(app, supports_credentials=True, origins="http://localhost:3000")


def fetch_news_for_company(company_name, desired_article_count=5):
    current_time = time.time()
    if company_name in news_cache:
        cached_data, timestamp = news_cache[company_name]
        if current_time - timestamp < CACHE_TTL:
            return [article for article in cached_data if article['title'] != '[Removed]'][:desired_article_count]


    response = requests.get("https://newsapi.org/v2/everything", params={
        "q": company_name,
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "relevancy",
        "pageSize": 10
    })

    if response.status_code == 200:
        articles = response.json().get('articles', [])
        news_cache[company_name] = (articles, current_time)
        return [article for article in articles if article['title'] != '[Removed]'][:desired_article_count]
    else:
        return []
    
import logging

logging.basicConfig(level=logging.DEBUG)

@app.route('/career-assistant', methods=['POST'])
def career_assistant():
    data = request.get_json()
    logging.debug(f"Received data: {data}") 
    
    user_id = data.get('user_id')
    
    if not user_id:
        logging.warning("User not logged in.")
        return jsonify({"message": "User not logged in."}), 401
    
    
    favorites = Favorites.query.filter_by(user_id=user_id).all()
    logging.debug(f"Fetched favorites for user {user_id}: {favorites}")
    
    favorite_companies = [{"company_name": fav.company.name, 
                           "link": fav.company.link, 
                           "category": fav.company.category.name if fav.company.category else None,
                           "id": fav.company.id} for fav in favorites]
    
    
    news_details = []
    for company in favorite_companies:
        articles = fetch_news_for_company(company['company_name'], desired_article_count=3)
        logging.debug(f"Fetched articles for company {company['company_name']}: {articles}")
        news_details.append({
            "company_name": company['company_name'],
            "news_articles": [{"title": article['title'], "url": article['url']} for article in articles]
        })

    
    favorites_prompt = ""
    if favorite_companies:
        favorites_prompt = "User's favorite companies:\n" + "\n".join(
            [f"- {company['company_name']} (Category: {company['category']})" for company in favorite_companies]
        ) + "\n\n"
        favorites_prompt += "Recent news articles:\n" + "\n".join(
            [f"{news['company_name']}:\n" + "\n".join([f"  - <a href='{article['url']}' target='_blank'>{article['title']}</a>" for article in news['news_articles']]) for news in news_details]
        ) + "\n"

    
    
    logging.debug(f"Generated AI prompt: {favorites_prompt}")
    
    
    career_question = data.get('prompt', '')  
    logging.debug(f"Career Question: {career_question}")
    
    
    prompt = f"Provide a personalized career analysis based on the following preferences:\n"
    if career_question:
        prompt += f"Career Inquiry: {career_question}\n"
    else:
        prompt += f"Career Inquiry: General career insights\n"
    
    
    scope_of_analysis = data.get('scope_of_analysis', [])
    sentiment_tone = data.get('sentiment_tone', 'Neutral')
    level_of_detail = data.get('level_of_detail', 'Brief')
    preferred_sources = data.get('preferred_sources', [])
    time_frame = data.get('time_frame', 'Last 30 days')
    industry_focus = data.get('industry_focus', [])
    specific_topics = data.get('specific_topics', '')
    preferred_format = data.get('preferred_format', 'Bullet Points')

    selected_topic = data.get('selectedTopic', '')
    selected_company = data.get('selectedCompany', '')
    selected_region = data.get('selectedRegion', '')
    selected_report = data.get('selectedReport', '')
    
    
    prompt += f"Scope of Analysis: {', '.join(scope_of_analysis)}\n"
    prompt += f"Sentiment Tone: {sentiment_tone}\n"
    prompt += f"Level of Detail: {level_of_detail}\n"
    if preferred_sources:
        prompt += f"Preferred News Sources: {', '.join(preferred_sources)}\n"
    prompt += f"Time Frame: {time_frame}\n"
    if industry_focus:
        prompt += f"Industry Focus: {', '.join(industry_focus)}\n"
    if specific_topics:
        prompt += f"Specific Topics: {specific_topics}\n"
    prompt += f"Preferred Format: {preferred_format}\n"
    prompt += f"Recent company news articles: Include clickable links to the latest news articles **only** for the companies mentioned in the user's career inquiry. If the company is part of the user's favorites but is not mentioned in the inquiry, exclude it from the news section.\n"
    prompt += favorites_prompt
    

    if selected_topic:
        prompt += f"Focus on the topic: {selected_topic}. "
    if selected_company:
        prompt += f"Consider the company: {selected_company}. "
    if selected_region:
        prompt += f"Focus on the region: {selected_region}. "
    if selected_report:        
        response = requests.get(f"http://localhost:5555/api/search?q={selected_report}")
        if response.status_code == 200:
            data = response.json()
            reports = data.get('data', [])
            
            selected_report_normalized = selected_report.strip().lower()
            
            matching_report = next(
                (report for report in reports if report['title'].strip().lower() == selected_report_normalized),
                None
            )
            
            if matching_report:
                prompt += f"Search for related reports titled: {matching_report['title']}.\n"
                prompt += f"Description: {matching_report['description']}\n"
                
                if matching_report['link']:
                    prompt += f"Full Report Link: {matching_report['link']}\n"
                else:
                    prompt += "No link available for this report.\n"
            else:
                prompt += "No related report found.\n"
        else:
            prompt += "Failed to retrieve report data.\n"
    
    logging.debug(f"Final AI prompt: {prompt}")

    api_data = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }

    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", 
                                 headers={"Content-Type": "application/json", 
                                          "Authorization": f"Bearer {OPENAI_API_KEY}"}, 
                                 json=api_data)
        response.raise_for_status()
        
        
        api_response = response.json()
        logging.debug(f"API response: {api_response}")
        
        ai_response = api_response['choices'][0]['message']['content'].strip()
        return jsonify({"response": ai_response}), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Error during OpenAI request: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/world-bank", methods=["GET"])
def get_world_bank_data():
    indicator = request.args.get("indicator", "SP.POP.TOTL")
    url = f"http://api.worldbank.org/v2/country/all/indicator/{indicator}?format=json"
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch World Bank data"}), 500

    data = response.json()

    if len(data) < 2 or not data[1]:
        return jsonify({"error": f"No data found for indicator {indicator}"}), 500

    return jsonify(data)


financial_metrics_cache = {}

@app.route('/financial-metrics/<string:company_symbol>', methods=['GET'])
def get_financial_metrics(company_symbol):
    current_time = time.time()
    
    
    if company_symbol in financial_metrics_cache:
        cached_data, timestamp = financial_metrics_cache[company_symbol]
        if current_time - timestamp < CACHE_TTL:
            return jsonify(cached_data), 200
    
    
    response = requests.get("https://www.alphavantage.co/query", params={
        "function": "OVERVIEW",
        "symbol": company_symbol,
        "apikey": ALPHA_VANTAGE_API_KEY
    })

    if response.status_code == 200:
        metrics_data = response.json()
        
        
        financial_metrics_cache[company_symbol] = (metrics_data, current_time)
        
        return jsonify(metrics_data), 200
    else:
        return jsonify({"error": "Failed to fetch financial metrics"}), 500


@app.route('/api/top-stocks', methods=['GET'])
def get_top_stocks():
    top_stocks_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    
    stocks_data = []
    
    for symbol in top_stocks_symbols:
        response = requests.get("https://www.alphavantage.co/query", params={
            "function": "OVERVIEW",
            "symbol": symbol,
            "apikey": ALPHA_VANTAGE_API_KEY
        })

        if response.status_code == 200:
            stock_data = response.json()
            stock_data['symbol'] = symbol
            stocks_data.append(stock_data)
    
    return jsonify(stocks_data), 200

@app.route('/symbol-search', methods=['GET'])
def symbol_search():
    company_name = request.args.get('company_name')
    if company_name:
        try:
            response = requests.get(
                'https://www.alphavantage.co/query',
                params={
                    'function': 'SYMBOL_SEARCH',
                    'keywords': company_name,
                    'apikey': ALPHA_VANTAGE_API_KEY
                }
            )

            if response.status_code == 200:
                data = response.json()
                if 'bestMatches' in data and data['bestMatches']:
                    
                    matches = [
                        {'symbol': match['1. symbol'], 'name': match['2. name']}
                        for match in data['bestMatches']
                    ]
                    return jsonify(matches), 200
                return jsonify({'error': 'No matching company found'}), 404
            return jsonify({'error': 'Alpha Vantage API request failed'}), 500
        except requests.exceptions.RequestException as e:
            return jsonify({'error': f'Error fetching data: {str(e)}'}), 500
    return jsonify({'error': 'Company name is required'}), 400


@app.route('/api/search', methods=['GET'])
def search_catalog():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400

    url = 'https://datacatalogapi.worldbank.org/ddhxext/Search'
    params = {
        'qname': 'dataset',
        'qterm': query,
        '$top': 10
    }

    try:
        
        response = requests.get(url, params=params)

        
        print("Response Status Code:", response.status_code)
        print("Raw Response Text:", response.text)

        response.raise_for_status()
        external_data = response.json()

        
        print("External API Response (JSON):", external_data)

        
        items = external_data.get("Response", {}).get("value", [])
        if not isinstance(items, list) or not items:
            print("No valid items found in 'value' key.")
            return jsonify({'data': []})

        
        processed_data = []
        for item in items:
            title = item.get("name", "No Title")
            description = item.get("identification", {}).get("description", "No Description")
            link = item.get("app_legacy_url", "#")
            keywords = item.get("keywords_list", [])

            
            processed_data.append({
                "title": title,
                "description": description,
                "link": link,
                "keywords": keywords
            })

        
        print("Processed Data:", processed_data)

        
        return jsonify({'data': processed_data})

    except requests.exceptions.RequestException as e:
        print("Error fetching data:", e)
        return jsonify({'error': 'Failed to fetch data from external API'}), 500
    except Exception as e:
        print("Unexpected error:", e)
        return jsonify({'error': 'An unexpected error occurred'}), 500

def create_app():
    return app

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        users = User.query.all()
        return jsonify([{"id": user.id, "name": user.name} for user in users])

    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        password = data.get('password')

        existing_user = User.query.filter_by(name=name).first()
        if existing_user:
            return jsonify({"message": "User already exists"}), 400

        new_user = User(name=name, password=password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"id": new_user.id, "name": new_user.name}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    user = User.query.filter_by(name=name).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful!", 'user_id': user.id, 'name': user.name}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully!"}), 200

@app.route('/companies', methods=['GET', 'POST'])
def companies():
    if request.method == 'GET':
        companies = Company.query.all()
        return jsonify([
            {
                "id": company.id,
                "name": company.name,
                "category": company.category.name if company.category else None,
                "link": company.link,
                "indeed": company.indeed
            } for company in companies
        ])

    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        link = data.get('link')
        indeed = data.get('indeed')
        category_name = data.get('category_name')

        category = Category.query.filter_by(name=category_name).first()
        if not category:
            return jsonify({"error": "Category not found"}), 400

        new_company = Company(name=name, link=link, indeed=indeed, category=category)
        db.session.add(new_company)
        db.session.commit()
        return jsonify({"message": f"Company '{name}' added successfully."}), 201

@app.route('/favorites', methods=['GET', 'POST', 'DELETE'])
def manage_favorites():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    if request.method == 'GET':
        favorites = Favorites.query.filter_by(user_id=user_id).all()
        return jsonify([{
            "company_id": fav.company_id,
            "company_name": fav.company.name,
            "link": fav.company.link,
            "indeed": fav.company.indeed,
            "category": fav.company.category.name if fav.company.category else None
        } for fav in favorites]), 200

    data = request.get_json()
    company_id = data.get('company_id')
    if not company_id:
        return jsonify({"message": "Company ID is required"}), 400

    company = Company.query.get(company_id)
    if not company:
        return jsonify({"message": "Company not found"}), 404

    if request.method == 'POST':
        if Favorites.query.filter_by(user_id=user_id, company_id=company_id).first():
            return jsonify({"message": "Company already in favorites"}), 200
        new_favorite = Favorites(user_id=user_id, company_id=company_id)
        db.session.add(new_favorite)
        db.session.commit()
        return jsonify({"message": f"Company '{company.name}' added to favorites."}), 201

    if request.method == 'DELETE':
        favorite = Favorites.query.filter_by(user_id=user_id, company_id=company_id).first()
        if not favorite:
            return jsonify({"message": "Favorite not found"}), 404
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"message": f"Company '{company.name}' removed from favorites."}), 200

@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{"name": category.name} for category in categories])

@app.route('/categories/<category_name>', methods=['GET'])
def view_companies_in_category_and_news(category_name):
    category = Category.query.filter_by(name=category_name).first()
    if not category:
        return jsonify({"message": "Category not found."}), 404

    companies = Company.query.filter_by(category_id=category.id).all()
    companies_info = []
    for company in companies:
        news_articles = fetch_news_for_company(company.name)
        companies_info.append({
            "company_name": company.name,
            "category": category.name,
            "news_articles": [{"title": article['title'], "url": article['url']} for article in news_articles]
        })

    return jsonify(companies_info)

@app.route('/news/<int:company_id>', methods=['GET'])
def get_news_for_company(company_id):

    company = Company.query.get(company_id)
    if not company:
        return jsonify({"message": "Company not found"}), 404


    news_articles = fetch_news_for_company(company.name)


    return jsonify({
        "company_name": company.name,
        "articles": news_articles
    })

@app.route('/profile', methods=['GET'])
def get_profile():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    favorites = Favorites.query.filter_by(user_id=user_id).all()
    profile_data = {
        "name": user.name,
        "favorites": [{
            "id": favorite.company.id, 
            "company_name": favorite.company.name,
            "link": favorite.company.link,
            "indeed": favorite.company.indeed,
            "category": favorite.company.category.name if favorite.company.category else None
        } for favorite in favorites]
    }

    return jsonify(profile_data)

@app.route('/companies/<company_id>', methods=['PATCH'])
def update_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"message": "Company not found"}), 404

    data = request.get_json()
    link = data.get('link')
    indeed = data.get('indeed')

    if link:
        company.link = link
    if indeed:
        company.indeed = indeed

    db.session.commit()
    return jsonify({"message": f"Company {company.name} updated successfully."}), 200

@app.route('/companies/<company_id>', methods=['DELETE'])
def delete_company(company_id):
    company = Company.query.get(company_id)
    if company:
        db.session.delete(company)
        db.session.commit()
        return jsonify({"message": f"Company {company.name} deleted."}), 200
    return jsonify({"message": "Company not found."}), 404

@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully."}), 200
    return jsonify({"message": "User not found."}), 404

if __name__ == '__main__':
    app.run(port=5555, debug=True)
