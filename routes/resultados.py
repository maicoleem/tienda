from flask import Blueprint, jsonify, render_template
from models import db, LibroContable

resultados_bp = Blueprint('resultados', __name__)

# Ruta para renderizar la página del estado de resultados
@resultados_bp.route('/resultados')
def resultados():
    return render_template('resultados.html')

# Ruta para obtener los datos del estado de resultados con detalle de cuentas
@resultados_bp.route('/api/resultados', methods=['GET'])
def obtener_resultados():
    # Consultar los movimientos agrupados por código de cuenta
    resultados = db.session.query(
        LibroContable.codigo,
        db.func.sum(LibroContable.debito).label('total_debitos'),
        db.func.sum(LibroContable.credito).label('total_creditos'),
        LibroContable.nombre
    ).group_by(LibroContable.codigo, LibroContable.nombre).all()

    # Inicializar totales
    estado_resultados = {
        'resumen': {'ingresos': 0, 'costos': 0, 'gastos': 0},
        'detalles': []
    }

    # Procesar cada cuenta
    for cuenta in resultados:
        codigo = cuenta.codigo[:1]  # Primer dígito del código para categorizar
        saldo = cuenta.total_creditos - cuenta.total_debitos

        if codigo == '4':  # Ingresos
            estado_resultados['resumen']['ingresos'] += saldo
        elif codigo == '5':  # Costos
            estado_resultados['resumen']['costos'] += -saldo
        elif codigo == '6':  # Gastos
            estado_resultados['resumen']['gastos'] += -saldo

        # Agregar detalle de la cuenta
        estado_resultados['detalles'].append({
            'codigo': cuenta.codigo,
            'nombre': cuenta.nombre,
            'total_debitos': cuenta.total_debitos,
            'total_creditos': cuenta.total_creditos,
            'saldo': saldo
        })

    return jsonify(estado_resultados)
