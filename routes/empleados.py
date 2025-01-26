from flask import Blueprint, jsonify, request
from models import db, Empleado

empleados_bp = Blueprint('/empleados', __name__)

# Listar todos los empleados
@empleados_bp.route('/', methods=['GET'])
def listar_empleados():
    empleados = Empleado.query.all()
    resultado = [{"id": c.id, "nombre": c.nombre, "cargo": c.cargo, "salario": c.salario} for c in empleados]
    return jsonify(resultado)

# Crear un empleados
@empleados_bp.route('/', methods=['POST'])
def crear_empleado():
    data = request.get_json()
    nuevo_empleado = Empleado(nombre=data['nombre'], cargo=data['cargo'], salario=data['salario'])
    db.session.add(nuevo_empleado)
    db.session.commit()
    return jsonify({"mensaje": "Empleado creado con éxito"})

# Actualizar un empleado
@empleados_bp.route('/<int:id>', methods=['PUT'])
def actualizar_cliente(id):
    empleado = Empleado.query.get_or_404(id)
    data = request.get_json()
    empleado.nombre = data.get('nombre', empleado.nombre)
    empleado.cargo = data.get('cargo', empleado.cargo)
    empleado.salario = data.get('salario', empleado.salario)
    db.session.commit()
    return jsonify({"mensaje": "Empleado actualizado con éxito"})

# Eliminar un empleado
@empleados_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_empleado(id):
    empleado = Empleado.query.get_or_404(id)
    db.session.delete(empleado)
    db.session.commit()
    return jsonify({"mensaje": "Empleado eliminado con éxito"})