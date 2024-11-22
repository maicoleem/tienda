from flask import Flask
from models import db
from routes.proveedores import proveedores_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tienda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

app.register_blueprint(proveedores_bp, url_prefix='/proveedores')

if __name__ == '__main__':
    app.run(debug=True)
