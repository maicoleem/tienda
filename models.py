from flask_sqlalchemy import SQLAlchemy

# Definición de modelos
db = SQLAlchemy()
class Proveedor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    contacto = db.Column(db.String(100), nullable=True)
    telefono = db.Column(db.String(15), nullable=True)

class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(120), nullable=True)

class Empleado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    cargo = db.Column(db.String(100), nullable=False)

# Modelo de Producto
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referencia = db.Column(db.String(100), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)

#Modelo Bodega
class Bodega(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(6), unique=True, nullable=False)
    nombre = db.Column(db.String(20), nullable=False)
    descripcion = db.Column(db.String(100), nullable=False)

# Modelo de Almacenamiento de productos en bodega
class Almacenamiento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bodega = db.Column(db.String(100), nullable=False)
    referencia = db.Column(db.String(100), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_compra = db.Column(db.Float, nullable=False)
    precio_venta = db.Column(db.Float, nullable=False)

# Modelo de Libro de Registro
class LibroRegistro(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, nullable=False)
    empleado = db.Column(db.String(100), nullable=True)
    proveedor = db.Column(db.String(100), nullable=True)
    cliente = db.Column(db.String(100), nullable=True)
    movimiento = db.Column(db.String(50), nullable=False)  # Entrada o Salida
    referencia = db.Column(db.String(100), nullable=False)
    factura = db.Column(db.String(50), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    bodega = db.Column(db.String(100), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_compra = db.Column(db.Float, nullable=False)
    precio_venta = db.Column(db.Float, nullable=False)
    ganancia = db.Column(db.Float, nullable=False) # 0 para compras
    observaciones = db.Column(db.Text, nullable=True)

#Modelo cuenta contable
class CuentaContable(db.Model):
    __tablename__ = 'cuentas_contables'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # SERIAL en PostgreSQL
    codigo = db.Column(db.String(10), nullable=False, unique=True)   # Código de la cuenta
    nombre = db.Column(db.String(100), nullable=False)               # Nombre de la cuenta
    tipo = db.Column(
        db.Enum('Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto', 'Costo', name='tipo_enum'),
        nullable=False
    )  # Clasificación
    descripcion = db.Column(db.Text)                                 # Descripción adicional

# Modelo de Libro Contable
class LibroContable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, nullable=False)
    factura = db.Column(db.String(100), nullable=True) #Factura
    detalle = db.Column(db.String(100), nullable=True) #Observaciones de la factura
    codigo_cuenta = db.Column(db.String(10), nullable=True)
    cuenta = db.Column(db.String(100), nullable=True)
    debe = db.Column(db.Float, nullable=False)
    haber = db.Column(db.Float, nullable=False)

#Modelo Socios
class Socios(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    contacto = db.Column(db.String(100), nullable=False)

#Modelo Servicios
class Servicios(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referencia = db.Column(db.String(100), unique=True, nullable=False)
    servicio = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)