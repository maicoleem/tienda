from flask import Blueprint, request, jsonify
from models import db, LibroContable, LibroRegistro
from datetime import datetime

pagos_db = Blueprint('/pagos', __name__)

#Realizar pago de servicios
@pagos_db.route('/api/pago-servicio', methods = ['POST'])
def pagar_servicios():
    try:
        data = request.json
        #registro
        # Registrar en el LibroRegistro
        nuevo_registro = LibroRegistro(
            fecha=datetime.now(),
            empleado=data.get('empleado', ''),
            proveedor=data.get('observaciones', ''),
            cliente=data.get('cliente', ''),
            movimiento='Pagos',
            referencia=data.get('referencia', ''),
            factura=data['factura'],
            nombre=data.get('nombre', ''),
            tipo=data.get('tipo', ''),
            bodega=data.get('bodega', ''),
            cantidad=int(1),
            precio_compra=float(data['valor']),  # precio de compra
            precio_venta=float(0),  # Inicialmente 0 para entradas
            ganancia=float(0),
            observaciones=data.get('observaciones', '')
        )
        db.session.add(nuevo_registro)

        #cuenta debito servicios publicos
        registro_servicios = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'servicios'),
            codigo_cuenta = '513535',
            cuenta = 'Servicios publicos',
            debe = float(data['valor']) - float(data['iva']),
            haber = float(0)
        )
        db.session.add(registro_servicios)
        #cuenta debito iva descontable
        registro_servicios_iva = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'servicios'),
            codigo_cuenta = '240805',
            cuenta = 'IVA descontable',
            debe = float(data['iva']),
            haber = float(0)
        )
        db.session.add(registro_servicios_iva)
        #Pago a credito de servicios
        registro_credito = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'servicios'),
            codigo_cuenta = '220505',
            cuenta = 'Proveedores nacionales',
            debe = float(0),
            haber = float(data['credito'])
        )
        db.session.add(registro_credito)
        #cuenta credito caja
        registro_caja = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'servicios'),
            codigo_cuenta = '110505',
            cuenta = 'Caja',
            debe = float(0),
            haber = float(data['caja'])
        )
        db.session.add(registro_caja)

        #cuenta credito banco
        registro_banco = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'servicios'),
            codigo_cuenta = '111005',
            cuenta = 'Banco',
            debe = float(0),
            haber = float(data['banco'])
        )
        db.session.add(registro_banco)

        db.session.commit()
        return jsonify({"mensaje": "Pago registrado exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": "Error al pagar servicios", "detalle": str(e)}), 500
    
#Realizar pago de alquiler
@pagos_db.route('/api/pago-alquiler', methods = ['POST'])
def pagar_alquiler():
    try:
        data = request.json
        #registro
        # Registrar en el LibroRegistro
        nuevo_registro = LibroRegistro(
            fecha=datetime.now(),
            empleado=data.get('empleado', ''),
            proveedor=data.get('observaciones', ''),
            cliente=data.get('cliente', ''),
            movimiento='Pagos',
            referencia=data.get('referencia', ''),
            factura=data['factura'],
            nombre=data.get('nombre', ''),
            tipo=data.get('tipo', ''),
            bodega=data.get('bodega', ''),
            cantidad=int(1),
            precio_compra=float(data['valor']),  # precio de compra
            precio_venta=float(0),  # Inicialmente 0 para entradas
            ganancia=float(0),
            observaciones=data.get('observaciones', '')
        )
        db.session.add(nuevo_registro)

        #cuenta debito alquiler
        registro_servicios = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'alquiler'),
            codigo_cuenta = '513540',
            cuenta = 'Arrendamientos',
            debe = float(data['valor']) - float(data['iva']),
            haber = float(0)
        )
        db.session.add(registro_servicios)
        #cuenta debito iva descontable
        registro_alquiler_iva = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'servicios'),
            codigo_cuenta = '240805',
            cuenta = 'IVA descontable',
            debe = float(data['iva']),
            haber = float(0)
        )
        db.session.add(registro_alquiler_iva)
        #Pago a credito de alquiler
        registro_credito = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'alquiler'),
            codigo_cuenta = '220505',
            cuenta = 'Proveedores nacionales',
            debe = float(0),
            haber = float(data['credito'])
        )
        db.session.add(registro_credito)
        #cuenta credito caja
        registro_caja = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'alquiler'),
            codigo_cuenta = '110505',
            cuenta = 'Caja',
            debe = float(0),
            haber = float(data['caja'])
        )
        db.session.add(registro_caja)

        #cuenta credito banco
        registro_banco = LibroContable(
            fecha = datetime.now(),
            factura=data['factura'],
            detalle = data.get('observaciones', 'alquiler'),
            codigo_cuenta = '111005',
            cuenta = 'Banco',
            debe = float(0),
            haber = float(data['banco'])
        )
        db.session.add(registro_banco)

        db.session.commit()
        return jsonify({"mensaje": "Pago registrado exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": "Error al pagar alquiler", "detalle": str(e)}), 500
    
@pagos_db.route('/api/deshacer-pago/<factura>', methods=['DELETE'])
def deshacer_pago(factura):
    try:
        # Buscar todos los registros de LibroRegistro con la factura dada
        registros_libro = LibroRegistro.query.filter_by(factura=factura).all()
        
        if not registros_libro:
            return jsonify({"mensaje": "No se encontraron registros de pago con esa factura"}), 404

        # Eliminar los registros de libro registro asociados a la factura
        for registro in registros_libro:
             db.session.delete(registro)

        # Eliminar todos los registros del libro contable asociados a la factura
        registros_contables = LibroContable.query.filter_by(factura=factura).all()
        for registro_contable in registros_contables:
            db.session.delete(registro_contable)

        db.session.commit()
        return jsonify({"mensaje": f"Pago con factura {factura} deshecho exitosamente"}), 200
    except Exception as e:
         db.session.rollback()
         return jsonify({"error": f"Error al deshacer el pago: {str(e)} "}), 500