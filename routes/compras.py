# routes/compras.py
from flask import Blueprint, request, jsonify, render_template
from models import db, Producto, Bodega, Almacenamiento, LibroRegistro, Empleado, Proveedor, Cliente
from datetime import datetime

compras_bp = Blueprint('/compras', __name__)

# Ruta para cargar la página de compras
@compras_bp.route('/compras')
def compras():
    return render_template('compras.html')

# Listar todos los registros del LibroRegistro
@compras_bp.route('/api/libro-registro', methods=['GET'])
def listar_registros():
    try:
        registros = LibroRegistro.query.all()
        return jsonify([
            {
                "id": registro.id,
                "fecha": registro.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                "empleado": registro.empleado,
                "proveedor": registro.proveedor,
                "cliente": registro.cliente,
                "movimiento": registro.movimiento,
                "referencia": registro.referencia,
                "nombre": registro.nombre,
                "tipo": registro.tipo,
                "bodega": registro.bodega,            
                "cantidad": registro.cantidad,
                "precio_compra": registro.precio_compra,
                "precio_venta": registro.precio_venta,
                "ganancia": registro.ganancia,
                "observaciones": registro.observaciones
            }
            for registro in registros
        ]), 200
    except Exception as e:
        return jsonify({"error": "Error al listar registros", "detalle": str(e)}), 500


# Agregar una compra (entrada)
@compras_bp.route('/api/libro-registro', methods=['POST'])
def agregar_registro():
    data = request.json
    producto = Producto.query.filter_by(referencia=data['referencia']).first()
    # Si el producto no existe, lo creamos
    if not producto:
        nuevo_producto = Producto(
            referencia=data['referencia'],
            nombre=data['nombre'],
            tipo=data['tipo']
        )
        db.session.add(nuevo_producto)

    # guarda en almacenamiento
    almacenamiento = Almacenamiento(
            bodega=data['bodega'],
            referencia=data['referencia'],
            nombre=data['nombre'],
            tipo=data['tipo'],
            cantidad=int(data['cantidad']),
            precio_compra=float(data['precio_compra']),
            precio_venta=float(data['precio_venta'])  
        )
    db.session.add(almacenamiento)

    # Registrar en el LibroRegistro
    nuevo_registro = LibroRegistro(
        fecha=datetime.now(),
        empleado=data.get('empleado', ''),
        proveedor=data.get('proveedor', ''),
        cliente=data.get('cliente', ''),
        movimiento='Entrada',
        referencia=data['referencia'],
        nombre=data['nombre'],
        tipo=data['tipo'],
        bodega=data['bodega'],
        cantidad=int(data['cantidad']),
        precio_compra=float(data['precio_compra']),  # precio de compra
        precio_venta=float(data['precio_venta']),  # Inicialmente 0 para entradas
        ganancia=float(data['ganancia']),
        observaciones=data.get('observaciones', '')
    )

    db.session.add(nuevo_registro)

    db.session.commit()
    return jsonify({"mensaje": "Compra registrada exitosamente"}), 201

# Buscar productos por nombre o referencia
@compras_bp.route('/api/productos', methods=['GET'])
def buscar_productos():
    termino = request.args.get('q', '')
    productos = Producto.query.filter(
        (Producto.nombre.ilike(f"%{termino}%")) | (Producto.referencia.ilike(f"%{termino}%"))
    ).all()
    return jsonify([
        {"id": producto.id, "referencia": producto.referencia, "nombre": producto.nombre, "tipo": producto.tipo}
        for producto in productos
    ])

# Buscar bodegas por nombre o código
@compras_bp.route('/api/bodegas', methods=['GET'])
def buscar_bodegas():
    termino = request.args.get('q', '')
    bodegas = Bodega.query.filter(
        (Bodega.nombre.ilike(f"%{termino}%")) | (Bodega.codigo.ilike(f"%{termino}%"))
    ).all()
    return jsonify([
        {"id": bodega.id, "codigo": bodega.codigo, "nombre": bodega.nombre, "descripcion": bodega.descripcion}
        for bodega in bodegas
    ])

# Obtener las primeras bodegas
@compras_bp.route('/api/bodegas-iniciales', methods=['GET'])
def bodegas_iniciales():
    bodegas = Bodega.query.limit(5).all()
    return jsonify([
        {"id": bodega.id, "codigo": bodega.codigo, "nombre": bodega.nombre, "descripcion": bodega.descripcion}
        for bodega in bodegas
    ])

# Obtener los primeros productos
@compras_bp.route('/api/productos-iniciales', methods=['GET'])
def productos_iniciales():
    productos = Producto.query.limit(5).all()
    return jsonify([
        {"id": producto.id, "referencia": producto.referencia, "nombre": producto.nombre, "tipo": producto.tipo}
        for producto in productos
    ])
# Obtener empleados
@compras_bp.route('/api/empleados', methods=['GET'])
def listar_empleados():
    empleados = Empleado.query.all()
    return jsonify([{"id": empleado.id, "nombre": empleado.nombre} for empleado in empleados])

# Obtener proveedores
@compras_bp.route('/api/proveedores', methods=['GET'])
def listar_proveedores():
    proveedores = Proveedor.query.all()
    return jsonify([{"id": proveedor.id, "nombre": proveedor.nombre} for proveedor in proveedores])

# Obtener clientes
@compras_bp.route('/api/clientes', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    return jsonify([{"id": cliente.id, "nombre": cliente.nombre} for cliente in clientes])

# Verificar si una referencia de producto ya existe
@compras_bp.route('/api/validar-referencia', methods=['GET'])
def validar_referencia():
    referencia = request.args.get('referencia', None)
    if not referencia:
        return jsonify({"error": "No se proporcionó la referencia"}), 400

    producto = Producto.query.filter_by(referencia=referencia).first()
    if producto:
        return jsonify({"existe": True, "mensaje": "La referencia ya existe"}), 200
    else:
        return jsonify({"existe": False, "mensaje": "La referencia está disponible"}), 200

