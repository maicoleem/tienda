from flask import Blueprint, request, jsonify
from models import db, Almacenamiento, LibroRegistro, LibroContable
from datetime import datetime

almacenamiento_bp = Blueprint('/almacenamiento', __name__)

# Listar todos los registros de almacenamiento
@almacenamiento_bp.route('/', methods=['GET'])
def listar_almacenamiento():
    registros = Almacenamiento.query.all()
    return jsonify([{
        "id": r.id,
        "bodega": r.bodega,
        "referencia": r.referencia,
        "nombre": r.nombre,
        "tipo": r.tipo,
        "cantidad": r.cantidad,
        "precio_compra": r.precio_compra,
        "precio_venta": r.precio_venta
    } for r in registros])

# Obtener un registro de almacenamiento por ID
@almacenamiento_bp.route('/<int:id>', methods=['GET'])
def obtener_registro(id):
    registro = Almacenamiento.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404
    return jsonify({
        "id": registro.id,
        "bodega": registro.bodega,
        "referencia": registro.referencia,
        "nombre": registro.nombre,
        "tipo": registro.tipo,
        "cantidad": registro.cantidad,
        "precio_compra": registro.precio_compra,
        "precio_venta": registro.precio_venta
    })

# Crear un nuevo registro de almacenamiento
@almacenamiento_bp.route('/', methods=['POST'])
def crear_registro():
    data = request.json
    if not all(key in data for key in ["bodega", "referencia", "nombre", "tipo", "cantidad", "precio_compra", "precio_venta"]):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    nuevo_registro = Almacenamiento(
        bodega=data['bodega'],
        referencia=data['referencia'],
        nombre=data['nombre'],
        tipo=data['tipo'],
        cantidad=data['cantidad'],
        precio_compra=data['precio_compra'],
        precio_venta=data['precio_venta']
    )
    db.session.add(nuevo_registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro creado exitosamente"}), 201

# Actualizar un registro de almacenamiento
@almacenamiento_bp.route('/<int:id>', methods=['PUT'])
def actualizar_registro(id):
    registro = Almacenamiento.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404

    data = request.json
    registro.bodega = data.get('bodega', registro.bodega)
    registro.referencia = data.get('referencia', registro.referencia)
    registro.nombre = data.get('nombre', registro.nombre)
    registro.tipo = data.get('tipo', registro.tipo)
    registro.cantidad = data.get('cantidad', registro.cantidad)
    registro.precio_compra = data.get('precio_compra', registro.precio_compra)
    registro.precio_venta = data.get('precio_venta', registro.precio_venta)

    db.session.commit()
    return jsonify({"mensaje": "Registro actualizado exitosamente"})

# Eliminar un registro de almacenamiento
@almacenamiento_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_registro(id):
    registro = Almacenamiento.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404

    db.session.delete(registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro eliminado exitosamente"})


#Producto vencido
@almacenamiento_bp.route('/producto-perdida', methods=['POST'])
def perdida():
    try:
        data = request.json  # Recibe lso datos del producto y la cantidad
        
        if not data:
            return jsonify({"error": "No se enviaron datos para procesar"}), 400
        
        required_fields = ['id', 'referencia', 'cantidad_perdida', 'precio_compra', 'factura']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({"error": f"El campo {field} es obligatorio"}), 400
        
        producto = Almacenamiento.query.filter_by(id=data['id']).first()
        if not producto:
            return jsonify({"error": "El producto no existe"}), 404
        
        cantidad_perdida = int(data['cantidad_perdida'])
        precio_compra = float(data['precio_compra'])
        costo_neto = cantidad_perdida * precio_compra
        cantidad_stock = int(producto.cantidad)

        if cantidad_perdida > cantidad_stock:
            return jsonify({"error": "La cantidad perdida es superior al stock"}), 400

        cantidad_actualizada = cantidad_stock - cantidad_perdida
        producto.cantidad = cantidad_actualizada
        db.session.add(producto)

        # Registrar en el LibroRegistro
        nuevo_registro = LibroRegistro(
            fecha=datetime.now(),
            empleado=data.get('empleado', ''),
            proveedor=data.get('proveedor', ''),
            cliente=data.get('cliente', ''),
            movimiento='Salida',
            referencia=data['referencia'],
            factura=data['factura'],
            nombre=producto.nombre,
            tipo=producto.tipo,
            bodega=producto.bodega,
            cantidad=int(cantidad_perdida),
            precio_compra=float(data['precio_compra']),  # precio de compra seleccionado
            precio_venta=float(producto.precio_compra),  # precio de compra de la data base
            ganancia=float(0),
            observaciones=data.get('observaciones', '')
        )
        db.session.add(nuevo_registro)

        #
        registro_costo_mercancia = LibroContable(
        fecha = datetime.now(),
        factura=data['factura'],
        detalle = data.get('observaciones', 'compras'),
        codigo_cuenta = '613505',
        cuenta = 'Costo de mercancías vendidas',
        debe = float(costo_neto),
        haber = float(0)
        )
        db.session.add(registro_costo_mercancia)

        registro_mercancias = LibroContable(
        fecha = datetime.now(),
        factura=data['factura'],
        detalle = data.get('observaciones', 'compras'),
        codigo_cuenta = '143505',
        cuenta = 'Mercancias no fabricadas por la empresa',
        debe = float(0),
        haber = float(costo_neto)
        )
        db.session.add(registro_mercancias)
        db.session.commit()
        return jsonify({
            "mensaje": "Producto actualizado correctamente",
            "referencia": producto.referencia,
            "cantidad_actualizada": producto.cantidad,
            "nombre": producto.nombre
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"No se pudo registrar la pérdida: {str(e)}"}), 500