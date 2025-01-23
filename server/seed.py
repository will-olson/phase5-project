import json
from app import db, create_app
from models import Company, Category, Favorites, User

with open("companies.json", "r") as file:
    companies_data = json.load(file)

app = create_app()
with app.app_context():
    
    Company.query.delete()
    Category.query.delete()
    Favorites.query.delete()
    User.query.delete()
    db.session.commit()

    
    categories_data = set(company["category"] for company in companies_data)
    for category_name in categories_data:
        existing_category = Category.query.filter_by(name=category_name).first()
        if not existing_category:
            new_category = Category(name=category_name)
            db.session.add(new_category)

    db.session.commit()

        
    users = [
        User(name="Ethan", password="password-123$"),
        User(name="Recruiter", password="password-123$"),
        User(name="Sara", password="password-123$"),
        User(name="William", password="password-123$"),
    ]

    for user in users:
        db.session.add(user)
    
    db.session.commit()

    
    for company in companies_data:
        category_name = company["category"]
        category = Category.query.filter_by(name=category_name).first()

        if not category:
            print(f"Category '{category_name}' not found. Skipping company '{company['name']}'.")
            continue

        
        import random
        user = random.choice(User.query.all())


        new_company = Company(
            name=company["name"],
            link=company.get("link", None),
            indeed=company.get("indeed", None),
            category_id=category.id,
            user_id=user.id
        )
        db.session.add(new_company)

    db.session.commit()

    
    for user in users:
        companies = Company.query.limit(3).all()
        for company in companies:
            favorite = Favorites(user_id=user.id, company_id=company.id)
            db.session.add(favorite)

    db.session.commit()

    print("Database seeded successfully!")
