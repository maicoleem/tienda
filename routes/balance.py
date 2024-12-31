from flask import Blueprint, jsonify, render_template
from models import db, LibroContable

balance_bp = Blueprint('/balance', __name__)

#Ruta para cargar la pagina de balance
@balance_bp.route('/balance')
def balance():
    return render_template('balance.html')

# Ruta para obtener los datos del balance general con detalle de cuentas
@balance_bp.route('/api/balance', methods=['GET'])
def obtener_balance():
    # Consultar los movimientos agrupados por código de cuenta
    resultados = db.session.query(
        LibroContable.codigo,
        db.func.sum(LibroContable.debito).label('total_debitos'),
        db.func.sum(LibroContable.credito).label('total_creditos'),
        LibroContable.nombre
    ).group_by(LibroContable.codigo, LibroContable.nombre).all()

    # Inicializar totales
    balance = {
        'resumen': {'activos': 0, 'pasivos': 0, 'patrimonio': 0},
        'detalles': []
    }

    # Procesar cada cuenta
    for cuenta in resultados:
        codigo = cuenta.codigo[:1]  # Primer dígito del código para categorizar
        saldo = cuenta.total_debitos - cuenta.total_creditos

        if codigo == '1':  # Activos
            balance['resumen']['activos'] += saldo
        elif codigo == '2':  # Pasivos
            balance['resumen']['pasivos'] += -saldo
        elif codigo == '3':  # Patrimonio
            balance['resumen']['patrimonio'] += -saldo

        # Agregar detalle de la cuenta
        balance['detalles'].append({
            'codigo': cuenta.codigo,
            'nombre': cuenta.nombre,
            'total_debitos': cuenta.total_debitos,
            'total_creditos': cuenta.total_creditos,
            'saldo': saldo
        })

    return jsonify(balance)