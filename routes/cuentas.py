from flask import Blueprint, request, jsonify, render_template
from models import db, CuentaContable

cuentas_bp = Blueprint('/cuentas', __name__)

@cuentas_bp.route('/cuentas')
def cuentas():
    return render_template('cuentas.html')

# Crear una nueva cuenta contable
@cuentas_bp.route('/', methods=['POST'])
def crear_cuenta():
    data = request.get_json()
    try:
        nueva_cuenta = CuentaContable(
            codigo=data['codigo'],
            nombre=data['nombre'],
            tipo=data['tipo'],
            descripcion=data.get('descripcion', None)
        )
        db.session.add(nueva_cuenta)
        db.session.commit()
        return jsonify({"mensaje": "Cuenta creada exitosamente", "cuenta": nueva_cuenta.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Obtener todas las cuentas contables
@cuentas_bp.route('/', methods=['GET'])
def obtener_cuentas():
    cuentas = CuentaContable.query.all()
    cuentas_json = [
        {
            "id": cuenta.id,
            "codigo": cuenta.codigo,
            "nombre": cuenta.nombre,
            "tipo": cuenta.tipo,
            "descripcion": cuenta.descripcion
        } for cuenta in cuentas
    ]
    return jsonify(cuentas_json), 200

# Obtener una cuenta contable por ID
@cuentas_bp.route('/<int:id>', methods=['GET'])
def obtener_cuenta(id):
    cuenta = CuentaContable.query.get(id)
    if cuenta:
        return jsonify({
            "id": cuenta.id,
            "codigo": cuenta.codigo,
            "nombre": cuenta.nombre,
            "tipo": cuenta.tipo,
            "descripcion": cuenta.descripcion
        }), 200
    else:
        return jsonify({"error": "Cuenta no encontrada"}), 404

# Actualizar una cuenta contable
@cuentas_bp.route('/<int:id>', methods=['PUT'])
def actualizar_cuenta(id):
    data = request.get_json()
    cuenta = CuentaContable.query.get(id)
    if cuenta:
        try:
            cuenta.codigo = data.get('codigo', cuenta.codigo)
            cuenta.nombre = data.get('nombre', cuenta.nombre)
            cuenta.tipo = data.get('tipo', cuenta.tipo)
            cuenta.descripcion = data.get('descripcion', cuenta.descripcion)

            db.session.commit()
            return jsonify({"mensaje": "Cuenta actualizada exitosamente"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400
    else:
        return jsonify({"error": "Cuenta no encontrada"}), 404

# Eliminar una cuenta contable
@cuentas_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_cuenta(id):
    cuenta = CuentaContable.query.get(id)
    if cuenta:
        try:
            db.session.delete(cuenta)
            db.session.commit()
            return jsonify({"mensaje": "Cuenta eliminada exitosamente"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400
    else:
        return jsonify({"error": "Cuenta no encontrada"}), 404
