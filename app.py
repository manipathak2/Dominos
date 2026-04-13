from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import sqlite3

app = Flask(__name__, static_folder='', template_folder='')
app.secret_key = os.environ.get('SECRET_KEY', 'dominos-pizza-secret-key-2024')
CORS(app, supports_credentials=True)

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///pizzadb.sqlite3')
if DATABASE_URL.startswith('sqlite:///'):
    DB_FILE = DATABASE_URL.replace('sqlite:///', '', 1)
else:
    raise RuntimeError('Unsupported DATABASE_URL. Only sqlite:/// is supported in this deployment.')


def get_db_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        )
        """
    )
    conn.commit()

    count = cur.execute('SELECT COUNT(*) FROM menu_items').fetchone()[0]
    if count == 0:
        sample_menu = [
            ("Margherita", 199),
            ("Farmhouse", 299),
            ("Peppy Paneer", 329),
            ("Cheese n Corn", 249),
            ("Veggie Paradise", 279),
            ("Capsicum & Red Paprika", 89),
            ("extravaganza", 219),
            ("Veg Barbeque ", 239),
        ]
        cur.executemany('INSERT INTO menu_items (name, price) VALUES (?, ?)', sample_menu)
        conn.commit()
    conn.close()


init_db()

# Routes to serve HTML pages
@app.route("/")
def index():
    with open(os.path.join(os.path.dirname(__file__), 'index.html')) as f:
        return f.read(), 200, {'Content-Type': 'text/html'}

@app.route("/login")
def login_page():
    with open(os.path.join(os.path.dirname(__file__), 'login.html')) as f:
        return f.read(), 200, {'Content-Type': 'text/html'}

@app.route("/register")
def register_page():
    with open(os.path.join(os.path.dirname(__file__), 'register.html')) as f:
        return f.read(), 200, {'Content-Type': 'text/html'}

@app.route("/menu")
def menu_page():
    with open(os.path.join(os.path.dirname(__file__), 'menu.html')) as f:
        return f.read(), 200, {'Content-Type': 'text/html'}

@app.route("/cart")
def cart_page():
    with open(os.path.join(os.path.dirname(__file__), 'cart.html')) as f:
        return f.read(), 200, {'Content-Type': 'text/html'}

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    conn = get_db_connection()
    cur = conn.cursor()
    existing = cur.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"message": "Username already exists"}), 409

    cur.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    conn.commit()
    conn.close()
    return jsonify({"message": "Registration successful"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    conn = get_db_connection()
    cur = conn.cursor()
    user = cur.execute(
        'SELECT id FROM users WHERE username = ? AND password = ?',
        (username, password)
    ).fetchone()
    conn.close()
    if user:
        session['user_id'] = user['id']
        return jsonify({"message": "Login successful"})
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"})

@app.route("/api/menu", methods=["GET"])
def get_menu():
    conn = get_db_connection()
    items = conn.execute('SELECT id, name, price FROM menu_items').fetchall()
    conn.close()
    return jsonify([{"id": item['id'], "name": item['name'], "price": item['price']} for item in items])

@app.route("/api/cart", methods=["GET", "POST", "DELETE"])
def cart():
    if 'cart' not in session:
        session['cart'] = []

    if request.method == 'GET':
        return jsonify(session['cart'])

    elif request.method == 'POST':
        data = request.get_json()
        cart = session['cart']
        for item in cart:
            if item['item'] == data['item']:
                item['qty'] += data.get('qty', 1)
                session['cart'] = cart
                return jsonify({"message": "Quantity updated"})
        cart.append({"item": data['item'], "price": data['price'], "qty": data.get('qty', 1)})
        session['cart'] = cart
        return jsonify({"message": "Item added to cart"})

    elif request.method == 'DELETE':
        session['cart'] = []
        return jsonify({"message": "Cart cleared"})

@app.route("/api/checkout", methods=["POST"])
def checkout():
    session['cart'] = []
    return jsonify({"message": "Order placed successfully"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
