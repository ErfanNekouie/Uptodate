from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Ensure the upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    username = db.Column(db.String(50), unique=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(10))  # 'admin' or 'user'

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    author = db.Column(db.String(50))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship('Category', backref=db.backref('articles', lazy=True))
    description = db.Column(db.Text)
    file = db.Column(db.String(100))
    likes = db.Column(db.Integer, default=0)
    downloads = db.Column(db.Integer, default=0)

class UserActivity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'))
    activity_type = db.Column(db.String(50))  # 'like' or 'download'
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(name=data['name'], username=data['username'], email=data['email'], password=hashed_password, role='user')
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid request'}), 400
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={'username': user.username, 'role': user.role, 'id': user.id})
        return jsonify({'token': access_token, 'role': user.role})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/check_session', methods=['GET'])
@jwt_required()
def check_session():
    current_user = get_jwt_identity()
    return jsonify({'role': current_user['role']})

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('role', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_panel():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    return jsonify({'message': 'Welcome to the admin panel'})

@app.route('/user', methods=['GET'])
@jwt_required()
def user_panel():
    current_user = get_jwt_identity()
    return jsonify({'message': 'Welcome to the user panel'})

@app.route('/users', methods=['GET', 'POST'])
@jwt_required()
def manage_users():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    if request.method == 'GET':
        users = User.query.all()
        return jsonify([{'id': user.id, 'name': user.name, 'username': user.username, 'email': user.email, 'role': user.role} for user in users])
    elif request.method == 'POST':
        data = request.get_json()
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(name=data['name'], username=data['username'], email=data['email'], password=hashed_password, role=data['role'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201

@app.route('/users/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_user(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    user = User.query.get(id)
    if request.method == 'PUT':
        data = request.get_json()
        user.name = data['name']
        user.username = data['username']
        user.email = data['email']
        if 'password' in data:
            user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user.role = data['role']
        db.session.commit()
        return jsonify({'message': 'User updated successfully'})
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'})

@app.route('/categories', methods=['GET', 'POST'])
@jwt_required()
def manage_categories():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    if request.method == 'GET':
        categories = Category.query.all()
        return jsonify([{'id': category.id, 'name': category.name} for category in categories])
    elif request.method == 'POST':
        data = request.get_json()
        new_category = Category(name=data['name'])
        db.session.add(new_category)
        db.session.commit()
        return jsonify({'message': 'Category created successfully'}), 201

@app.route('/categories/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_category(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    category = Category.query.get(id)
    if request.method == 'PUT':
        data = request.get_json()
        category.name = data['name']
        db.session.commit()
        return jsonify({'message': 'Category updated successfully'})
    elif request.method == 'DELETE':
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Category deleted successfully'})

@app.route('/articles', methods=['GET', 'POST'])
@jwt_required()
def manage_articles():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    if request.method == 'GET':
        articles = Article.query.all()
        articles_data = []
        for article in articles:
            category_name = article.category.name if article.category else 'No Category'
            articles_data.append({
                'id': article.id,
                'name': article.name,
                'author': article.author,
                'category': category_name,
                'description': article.description,
                'file': article.file,
                'likes': article.likes,
                'downloads': article.downloads
            })
        return jsonify(articles_data)

    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'message': 'No file part in the request'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        data = request.form.to_dict()
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        category = Category.query.filter_by(name=data['category']).first()
        if not category:
            return jsonify({'message': 'Category not found'}), 404

        new_article = Article(
            name=data['name'],
            author=data['author'],
            category_id=category.id,
            description=data['description'],
            file=filename
        )
        db.session.add(new_article)
        db.session.commit()
        return jsonify({'message': 'Article created successfully'}), 201

@app.route('/articles/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_article(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    article = Article.query.get(id)
    if request.method == 'PUT':
        if not article:
            return jsonify({'message': 'Article not found'}), 404

        data = request.form.to_dict()
        if 'file' in request.files:
            file = request.files['file']
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            article.file = filename

        category = Category.query.filter_by(name=data['category']).first()
        if not category:
            return jsonify({'message': 'Category not found'}), 404

        article.name = data['name']
        article.author = data['author']
        article.category_id = category.id
        article.description = data['description']
        db.session.commit()
        return jsonify({'message': 'Article updated successfully'})
    elif request.method == 'DELETE':
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        db.session.delete(article)
        db.session.commit()
        return jsonify({'message': 'Article deleted successfully'})

@app.route('/all_articles', methods=['GET'])
@jwt_required()
def all_articles():
    articles = Article.query.all()
    return jsonify([{'id': article.id, 'name': article.name, 'author': article.author, 'category': article.category.name, 'description': article.description, 'likes': article.likes, 'downloads': article.downloads} for article in articles])

@app.route('/my_articles', methods=['GET'])
@jwt_required()
def my_articles():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    liked_articles = UserActivity.query.filter_by(user_id=user.id, activity_type='like').all()
    liked_article_ids = [activity.article_id for activity in liked_articles]
    articles = Article.query.filter(Article.id.in_(liked_article_ids)).all()
    return jsonify([{'id': article.id, 'name': article.name, 'author': article.author, 'category': article.category.name, 'description': article.description, 'likes': article.likes, 'downloads': article.downloads} for article in articles])

@app.route('/articles/<int:id>/like', methods=['POST'])
@jwt_required()
def like_article(id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    article = Article.query.get(id)
    
    if not article:
        return jsonify({'message': 'Article not found'}), 404
    if not user:
        return jsonify({'message': 'User not found'}), 404

    activity = UserActivity.query.filter_by(user_id=user.id, article_id=article.id, activity_type='like').first()
    if activity:
        db.session.delete(activity)
        article.likes -= 1
        db.session.commit()
        return jsonify({'message': 'Article unliked successfully', 'likes': article.likes})
    
    new_activity = UserActivity(user_id=user.id, article_id=article.id, activity_type='like')
    article.likes += 1
    db.session.add(new_activity)
    db.session.commit()
    return jsonify({'message': 'Article liked successfully', 'likes': article.likes})

@app.route('/articles/<int:id>/download', methods=['POST'])
@jwt_required()
def download_article(id):
    current_user = get_jwt_identity()
    article = Article.query.get(id)
    if not article:
        return jsonify({'message': 'Article not found'}), 404

    article.downloads += 1
    new_activity = UserActivity(user_id=current_user['id'], article_id=article.id, activity_type='download')
    db.session.add(new_activity)
    db.session.commit()
    return send_from_directory(directory=app.config['UPLOAD_FOLDER'], path=article.file, as_attachment=True)

@app.route('/articles/<int:id>/is_liked', methods=['GET'])
@jwt_required()
def is_liked_article(id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    activity = UserActivity.query.filter_by(user_id=user.id, article_id=id, activity_type='like').first()
    is_liked = activity is not None
    return jsonify({'is_liked': is_liked})

@app.route('/user_activities', methods=['GET'])
@jwt_required()
def user_activities():
    current_user = get_jwt_identity()
    activities = UserActivity.query.filter_by(user_id=current_user['id']).all()
    return jsonify([{
        'id': activity.id,
        'article_id': activity.article_id,
        'activity_type': activity.activity_type,
        'timestamp': activity.timestamp
    } for activity in activities])

class About(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text)

@app.route('/about', methods=['GET', 'POST'])
def about():
    if request.method == 'GET':
        about = About.query.first()
        if not about:
            return jsonify({'message': 'About content not found'}), 404
        return jsonify({'content': about.content})

    if request.method == 'POST':
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        data = request.get_json()
        about = About.query.first()
        if not about:
            about = About(content=data['content'])
            db.session.add(about)
        else:
            about.content = data['content']
        db.session.commit()
        return jsonify({'message': 'About content updated successfully'})
    
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Add seed data here
        if not User.query.filter_by(username='admin').first():
            admin_user = User(name='Admin User', username='admin', email='admin@example.com', password=bcrypt.generate_password_hash('admin123').decode('utf-8'), role='admin')
            db.session.add(admin_user)
            db.session.commit()

        if not User.query.filter_by(username='testuser').first():
            test_user = User(name='Test User', username='testuser', email='testuser@example.com', password=bcrypt.generate_password_hash('test123').decode('utf-8'), role='user')
            db.session.add(test_user)
            db.session.commit()

        if not Category.query.filter_by(name='Technology').first():
            technology_category = Category(name='Technology')
            db.session.add(technology_category)
            db.session.commit()

        if not Category.query.filter_by(name='Science').first():
            science_category = Category(name='Science')
            db.session.add(science_category)
            db.session.commit()

        if not Category.query.filter_by(name='Arts').first():
            arts_category = Category(name='Arts')
            db.session.add(arts_category)
            db.session.commit()

        if not Article.query.filter_by(name='Tech Article 1').first():
            tech_article = Article(name='Tech Article 1', author='admin', category_id=technology_category.id, description='An article about technology.', file='tech_article_1.pdf')
            db.session.add(tech_article)
            db.session.commit()

        if not Article.query.filter_by(name='Science Article 1').first():
            science_article = Article(name='Science Article 1', author='admin', category_id=science_category.id, description='An article about science.', file='science_article_1.pdf')
            db.session.add(science_article)
            db.session.commit()

        if not Article.query.filter_by(name='Arts Article 1').first():
            arts_article = Article(name='Arts Article 1', author='testuser', category_id=arts_category.id, description='An article about arts.', file='arts_article_1.pdf')
            db.session.add(arts_article)
            db.session.commit()

    app.run(debug=True)
