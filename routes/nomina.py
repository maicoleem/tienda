from flask import jsonify, request, render_template, Blueprint
from models import db, Empleado, LibroContable, LibroRegistro
from datetime import datetime

nomina_bp = Blueprint('/nomina', __name__)

@nomina_bp.route('/empleados')
def obtener_empleados():
    empleados = Empleado.query.all()
    return jsonify([{
        'id': e.id, 'nombre': e.nombre, 'cargo': e.cargo, 'salario': e.salario
    } for e in empleados])

@nomina_bp.route('/api/pago-nomina', morhhods=['POST'])
def pago_nomina():
    try:
        data = request.json  # Recibe los datos del empleado y el pago
        
        if not data:
            return jsonify({"error": "No se enviaron datos para procesar"}), 400
        
        required_fields = ['empleado_id', 'pago', 'banco', 'caja', 'factura']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({"error": f"El campo {field} es obligatorio"}), 400
        
        empleado = Empleado.query.filter_by(id=data['empleado_id']).first()
        if not empleado:
            return jsonify({"error": "El empleado no existe"}), 404
        
        pago = float(data['pago'])
        caja = float(data['caja'])
        banco = float(data['banco'])
        neto = caja + banco
        if neto > pago:
            return jsonify({"error": "La cantidad pagada es superiro a la cantidad que se debe pagar"}), 400
        
        # Registrar en el LibroRegistro
        nuevo_registro = LibroRegistro(
            fecha=datetime.now(),
            empleado=data.get('empleado', ''),
            proveedor=data.get('proveedor', ''),
            cliente=data.get('cliente', ''),
            movimiento='Salida',
            referencia=data['referencia'],
            factura=data['factura'],
            nombre=empleado.nombre,
            tipo=empleado.cargo,
            bodega='nomina',
            cantidad=int(1),
            precio_compra=float(pago),  # cuanto se debe pagar (salario)
            precio_venta=float(neto),  # cuanto se pago
            ganancia=float(0),
            observaciones=data.get('observaciones', '')
        )
        db.session.add(nuevo_registro)

        #
        registro_pago_neto = LibroContable(
        fecha = datetime.now(),
        factura=data['factura'],
        detalle = data.get('observaciones', 'compras'),
        codigo_cuenta = '511505',
        cuenta = 'Sueldos y salarios',
        debe = float(neto),
        haber = float(pago - neto) #si se adeuda
        )
        db.session.add(registro_pago_neto)

        registro_caja = LibroContable(
        fecha = datetime.now(),
        factura=data['factura'],
        detalle = data.get('observaciones', 'nomina'),
        codigo_cuenta = '110505',
        cuenta = 'Caja',
        debe = float(0),
        haber = float(caja)
        )
        db.session.add(registro_caja)
        
        registro_banco = LibroContable(
        fecha = datetime.now(),
        factura=data['factura'],
        detalle = data.get('observaciones', 'nomina'),
        codigo_cuenta = '111005',
        cuenta = 'Banco',
        debe = float(0),
        haber = float(banco)
        )
        db.session.add(registro_banco)
        
        db.session.commit()
        return jsonify({
            "mensaje": "Pago de nomina exitoso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"No se pudo registrar el pago: {str(e)}"}), 500
