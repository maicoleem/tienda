from flask import Blueprint, request, jsonify, render_template
from models import db, Socio, LibroRegistro, LibroContable
from datetime import datetime

aportes_bp = Blueprint('aportes', __name__)

# Renderizar la página de aportes
@aportes_bp.route('/aportes')
def aportes():
    return render_template('aportes.html')

# Listar todos los socios
@aportes_bp.route('/api/socios', methods=['GET'])
def listar_socios():
    socios = Socio.query.all()
    return jsonify([
        {
            'id': socio.id,
            'nombre': socio.nombre,
            'identificacion': socio.identificacion,
            'telefono': socio.telefono
        }
        for socio in socios
    ])

# Crear un nuevo socio
@aportes_bp.route('/api/socios', methods=['POST'])
def crear_socio():
    data = request.json
    nuevo_socio = Socio(
        nombre=data['nombre'],
        identificacion=data['identificacion'],
        telefono=data['telefono']
    )
    db.session.add(nuevo_socio)
    db.session.commit()
    return jsonify({'mensaje': 'Socio creado exitosamente'}), 201

# Actualizar un socio
@aportes_bp.route('/api/socios/<int:id>', methods=['PUT'])
def actualizar_socio(id):
    socio = Socio.query.get_or_404(id)
    data = request.json
    socio.nombre = data['nombre']
    socio.identificacion = data['identificacion']
    socio.telefono = data['telefono']
    db.session.commit()
    return jsonify({'mensaje': 'Socio actualizado exitosamente'}), 200

# Eliminar un socio
@aportes_bp.route('/api/socios/<int:id>', methods=['DELETE'])
def eliminar_socio(id):
    socio = Socio.query.get_or_404(id)
    db.session.delete(socio)
    db.session.commit()
    return jsonify({'mensaje': 'Socio eliminado exitosamente'}), 200

# Registrar un aporte
@aportes_bp.route('/api/aportes', methods=['POST'])
def registrar_aporte():
    data = request.json

    # Registrar en LibroRegistro
    nuevo_registro = LibroRegistro(
        fecha=datetime.now(),
        movimiento='Entrada',
        referencia=data['referencia'],
        nombre=data['nombre'],
        tipo='Aporte',
        bodega='N/A',
        cantidad=1,
        precio_compra=0,
        precio_venta=data['valor'],
        ganancia=0,
        observaciones=data['observaciones']
    )
    db.session.add(nuevo_registro)

    # Registrar en LibroContable
    nuevo_movimiento = LibroContable(
        codigo=data['codigo'],
        nombre=data['nombre'],
        debito=data['valor'],
        credito=0
    )
    db.session.add(nuevo_movimiento)

    db.session.commit()
    return jsonify({'mensaje': 'Aporte registrado exitosamente'}), 201
