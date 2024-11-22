from flask import Blueprint, jsonify, request
from models import db, Proveedor

proveedores_bp = Blueprint('proveedores', __name__)

@proveedores_bp.route('/', methods=['GET'])
def listar_proveedores():
    proveedores = Proveedor.query.all()
    resultado = [{"id": p.id, "nombre": p.nombre, "contacto": p.contacto} for p in proveedores]
    return jsonify(resultado)

@proveedores_bp.route('/', methods=['POST'])
def crear_proveedor():
    data = request.get_json()
    nuevo_proveedor = Proveedor(nombre=data['nombre'], contacto=data['contacto'])
    db.session.add(nuevo_proveedor)
    db.session.commit()
    return jsonify({"mensaje": "Proveedor creado con éxito"})

@proveedores_bp.route('/proveedores/<int:id>', methods=['PUT'])
def actualizar_proveedor(id):
    data = request.get_json()
    proveedor = Proveedor.query.get_or_404(id)
    proveedor.nombre = data.get('nombre', proveedor.nombre)
    proveedor.contacto = data.get('contacto', proveedor.contacto)
    db.session.commit()
    return jsonify({"mensaje": "Proveedor actualizado con éxito"})

@proveedores_bp.route('/proveedores/<int:id>', methods=['DELETE'])
def eliminar_proveedor(id):
    proveedor = Proveedor.query.get_or_404(id)
    db.session.delete(proveedor)
    db.session.commit()
    return jsonify({"mensaje": "Proveedor eliminado con éxito"})