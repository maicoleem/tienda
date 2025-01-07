from flask import jsonify, request, render_template
from app import app, db
from models import Empleado, LibroContable

@app.route('/empleados')
def obtener_empleados():
    empleados = Empleado.query.all()
    return jsonify([{
        'id': e.id, 'nombre': e.nombre, 'cargo': e.cargo, 'salario': e.salario
    } for e in empleados])

@app.route('/calcular/<int:empleado_id>', methods=['POST'])
def calcular_salario(empleado_id):
    empleado = Empleado.query.get(empleado_id)
    if not empleado:
        return jsonify({'message': 'Empleado no encontrado'}), 404

    data = request.json
    dias_trabajados = int(data.get('dias_trabajados', 0))
    horas_extras = int(data.get('horas_extras', 0))

    salario_base = empleado.salario / 30 * dias_trabajados
    valor_horas_extras = (empleado.salario / 240) * 1.25 * horas_extras
    parafiscales = salario_base * 0.09
    total_pago = salario_base + valor_horas_extras - parafiscales

    libro_contable = {
        'factura': f'Nómina-{empleado.id}',
        'observaciones': f'Pago nómina empleado {empleado.nombre}',
        'banco': float(data.get('monto_banco', 0)),
        'caja': float(data.get('monto_caja', 0)),
        'salarios': total_pago
    }

    registros = registrar_movimientos(libro_contable)

    return jsonify({'message': 'Pago realizado exitosamente', 'registros': registros})
