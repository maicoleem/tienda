from flask import Blueprint, request, jsonify, render_template
from models import db, Producto, Bodega, Almacenamiento, LibroRegistro, Empleado, Proveedor, Cliente
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

        for registro in datos:
            referencia = registro.get('referencia')
            cantidad_venta = registro.get('cantidad')

            # Validar que el producto exista en almacenamiento
            almacenamiento = Almacenamiento.query.filter_by(referencia=referencia, bodega=registro.get('bodega')).first()
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
                fecha=datetime.fromisoformat(registro.get('fecha')),
                empleado=registro.get('empleado'),
                cliente=registro.get('cliente'),
                movimiento='Salida',
                referencia=referencia,
                nombre=registro.get('nombre'),
                tipo=registro.get('tipo'),
                bodega=registro.get('bodega'),
                cantidad=int(cantidad_venta),
                precio_compra=almacenamiento.precio_compra,
                precio_venta=float(registro.get('precio_venta')),
                ganancia=ganancia,
                observaciones=registro.get('observaciones', "")
            )

            db.session.add(nuevo_registro)

        # Confirmar cambios
        db.session.commit()
        return jsonify({"mensaje": "Venta realizada exitosamente"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al procesar la venta", "detalle": str(e)}), 500