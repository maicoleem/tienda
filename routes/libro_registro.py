from flask import Blueprint, request, jsonify
from models import db, LibroRegistro
from datetime import datetime

libro_registro_bp = Blueprint('/libro_registro', __name__)

# Listar todos los registros
@libro_registro_bp.route('/', methods=['GET'])
def listar_libro_registro():
    registros = LibroRegistro.query.all()
    registros_json = [
        {
            "id": registro.id,
            "fecha": registro.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            "empleado": registro.empleado,
            "proveedor": registro.proveedor,
            "cliente": registro.cliente,
            "movimiento": registro.movimiento,
            "referencia": registro.referencia,
            "nombre": registro.nombre,
            "tipo": registro.tipo,
            "bodega": registro.bodega,
            "cantidad": registro.cantidad,
            "precio_compra": registro.precio_compra,
            "precio_venta": registro.precio_venta,
            "ganancia": registro.ganancia,
            "observaciones": registro.observaciones
        }
        for registro in registros
    ]
    return jsonify(registros_json)

# Obtener un registro por ID
@libro_registro_bp.route('/<int:id>', methods=['GET'])
def obtener_libro_registro(id):
    registro = LibroRegistro.query.get_or_404(id)
    return jsonify({
        "id": registro.id,
        "fecha": registro.fecha.strftime('%Y-%m-%d %H:%M:%S'),
        "empleado": registro.empleado,
        "proveedor": registro.proveedor,
        "cliente": registro.cliente,
        "movimiento": registro.movimiento,
        "referencia": registro.referencia,
        "nombre": registro.nombre,
        "tipo": registro.tipo,
        "bodega": registro.bodega,
        "cantidad": registro.cantidad,
        "precio_compra": registro.precio_compra,
        "precio_venta": registro.precio_venta,
        "ganancia": registro.ganancia,
        "observaciones": registro.observaciones
    })

# Crear un nuevo registro
@libro_registro_bp.route('/', methods=['POST'])
def crear_libro_registro():
    data = request.json
    nuevo_registro = LibroRegistro(
        fecha=datetime.strptime(data['fecha'], '%Y-%m-%d %H:%M:%S'),
        empleado=data.get('empleado', ''),
        proveedor=data.get('proveedor', ''),
        cliente=data.get('cliente', ''),
        movimiento=data['movimiento'],
        referencia=data['referencia'],
        nombre=data['nombre'],
        tipo=data['tipo'],
        bodega=data['bodega'],
        cantidad=int(data['cantidad']),
        precio_compra=float(data['precio_compra']),
        precio_venta=float(data['precio_venta']),
        ganancia=float(data['ganancia']),
        observaciones=data.get('observaciones', '')
    )
    db.session.add(nuevo_registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro creado exitosamente"}), 201

# Actualizar un registro existente
@libro_registro_bp.route('/<int:id>', methods=['PUT'])
def actualizar_libro_registro(id):
    registro = LibroRegistro.query.get_or_404(id)
    data = request.json
    registro.fecha = datetime.strptime(data['fecha'], '%Y-%m-%d %H:%M:%S')
    registro.empleado = data.get('empleado', registro.empleado)
    registro.proveedor = data.get('proveedor', registro.proveedor)
    registro.cliente = data.get('cliente', registro.cliente)
    registro.movimiento = data['movimiento']
    registro.referencia = data['referencia']
    registro.nombre = data['nombre']
    registro.tipo = data['tipo']
    registro.bodega = data['bodega']
    registro.cantidad = int(data['cantidad'])
    registro.precio_compra = float(data['precio_compra'])
    registro.precio_venta = float(data['precio_venta'])
    registro.ganancia = float(data['ganancia'])
    registro.observaciones = data.get('observaciones', registro.observaciones)
    db.session.commit()
    return jsonify({"mensaje": "Registro actualizado exitosamente"}), 200

# Eliminar un registro
@libro_registro_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_libro_registro(id):
    registro = LibroRegistro.query.get_or_404(id)
    db.session.delete(registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro eliminado exitosamente"}), 200
