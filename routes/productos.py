from flask import Blueprint, jsonify, request
from models import db, Producto, Bodega

productos_bp = Blueprint('productos', __name__)

# --- Rutas para Productos ---

# Listar todos los productos
@productos_bp.route('/productos', methods=['GET'])
def listar_productos():
    productos = Producto.query.all()
    resultado = [{"id": p.id, "nombre": p.nombre, "precio": p.precio, "stock": p.stock, "bodega_id": p.bodega_id} for p in productos]
    return jsonify(resultado)

# Crear un producto
@productos_bp.route('/productos', methods=['POST'])
def crear_producto():
    data = request.get_json()
    nuevo_producto = Producto(
        nombre=data['nombre'],
        precio=data['precio'],
        stock=data['stock'],
        bodega_id=data['bodega_id']
    )
    db.session.add(nuevo_producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto creado con éxito"})

# Actualizar un producto
@productos_bp.route('/productos/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get_or_404(id)
    data = request.get_json()
    producto.nombre = data.get('nombre', producto.nombre)
    producto.precio = data.get('precio', producto.precio)
    producto.stock = data.get('stock', producto.stock)
    producto.bodega_id = data.get('bodega_id', producto.bodega_id)
    db.session.commit()
    return jsonify({"mensaje": "Producto actualizado con éxito"})

# Eliminar un producto
@productos_bp.route('/productos/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado con éxito"})

# --- Rutas para Bodegas ---

# Listar todas las bodegas
@productos_bp.route('/bodegas', methods=['GET'])
def listar_bodegas():
    bodegas = Bodega.query.all()
    resultado = [{"id": b.id, "nombre": b.nombre, "ubicacion": b.ubicacion} for b in bodegas]
    return jsonify(resultado)

# Crear una bodega
@productos_bp.route('/bodegas', methods=['POST'])
def crear_bodega():
    data = request.get_json()
    nueva_bodega = Bodega(nombre=data['nombre'], ubicacion=data['ubicacion'])
    db.session.add(nueva_bodega)
    db.session.commit()
    return jsonify({"mensaje": "Bodega creada con éxito"})

# Actualizar una bodega
@productos_bp.route('/bodegas/<int:id>', methods=['PUT'])
def actualizar_bodega(id):
    bodega = Bodega.query.get_or_404(id)
    data = request.get_json()
    bodega.nombre = data.get('nombre', bodega.nombre)
    bodega.ubicacion = data.get('ubicacion', bodega.ubicacion)
    db.session.commit()
    return jsonify({"mensaje": "Bodega actualizada con éxito"})

# Eliminar una bodega
@productos_bp.route('/bodegas/<int:id>', methods=['DELETE'])
def eliminar_bodega(id):
    bodega = Bodega.query.get_or_404(id)
    db.session.delete(bodega)
    db.session.commit()
    return jsonify({"mensaje": "Bodega eliminada con éxito"})
