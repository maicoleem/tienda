from flask import Blueprint, request, jsonify
from models import db, Bodega

bodegas_bp = Blueprint('bodegas', __name__)

# Listar todas las bodegas
@bodegas_bp.route('/api/bodegas', methods=['GET'])
def listar_bodegas():
    bodegas = Bodega.query.all()
    return jsonify([{
        "id": b.id,
        "codigo": b.codigo,
        "nombre": b.nombre,
        "descripcion": b.descripcion
    } for b in bodegas])

# Obtener una bodega por ID
@bodegas_bp.route('/api/bodegas/<int:id>', methods=['GET'])
def obtener_bodega(id):
    bodega = Bodega.query.get(id)
    if not bodega:
        return jsonify({"error": "Bodega no encontrada"}), 404
    return jsonify({
        "id": bodega.id,
        "codigo": bodega.codigo,
        "nombre": bodega.nombre,
        "descripcion": bodega.descripcion
    })

# Crear una nueva bodega
@bodegas_bp.route('/api/bodegas', methods=['POST'])
def crear_bodega():
    data = request.json
    if not data.get('codigo') or not data.get('nombre') or not data.get('descripcion'):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400
    
    nueva_bodega = Bodega(
        codigo=data['codigo'],
        nombre=data['nombre'],
        descripcion=data['descripcion']
    )
    db.session.add(nueva_bodega)
    db.session.commit()
    return jsonify({"mensaje": "Bodega creada exitosamente"}), 201

# Actualizar una bodega
@bodegas_bp.route('/api/bodegas/<int:id>', methods=['PUT'])
def actualizar_bodega(id):
    bodega = Bodega.query.get(id)
    if not bodega:
        return jsonify({"error": "Bodega no encontrada"}), 404
    
    data = request.json
    bodega.codigo = data.get('codigo', bodega.codigo)
    bodega.nombre = data.get('nombre', bodega.nombre)
    bodega.descripcion = data.get('descripcion', bodega.descripcion)
    
    db.session.commit()
    return jsonify({"mensaje": "Bodega actualizada exitosamente"})

# Eliminar una bodega
@bodegas_bp.route('/api/bodegas/<int:id>', methods=['DELETE'])
def eliminar_bodega(id):
    bodega = Bodega.query.get(id)
    if not bodega:
        return jsonify({"error": "Bodega no encontrada"}), 404
    
    db.session.delete(bodega)
    db.session.commit()
    return jsonify({"mensaje": "Bodega eliminada exitosamente"})
