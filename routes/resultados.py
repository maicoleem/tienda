from flask import Blueprint, jsonify, render_template
from models import db, LibroContable
from sqlalchemy import func

resultados_bp = Blueprint('resultados', __name__)

# Ruta para renderizar la página del estado de resultados
@resultados_bp.route('/resultados')
def resultados():
    return render_template('resultados.html')

# Ruta para obtener los datos del estado de resultados con detalle de cuentas
@resultados_bp.route('/api/resultados', methods=['GET'])
def obtener_estado_resultados():
    """
    Genera el estado de resultados basado en las cuentas contables.
    """
    try:
        # Consulta para agrupar y sumar por cada cuenta
        cuentas = db.session.query(
            LibroContable.codigo_cuenta,
            LibroContable.cuenta,
            func.sum(LibroContable.debe).label('total_debe'),
            func.sum(LibroContable.haber).label('total_haber'),
        ).group_by(LibroContable.codigo_cuenta, LibroContable.cuenta).all()

        # Clasificación de cuentas
        ingresos = []
        costos = []
        gastos = []
        total_ingresos = 0
        total_costos = 0
        total_gastos = 0

        for cuenta in cuentas:
            codigo = cuenta.codigo_cuenta
            saldo_neto = cuenta.total_haber - cuenta.total_debe

            if codigo.startswith('4'):  # Ingresos
                ingresos.append({
                    'codigo_cuenta': codigo,
                    'cuenta': cuenta.cuenta,
                    'total_debe': cuenta.total_debe,
                    'total_haber': cuenta.total_haber,
                    'saldo_neto': saldo_neto
                })
                total_ingresos += saldo_neto
            elif codigo.startswith('5'):  # Costos
                costos.append({
                    'codigo_cuenta': codigo,
                    'cuenta': cuenta.cuenta,
                    'total_debe': cuenta.total_debe,
                    'total_haber': cuenta.total_haber,
                    'saldo_neto': saldo_neto
                })
                total_costos += saldo_neto
            elif codigo.startswith('6'):  # Gastos
                gastos.append({
                    'codigo_cuenta': codigo,
                    'cuenta': cuenta.cuenta,
                    'total_debe': cuenta.total_debe,
                    'total_haber': cuenta.total_haber,
                    'saldo_neto': saldo_neto
                })
                total_gastos += saldo_neto

        # Resultado del ejercicio
        utilidad_operacional = total_ingresos - total_costos
        utilidad_neta = utilidad_operacional - total_gastos

        # Construcción del estado de resultados
        resultado = {
            'ingresos': ingresos,
            'total_ingresos': total_ingresos,
            'costos': costos,
            'total_costos': total_costos,
            'gastos': gastos,
            'total_gastos': total_gastos,
            'utilidad_operacional': utilidad_operacional,
            'utilidad_neta': utilidad_neta
        }

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500