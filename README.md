# Career Assistant Application

## Overview

The Career Assistant Application is a web-based tool designed to help users explore career-related data, including company profiles, industry news, and AI-powered career insights. The application allows users to login, add favorite companies, review data, and explore personalized recommendations through the Career Assistant. The frontend is built with React, and the backend is powered by Flask.

## Key Features

- **User Authentication**: Users can create an account, log in, and log out securely.
- **Favorites Management**: Users can add companies to their favorites. Favorites and recent related news links will shower on user profiles. 
- **Career Assistant**: Users can interact with an AI-powered assistant to receive personalized career insights and analysis.
- **Industry News**: Browse the latest industry news by sector. 
- **Company Management**: Users can edit and delete existing companies and add new companies to the database. 
- **Data**: Users can access recent financial metrics from Alpha Vantage as well as data from The World Bank. 

## Technologies Used

### Backend:
- **Flask**: Lightweight Python web framework for building the API.
- **Flask-SQLAlchemy**: ORM for database management.
- **Flask-Bcrypt**: Secure password hashing.
- **Flask-Session**: Session management for user login.

### Frontend:
- **React**: Frontend framework for building the user interface.
- **Formik and Yup**: For handling form validation and submission.
- **React-Router**: For routing between pages in the app.
- **CSS**: Styling of components via `index.css`.

## Setup

### Requirements

- Python 3.7+
- Node.js (for the frontend)

### Backend Setup

1. Clone the repository:

    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

2. Install dependencies:

    - For the backend:

    ```bash
    pip install
    ```

    - For the frontend:

    ```bash
    cd client
    npm install
    ```


3. Run the server:

    ```bash
    python app.py
    ```

    The backend will run on `http://localhost:5555`.

### Frontend Setup

The React frontend is located in the `client` directory. The frontend will be available at http://localhost:3000.

To start the frontend:

```bash
cd client
npm start
```
### Features

#### User Authentication
- Users can register, log in, and log out.
- Passwords are securely hashed using bcrypt.
- Session management is handled through Flask sessions.
- The login status is reflected in the frontend, with logged-in users seeing a personalized greeting.

#### Favorites System
- Users can mark companies as favorites and view them on their profile page.
- Favorite companies are fetched from the backend upon login.

#### Career Assistant
- The Career Assistant uses the OpenAI API to provide personalized career insights.
- Users can ask questions regarding specific companies or general career guidance.
- Users can ask for more detailed analysis applied across their favorite companies.
- Users can customize their personalization inputs to impact the response tone, level of detail, formatting, and any focus areas.
- Users can select from companies in the database and topics, regions, and reports from The World Bank to further guide response outputs.

#### Industry News
- Displays the latest news related to industries and companies.

#### Company Management
- Users can add new companies to the database, which are then displayed on the company pages.

#### Data Page
The Data page provides users with more data to consider in their career planning and analyses including:

- **Symbol Search**: Users can search for company trading symbols via an Alpha Vantage API. 
- **Topic Search**: Users can review key global topics from The World Bank.
- **Region Search**: Users can search among key geographies provided by The World Bank to learn about capital cities and income levels.
- **Report Search**: Users can query reports from The World Bank's Data Catalog to source more detailed, targeted data.

#### Routing and Pages
The application uses React Router to navigate between pages:

- **Home (`/`)**: Allows users to log in or view a list of users and create a new one.
- **Profile (`/profile`)**: Displays the logged-in user's profile, favorites, and recent news articles for favorite companies. Users can add new companies on this page.
- **Companies (`/companies`)**: Displays the companies available in the app, allows users to filter by search.
- **Data (`/data`)**: Displays externally sourced data from Alpha Vantage and The World Bank to help further guide users in their career planning.
- **Industry News (`/industry-news`)**: Displays the latest news for each company in the database, organize by category.
- **Career Assistant (`/career-assistant`)**: Provides users an AI-powered career assistant, with custom input features to support more personalized, precise response outputs.

#### App Component Workflow
- The app loads and fetches user and company data from the backend on initial load using `useEffect`.
- Users can log in by entering their username and password. Upon successful login, they are redirected to their personalized page and can interact with the app.
- Users can view their profile, review data and recent news, update their list of favorite companies, and use the Career Assistant for career insights.
- The state of the app (e.g., logged-in user, favorites, and companies) is maintained in React's `useState`.

#### Future Enhancements
- Upgrade Alpha Vantage API for optimized symbol and overview fetch supported features. Free API key request limit inhibits extensive feature testing. 
- Pending validation of Alpha Vantage API features using an upraded API key, to integrate financial metrics by company into Career Assistant model to inform more in-depth, data-driven analyses.
