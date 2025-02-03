from flask_sqlalchemy import SQLAlchemy

# Definición de modelos
db = SQLAlchemy()
class Proveedor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    contacto = db.Column(db.String(100), nullable=True)
    detalle = db.Column(db.String(15), nullable=True)

class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(120), nullable=True)

class Empleado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    cargo = db.Column(db.String(100), nullable=False)
    salario = db.Column(db.String(12), nullable=True)

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
    id = db.Column(db.Integer, primary_key=True) # OMITIR
    bodega = db.Column(db.String(100), nullable=False) # BODEGA GENERICA
    referencia = db.Column(db.String(100), nullable=False) #CODIGO DEL PRODUCTO
    nombre = db.Column(db.String(100), nullable=False) # NOMBRE DEL PRODUCTO
    tipo = db.Column(db.String(50), nullable=False) # ALGUNA CARACTERISTICA PARA FILTRAR
    cantidad = db.Column(db.Integer, nullable=False) # CANTIDAD QUE HAY EN BODEGA
    precio_compra = db.Column(db.Float, nullable=False)# PRECIO DE COMPRA
    precio_venta = db.Column(db.Float, nullable=False) #PRECIO DE VENTA

# Modelo de Libro de Registro
class LibroRegistro(db.Model):
    id = db.Column(db.Integer, primary_key=True) #identificador del registro
    fecha = db.Column(db.DateTime, nullable=False) #fecha del registro
    empleado = db.Column(db.String(100), nullable=True) #nombre del que hace el movimiento
    proveedor = db.Column(db.String(100), nullable=True) #nombre de donde vienen lo que se mueve
    cliente = db.Column(db.String(100), nullable=True) #nombre al que va el movimiento
    movimiento = db.Column(db.String(50), nullable=False)  # tipo de movimiento (entrada o salida {aportes, compras, ventas, inventario, obsoleto})
    referencia = db.Column(db.String(100), nullable=False) #codigo del producto u objeto al que va el movimiento
    factura = db.Column(db.String(50), nullable=False) #factura del movimiento
    nombre = db.Column(db.String(100), nullable=False) # nombre del producto u objeto
    tipo = db.Column(db.String(50), nullable=False) #alguna caracteristica del producto
    bodega = db.Column(db.String(100), nullable=False) #bodega donde se almacena el producto u objeto
    cantidad = db.Column(db.Integer, nullable=False) # cantidad
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
    fecha = db.Column(db.DateTime, nullable=False) #Fecha de la factura
    factura = db.Column(db.String(100), nullable=True) # Factura
    detalle = db.Column(db.String(100), nullable=True) # Observaciones de la factura
    codigo_cuenta = db.Column(db.String(10), nullable=True) # Codigo de la cuenta ejemplo para caja es 110505 segun PUC colombia
    cuenta = db.Column(db.String(100), nullable=True) # nombre de la cuenta
    debe = db.Column(db.Float, nullable=False) # debe de la cuenta (debito)
    haber = db.Column(db.Float, nullable=False) # haber de la cuenta (credito)

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