from flask import Blueprint, request, jsonify, render_template
from models import db, Socios, LibroRegistro, LibroContable
from datetime import datetime

aportes_bp = Blueprint('/aportes', __name__)

# Renderizar la página de aportes
@aportes_bp.route('/aportes')
def aportes():
    return render_template('aportes.html')

# Listar todos los socios
@aportes_bp.route('/api/socios', methods=['GET'])
def listar_socios():
    socios = Socios.query.all()
    return jsonify([
        {
            'id': socio.id,
            'nombre': socio.nombre,
            'contacto': socio.contacto
        }
        for socio in socios
    ])

# Crear un nuevo socio
@aportes_bp.route('/api/socios', methods=['POST'])
def crear_socio():
    data = request.json
    nuevo_socio = Socios(
        id=data['id'],
        nombre=data['nombre'],
        contacto=data['contacto']
    )
    db.session.add(nuevo_socio)
    db.session.commit()
    return jsonify({'mensaje': 'Socio creado exitosamente'}), 201

# Actualizar un socio
@aportes_bp.route('/api/socios/<int:id>', methods=['PUT'])
def actualizar_socio(id):
    socio = Socios.query.get_or_404(id)
    data = request.json
    socio.nombre = data['nombre']
    socio.identificacion = data['identificacion']
    socio.telefono = data['telefono']
    db.session.commit()
    return jsonify({'mensaje': 'Socio actualizado exitosamente'}), 200

# Eliminar un socio
@aportes_bp.route('/api/socios/<int:id>', methods=['DELETE'])
def eliminar_socio(id):
    socio = Socios.query.get_or_404(id)
    db.session.delete(socio)
    db.session.commit()
    return jsonify({'mensaje': 'Socio eliminado exitosamente'}), 200

# Registrar un aporte
@aportes_bp.route('/api/aportes', methods=['POST'])
def registrar_aporte():
    data = request.json
    efectivo = float(data['efectivo'])
    banco = float(data['banco'])
    aporte_neto = efectivo + banco

    # Registrar en LibroRegistro
    nuevo_registro = LibroRegistro(
        fecha=datetime.now(),
        movimiento='Entrada',
        referencia=data['identificacion'],
        nombre=data['nombre'],
        tipo='Aporte',
        bodega='N/A',
        cantidad='N/A',
        precio_compra='N/A',
        precio_venta='N/A',
        ganancia = aporte_neto,
        observaciones=data['observaciones']
    )
    db.session.add(nuevo_registro)

    # Registrar en LibroContable
    nuevo_aporte = LibroContable(
        fecha=datetime.now(),
        referencia='NA',
        detalle=data['observaciones'],
        codigo_cuenta='311505',
        cuenta='Aportes sociales',
        debe=aporte_neto,
        haber=0
    )
    db.session.add(nuevo_aporte)

    if(banco>0):
        aporte_banco = LibroContable(
        fecha=datetime.now(),
        referencia='NA',
        detalle=data['observaciones'],
        codigo_cuenta='111005',
        cuenta='Bancos nacionales',
        debe=banco,
        haber=0
        ) 
        db.session.add(aporte_banco)
    
    if(efectivo>0):
        aporte_efectivo = LibroContable(
        fecha=datetime.now(),
        referencia='NA',
        detalle=data['observaciones'],
        codigo_cuenta='110505',
        cuenta='Caja',
        debe=efectivo,
        haber=0
        ) 
        db.session.add(aporte_efectivo)


    db.session.commit()
    return jsonify({'mensaje': 'Aporte registrado exitosamente'}), 201
