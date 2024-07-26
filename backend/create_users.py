from app import db, User, Category, Article, UserActivity , app
from werkzeug.security import generate_password_hash
with app.app_context():
    # Drop all tables and create them again
    db.drop_all()
    db.create_all()

    # Create some test users
    users = [
        User(name='Admin User', username='admin', email='admin@example.com', password=generate_password_hash('admin123'), role='admin'),
        User(name='Test User', username='testuser', email='testuser@example.com', password=generate_password_hash('test123'), role='user')
    ]

    # Add users to the session and commit them to the database
    db.session.add_all(users)
    db.session.commit()

    # Create some test categories
    categories = [
        Category(name='Technology'),
        Category(name='Science'),
        Category(name='Arts'),
    ]

    # Add categories to the session and commit them to the database
    db.session.add_all(categories)
    db.session.commit()

    # Create some test articles
    articles = [
        Article(name='Tech Article 1', author='Admin User', category_id=1, description='An article about technology.', file='tech_article_1.pdf'),
        Article(name='Science Article 1', author='Admin User', category_id=2, description='An article about science.', file='science_article_1.pdf'),
        Article(name='Arts Article 1', author='Test User', category_id=3, description='An article about arts.', file='arts_article_1.pdf'),
    ]

    # Add articles to the session and commit them to the database
    db.session.add_all(articles)
    db.session.commit()

    print("Database seeded successfully!")
