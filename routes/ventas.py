from flask import Blueprint, request, jsonify, render_template
from models import db, Producto, Bodega, Almacenamiento, LibroRegistro, Empleado, Proveedor, Cliente, LibroContable
from datetime import datetime

ventas_bp = Blueprint('/ventas', __name__)

# Ruta para cargar la página de compras
@ventas_bp.route('/ventas')
def ventas():
    return render_template('ventas.html')

# Buscar almacenamiento
@ventas_bp.route('/api/almacenamiento', methods=['GET'])
def buscar_almacenamiento():
    termino = request.args.get('q', '')
    almacenamientos = Almacenamiento.query.filter(
        (Almacenamiento.nombre.ilike(f"%{termino}%"))
    ).all()
    return jsonify([
        {"id": almacenamiento.id, "bodega": almacenamiento.bodega, "referencia": almacenamiento.referencia, "nombre": almacenamiento.nombre, "tipo": almacenamiento.tipo, "cantidad": almacenamiento.cantidad, "precio_compra": almacenamiento.precio_compra, "precio_venta": almacenamiento.precio_venta}
        for almacenamiento in almacenamientos
    ])

@ventas_bp.route('/api/empleados', methods=['GET'])
def listar_empleados():
    empleados = Empleado.query.all()
    return jsonify([{"id": empleado.id, "nombre": empleado.nombre} for empleado in empleados])

# Obtener proveedores
@ventas_bp.route('/api/proveedores', methods=['GET'])
def listar_proveedores():
    proveedores = Proveedor.query.all()
    return jsonify([{"id": proveedor.id, "nombre": proveedor.nombre} for proveedor in proveedores])

# Obtener clientes
@ventas_bp.route('/api/clientes', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    return jsonify([{"id": cliente.id, "nombre": cliente.nombre} for cliente in clientes])

# Realizar venta
@ventas_bp.route('/api/realizar-venta', methods=['POST'])
def realizar_venta():
    try:
        datos = request.json  # Recibe una lista de registros
        if not datos:
            return jsonify({"error": "No se enviaron datos para procesar"}), 400
        
        # Extraer registros y datos adicionales
        registros = datos.get('registros', [])
        libro_contable = datos.get('contable', [])
         
         # Validar registros
        if not registros:
            return jsonify({"error": "No se enviaron registros para procesar"}), 400
        if not libro_contable:
            return jsonify({"error": "No se enviaron registros para procesar"}), 400

        for registro in registros:
            referencia = registro.get('referencia')
            cantidad_venta = registro.get('cantidad')

            # Validar que el producto exista en almacenamiento
            almacenamiento_id = registro.get('ganancia')
            if not almacenamiento_id:
                return jsonify({"error": "El ID del almacenamiento no fue proporcionado"}), 400
            
            almacenamiento = Almacenamiento.query.get(almacenamiento_id)#Almacenamiento.query.filter_by(id=registro.get('id')).first()
            if not almacenamiento:
                return jsonify({"error": f"Producto con referencia {referencia} no encontrado en la bodega especificada"}), 404
            
            # Verificar que haya suficiente cantidad
            if almacenamiento.cantidad < int(cantidad_venta):
                return jsonify({"error": f"No hay suficiente cantidad para la referencia {referencia}"}), 400

            # Actualizar cantidad en almacenamiento
            almacenamiento.cantidad -= int(cantidad_venta)

            # Calcular ganancia
            ganancia = (float(registro.get('precio_venta')) - almacenamiento.precio_compra) * int(cantidad_venta)

            # Crear el registro en LibroRegistro
            nuevo_registro = LibroRegistro(
                fecha=datetime.now(),
                empleado=registro.get('empleado'),
                cliente=registro.get('cliente'),
                movimiento='Salida',
                referencia=referencia,
                factura=libro_contable['factura'],
                nombre=registro.get('nombre'),
                tipo=registro.get('tipo'),
                bodega=registro.get('bodega'),
                cantidad=int(cantidad_venta),
                precio_compra=almacenamiento.precio_compra,
                precio_venta=float(registro.get('precio_venta')),
                ganancia=ganancia,
                observaciones=registro.get('observaciones', 'venta')
            )

            db.session.add(nuevo_registro)

        #movimientos contables
        registro_banco = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '111005',
            cuenta = 'Banco',
            debe = float(libro_contable['banco']),
            haber = float(0)
        )
        db.session.add(registro_banco)
    
        registro_caja = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '110505',
            cuenta = 'Caja',
            debe = float(libro_contable['efectivo']),
            haber = float(0)
        )
        db.session.add(registro_caja)

        registro_comercio = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '413505',
            cuenta = 'Comercio de mercancias',
            debe = float(0),
            haber = float(libro_contable['subtotal'])
        )
        db.session.add(registro_comercio)
        
        registro_iva = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '240805',
            cuenta = 'IVA por pagar',
            debe = float(0),
            haber = float(libro_contable['iva'])
        )
        db.session.add(registro_iva)

        registro_credito = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '130505',
            cuenta = 'Deudores clientes',
            debe = float(libro_contable['acredita']),
            haber = float(0)
        )
        db.session.add(registro_credito)

        registro_costo = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '613505',
            cuenta = 'Costo de mercancia vendida',
            debe = float(libro_contable['costo_mercancia']),
            haber = float(0)
        )
        db.session.add(registro_costo)
        
        registro_mercancias = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '143505',
            cuenta = 'Mercancias no fabricadas por la empresa',
            debe = float(0),
            haber = float(libro_contable['costo_mercancia'])
        )
        db.session.add(registro_mercancias)
        #Utilidad del ejercicio
        registro_utilidad = LibroContable(
            fecha = datetime.now(),
            factura=libro_contable['factura'],
            detalle = libro_contable.get('observaciones', 'venta'),
            codigo_cuenta = '360505',
            cuenta = 'Utilidad del ejercicio',
            debe = float(0),
            haber = float(libro_contable['ganancia_total'])
        )
        db.session.add(registro_utilidad)


        # Confirmar cambios
        db.session.commit()
        return jsonify({"mensaje": "Venta realizada exitosamente"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al procesar la venta", "detalle": str(e)}), 500