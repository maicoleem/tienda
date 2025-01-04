from flask import Flask
from flask import Flask, render_template
from models import db, CuentaContable
from routes.proveedores import proveedores_bp
from routes.clientes import clientes_bp
from routes.empleados import empleados_bp
from routes.productos import productos_bp
from routes.bodegas import bodegas_bp
from routes.almacenamiento import almacenamiento_bp
from routes.libro_registro import libro_registro_bp
from routes.compras import compras_bp
from routes.ventas import ventas_bp
from routes.cuentas import cuentas_bp
from routes.balance import balance_bp
from routes.resultados import resultados_bp
from routes.aportes import aportes_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tienda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

def crear_cuentas_iniciales():
    cuentas = [
        {
            "codigo": "110505",
            "nombre": "Caja",
            "tipo": "Activo",
            "descripcion": "Dinero en efectivo"
        },
        {
            "codigo": "311505",
            "nombre": "Aporte sociales",
            "tipo": "Patrimonio",
            "descripcion": "Dinero aportado por socios"
        },
        {
            "codigo": "111005",
            "nombre": "Banco",
            "tipo": "Activo",
            "descripcion": "Banco nacionales"
        },
        {
            "codigo": "143505",
            "nombre": "Mercancias no fabricadas por la empresa",
            "tipo": "Activo",
            "descripcion": "Mercancia aportadas por los socios"
        },
        {
            "codigo": "240805",
            "nombre": "IVA descontable",
            "tipo": "Pasivo",
            "descripcion": "IVA en compras"
        },
        {
            "codigo": "220505",
            "nombre": "Proveedores nacionales",
            "tipo": "Pasivo",
            "descripcion": "Mercancia comprada"
        },
        {
            "codigo": "413505",
            "nombre": "Comercio de mercancias",
            "tipo": "Ingreso",
            "descripcion": "Venta de mercancia"
        },
        {
            "codigo": "240805",
            "nombre": "IVA por pagar",
            "tipo": "Pasivo",
            "descripcion": "IVA en ventas"
        },
        {
            "codigo": "613505",
            "nombre": "Costo de mercancia vendida",
            "tipo": "Costo",
            "descripcion": "Costo de la mercancia"
        },
        {
            "codigo": "513535",
            "nombre": "Servicios publicos",
            "tipo": "Gasto",
            "descripcion": "Pago de servicios publicos"
        },
        {
            "codigo": "513540",
            "nombre": "Arrendamientos",
            "tipo": "Gasto",
            "descripcion": "Pago de arrendamiento"
        },
        {
            "codigo": "236505",
            "nombre": "Retencion en la fuente",
            "tipo": "Pasivo",
            "descripcion": "Retencion en la fuente arriendo y otros"
        },
        {
            "codigo": "511505",
            "nombre": "Sueldos y salarios",
            "tipo": "Gasto",
            "descripcion": "Pago de salarios"
        },
        {
            "codigo": "237005",
            "nombre": "Aportes sociales y parafiscales",
            "tipo": "Pasivo",
            "descripcion": "Pago de aportes sociales"
        },
        # Agrega más cuentas iniciales si lo deseas
    ]

    for cuenta in cuentas:
        # Verifica si la cuenta ya existe para evitar duplicados
        if not db.session.query(CuentaContable).filter_by(codigo=cuenta["codigo"]).first():
            nueva_cuenta = CuentaContable(**cuenta)
            db.session.add(nueva_cuenta)

    db.session.commit()


db.init_app(app)
with app.app_context(): 
    db.create_all()
    crear_cuentas_iniciales()

app.register_blueprint(proveedores_bp, url_prefix='/api/proveedores')
app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
app.register_blueprint(empleados_bp, url_prefix='/api/empleados')
app.register_blueprint(productos_bp, url_prefix='/api/productos')
app.register_blueprint(bodegas_bp, url_prefix='/api/bodegas')
app.register_blueprint(almacenamiento_bp, url_prefix='/api/almacenamiento')
app.register_blueprint(libro_registro_bp, url_prefix='/api/libro_registro')
app.register_blueprint(compras_bp)
app.register_blueprint(ventas_bp)
app.register_blueprint(aportes_bp)
app.register_blueprint(balance_bp)
app.register_blueprint(resultados_bp)
app.register_blueprint(cuentas_bp, url_prefix='/api/cuentas')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compras')
def compras():
    return render_template('compras.html')

@app.route('/ventas')
def ventas():
    return render_template('ventas.html')

@app.route('/clientes')
@app.route('/clientes/')
def clientes():
    return render_template('clientes.html')

@app.route('/proveedores')
@app.route('/proveedores/')
def proveedores():
    return render_template('proveedores.html')

@app.route('/empleados')
@app.route('/empleados/')
def empleados():
    return render_template('empleados.html')

@app.route('/bodegas')
@app.route('/bodegas/')
def bodegas():
    return render_template('bodegas.html')

@app.route('/productos')
@app.route('/productos/')
def productos():
    return render_template('productos.html')

@app.route('/almacen')
@app.route('/almacen/')
def almacen():
    return render_template('almacen.html')

@app.route('/cuentas')
@app.route('/cuentas/')
def cuentas():
    return render_template('cuentas.html')

@app.route('/aportes')
@app.route('/aportes/')
def aportes():
    return render_template('aportes.html')

#print(app.url_map)

if __name__ == '__main__':
    app.run(debug=True)




