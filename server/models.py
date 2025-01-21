from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from config import db
import bcrypt

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, unique=True, nullable=False)
    
    companies = relationship('Company', back_populates='category')

    def __repr__(self):
        return f"<Category(id={self.id}, name={self.name})>"

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    link = db.Column(db.String)
    indeed = db.Column(db.String)
    
    category_id = db.Column(db.Integer, ForeignKey('categories.id'))
    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    
    category = relationship('Category', back_populates='companies')
    user = relationship('User', back_populates='companies')
    favorites = relationship('Favorites', back_populates='company')

    def __repr__(self):
        return f"<Company(id={self.id}, name={self.name}, link={self.link}, user_id={self.user_id})>"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    favorites = relationship('Favorites', back_populates='user', cascade="all, delete-orphan")
    companies = relationship('Company', back_populates='user', cascade="all, delete-orphan")

    def __init__(self, name, password):
        self.name = name
        self.password_hash = self.hash_password(password)

    def hash_password(self, password):
        """Hash the password using bcrypt."""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Check if the provided password matches the stored hash."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

class Favorites(db.Model):
    __tablename__ = 'favorites'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, ForeignKey('users.id'))
    company_id = db.Column(db.Integer, ForeignKey('companies.id'))
    
    user = relationship('User', back_populates='favorites')
    company = relationship('Company', back_populates='favorites')

    @staticmethod
    def get_user_favorites(user_id):
        return Company.query.join(Favorites).filter(Favorites.user_id == user_id).all()

    @staticmethod
    def add_favorite(user_id, company_id):
        """Adds a company to the user's favorites."""
        favorite = Favorites(user_id=user_id, company_id=company_id)
        db.session.add(favorite)
        db.session.commit()

    @staticmethod
    def unfavorite(user_id, company_id):
        """Removes a company from the user's favorites."""
        favorite = Favorites.query.filter_by(user_id=user_id, company_id=company_id).first()
        if favorite:
            db.session.delete(favorite)
            db.session.commit()

    def __repr__(self):
        return f"<Favorites(id={self.id}, user_id={self.user_id}, company_id={self.company_id})>"
