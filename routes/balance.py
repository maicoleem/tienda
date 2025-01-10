from flask import Blueprint, jsonify, render_template
from models import db, LibroContable
from sqlalchemy import func

balance_bp = Blueprint('/balance', __name__)

#Ruta para cargar la pagina de balance
@balance_bp.route('/balance')
def balance():
    return render_template('balance.html')

# Ruta para obtener los datos del balance general con detalle de cuentas
@balance_bp.route('/api/balance', methods=['GET'])
def obtener_balance_general():
    try:
        # Consultar los totales de 'debe' y 'haber' agrupados por cuenta
        resultados = db.session.query(
            LibroContable.codigo_cuenta,
            LibroContable.cuenta,
            func.sum(LibroContable.debe).label('total_debe'),
            func.sum(LibroContable.haber).label('total_haber')
        ).group_by(LibroContable.codigo_cuenta, LibroContable.cuenta).all()

        # Crear una lista para almacenar el balance por cuenta
        balance_por_cuenta = []
        total_activo = 0
        total_pasivo = 0
        total_patrimonio = 0

        for resultado in resultados:
            codigo_cuenta, cuenta, total_debe, total_haber = resultado

            
            saldo_neto = total_debe - total_haber

            # Clasificar las cuentas según el código (por ejemplo, activos 1xx, pasivos 2xx, patrimonio 3xx)
            if codigo_cuenta.startswith('1'):  # Activos
                total_activo += saldo_neto
            elif codigo_cuenta.startswith('2'):  # Pasivos
                total_pasivo += saldo_neto
            elif codigo_cuenta.startswith('3'):  # Patrimonio
                total_patrimonio += saldo_neto

            # Agregar la cuenta al balance
            balance_por_cuenta.append({
                'codigo_cuenta': codigo_cuenta,
                'cuenta': cuenta,
                'total_debe': total_debe,
                'total_haber': total_haber,
                'saldo_neto': saldo_neto
            })

        # Verificar que el balance cuadre
        balance_cuadrado = total_activo + total_pasivo == total_patrimonio

        # Respuesta del balance general
        balance_general = {
            'cuentas': balance_por_cuenta,
            'totales': {
                'total_activo': total_activo,
                'total_pasivo': total_pasivo,
                'total_patrimonio': total_patrimonio,
                'balance_cuadrado': balance_cuadrado
            }
        }

        return jsonify(balance_general), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500