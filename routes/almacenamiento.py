from flask import Blueprint, request, jsonify
from models import db, Almacenamiento

almacenamiento_bp = Blueprint('/almacenamiento', __name__)

# Listar todos los registros de almacenamiento
@almacenamiento_bp.route('/', methods=['GET'])
def listar_almacenamiento():
    registros = Almacenamiento.query.all()
    return jsonify([{
        "id": r.id,
        "bodega": r.bodega,
        "referencia": r.referencia,
        "nombre": r.nombre,
        "tipo": r.tipo,
        "cantidad": r.cantidad,
        "precio_compra": r.precio_compra,
        "precio_venta": r.precio_venta
    } for r in registros])

# Obtener un registro de almacenamiento por ID
@almacenamiento_bp.route('/<int:id>', methods=['GET'])
def obtener_registro(id):
    registro = Almacenamiento.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404
    return jsonify({
        "id": registro.id,
        "bodega": registro.bodega,
        "referencia": registro.referencia,
        "nombre": registro.nombre,
        "tipo": registro.tipo,
        "cantidad": registro.cantidad,
        "precio_compra": registro.precio_compra,
        "precio_venta": registro.precio_venta
    })

# Crear un nuevo registro de almacenamiento
@almacenamiento_bp.route('/', methods=['POST'])
def crear_registro():
    data = request.json
    if not all(key in data for key in ["bodega", "referencia", "nombre", "tipo", "cantidad", "precio_compra", "precio_venta"]):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    nuevo_registro = Almacenamiento(
        bodega=data['bodega'],
        referencia=data['referencia'],
        nombre=data['nombre'],
        tipo=data['tipo'],
        cantidad=data['cantidad'],
        precio_compra=data['precio_compra'],
        precio_venta=data['precio_venta']
    )
    db.session.add(nuevo_registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro creado exitosamente"}), 201

# Actualizar un registro de almacenamiento
@almacenamiento_bp.route('/<int:id>', methods=['PUT'])
def actualizar_registro(id):
    registro = Almacenamiento.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404

    data = request.json
    registro.bodega = data.get('bodega', registro.bodega)
    registro.referencia = data.get('referencia', registro.referencia)
    registro.nombre = data.get('nombre', registro.nombre)
    registro.tipo = data.get('tipo', registro.tipo)
    registro.cantidad = data.get('cantidad', registro.cantidad)
    registro.precio_compra = data.get('precio_compra', registro.precio_compra)
    registro.precio_venta = data.get('precio_venta', registro.precio_venta)

    db.session.commit()
    return jsonify({"mensaje": "Registro actualizado exitosamente"})

# Eliminar un registro de almacenamiento
@almacenamiento_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_registro(id):
    registro = Almacenamiento.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404

    db.session.delete(registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro eliminado exitosamente"})
