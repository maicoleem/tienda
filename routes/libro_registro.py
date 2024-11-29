from flask import Blueprint, request, jsonify
from models import db, LibroRegistro
from datetime import datetime

libro_registro_bp = Blueprint('libro_registro', __name__)

# Listar todos los registros del libro
@libro_registro_bp.route('/api/libro_registro', methods=['GET'])
def listar_registros():
    registros = LibroRegistro.query.all()
    return jsonify([{
        "id": r.id,
        "fecha": r.fecha.isoformat(),
        "referencia": r.referencia,
        "nombre": r.nombre,
        "movimiento": r.movimiento,
        "cantidad": r.cantidad,
        "valor": r.valor,
        "ganancia": r.ganancia,
        "observaciones": r.observaciones
    } for r in registros])

# Obtener un registro del libro por ID
@libro_registro_bp.route('/api/libro_registro/<int:id>', methods=['GET'])
def obtener_registro(id):
    registro = LibroRegistro.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404
    return jsonify({
        "id": registro.id,
        "fecha": registro.fecha.isoformat(),
        "referencia": registro.referencia,
        "nombre": registro.nombre,
        "movimiento": registro.movimiento,
        "cantidad": registro.cantidad,
        "valor": registro.valor,
        "ganancia": registro.ganancia,
        "observaciones": registro.observaciones
    })

# Crear un nuevo registro en el libro
@libro_registro_bp.route('/api/libro_registro', methods=['POST'])
def crear_registro():
    data = request.json
    if not all(key in data for key in ["fecha", "referencia", "nombre", "movimiento", "cantidad", "valor", "ganancia"]):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    nuevo_registro = LibroRegistro(
        fecha=datetime.fromisoformat(data['fecha']),
        referencia=data['referencia'],
        nombre=data['nombre'],
        movimiento=data['movimiento'],
        cantidad=data['cantidad'],
        valor=data['valor'],
        ganancia=data['ganancia'],
        observaciones=data.get('observaciones', "")
    )
    db.session.add(nuevo_registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro creado exitosamente"}), 201

# Actualizar un registro del libro
@libro_registro_bp.route('/api/libro_registro/<int:id>', methods=['PUT'])
def actualizar_registro(id):
    registro = LibroRegistro.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404

    data = request.json
    registro.fecha = datetime.fromisoformat(data.get('fecha', registro.fecha.isoformat()))
    registro.referencia = data.get('referencia', registro.referencia)
    registro.nombre = data.get('nombre', registro.nombre)
    registro.movimiento = data.get('movimiento', registro.movimiento)
    registro.cantidad = data.get('cantidad', registro.cantidad)
    registro.valor = data.get('valor', registro.valor)
    registro.ganancia = data.get('ganancia', registro.ganancia)
    registro.observaciones = data.get('observaciones', registro.observaciones)

    db.session.commit()
    return jsonify({"mensaje": "Registro actualizado exitosamente"})

# Eliminar un registro del libro
@libro_registro_bp.route('/api/libro_registro/<int:id>', methods=['DELETE'])
def eliminar_registro(id):
    registro = LibroRegistro.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404

    db.session.delete(registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro eliminado exitosamente"})
