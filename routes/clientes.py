from flask import Blueprint, jsonify, request
from models import db, Cliente

clientes_bp = Blueprint('clientes', __name__)

# Listar todos los clientes
@clientes_bp.route('/', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    resultado = [{"id": c.id, "nombre": c.nombre, "correo": c.correo, "telefono": c.telefono} for c in clientes]
    return jsonify(resultado)

# Crear un cliente
@clientes_bp.route('/', methods=['POST'])
def crear_cliente():
    data = request.get_json()
    nuevo_cliente = Cliente(nombre=data['nombre'], correo=data['correo'], telefono=data['telefono'])
    db.session.add(nuevo_cliente)
    db.session.commit()
    return jsonify({"mensaje": "Cliente creado con éxito"})

# Actualizar un cliente
@clientes_bp.route('/<int:id>', methods=['PUT'])
def actualizar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    data = request.get_json()
    cliente.nombre = data.get('nombre', cliente.nombre)
    cliente.correo = data.get('correo', cliente.correo)
    cliente.telefono = data.get('telefono', cliente.telefono)
    db.session.commit()
    return jsonify({"mensaje": "Cliente actualizado con éxito"})

# Eliminar un cliente
@clientes_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    db.session.delete(cliente)
    db.session.commit()
    return jsonify({"mensaje": "Cliente eliminado con éxito"})
