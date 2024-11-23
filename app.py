from flask import Flask
from flask import Flask, render_template
from models import db
from routes.proveedores import proveedores_bp
from routes.clientes import clientes_bp
from routes.empleados import empleados_bp
from routes.productos import productos_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tienda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
with app.app_context(): 
    db.create_all()

app.register_blueprint(proveedores_bp, url_prefix='/proveedores')
app.register_blueprint(clientes_bp, url_prefix='/clientes')
app.register_blueprint(empleados_bp, url_prefix='/empleados')
app.register_blueprint(productos_bp, url_prefix='/api')

@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)

