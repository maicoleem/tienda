from flask import Blueprint, request, jsonify
from models import db, Producto

productos_bp = Blueprint('/productos', __name__)

# Listar todos los productos
@productos_bp.route('/', methods=['GET'])
def listar_productos():
    productos = Producto.query.all()
    return jsonify([{
        "id": p.id,
        "referencia": p.referencia,
        "nombre": p.nombre,
        "tipo": p.tipo
    } for p in productos])

# Obtener un producto por ID
@productos_bp.route('/<int:id>', methods=['GET'])
def obtener_producto(id):
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({
        "id": producto.id,
        "referencia": producto.referencia,
        "nombre": producto.nombre,
        "tipo": producto.tipo
    })

# Crear un nuevo producto
@productos_bp.route('/', methods=['POST'])
def crear_producto():
    data = request.json
    if not data.get('referencia') or not data.get('nombre') or not data.get('tipo'):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400
    
    nuevo_producto = Producto(
        referencia=data['referencia'],
        nombre=data['nombre'],
        tipo=data['tipo']
    )
    db.session.add(nuevo_producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto creado exitosamente"}), 201

# Actualizar un producto
@productos_bp.route('/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    data = request.json
    producto.referencia = data.get('referencia', producto.referencia)
    producto.nombre = data.get('nombre', producto.nombre)
    producto.tipo = data.get('tipo', producto.tipo)
    
    db.session.commit()
    return jsonify({"mensaje": "Producto actualizado exitosamente"})

# Eliminar un producto
@productos_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    db.session.delete(producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado exitosamente"})
