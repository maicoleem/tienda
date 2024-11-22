from flask import Flask
from models import db
from routes.proveedores import proveedores_bp
from routes.clientes import clientes_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tienda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
with app.app_context(): 
    db.create_all()

app.register_blueprint(proveedores_bp, url_prefix='/proveedores')
app.register_blueprint(clientes_bp, url_prefix='/clientes')

if __name__ == '__main__':
    app.run(debug=True)

