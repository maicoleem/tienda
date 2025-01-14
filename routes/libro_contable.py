from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, LibroContable
from sqlalchemy import func

libro_contable_bp = Blueprint('/contable', __name__)

@libro_contable_bp.route('/api/contable', methods=['POST'])
def crear_registro():
    try:
        datos = request.json
        nuevo_registro = LibroContable(
            fecha=datetime.fromisoformat(datos['fecha']),
            factura=datos.get('factura'),
            detalle=datos.get('detalle'),
            codigo_cuenta=datos.get('codigo_cuenta'),
            cuenta=datos.get('cuenta'),
            debe=float(datos.get('debe', 0)),
            haber=float(datos.get('haber', 0))
        )
        db.session.add(nuevo_registro)
        db.session.commit()
        return jsonify({"mensaje": "Registro creado exitosamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear el registro", "detalle": str(e)}), 500

@libro_contable_bp.route('/api/contable', methods=['GET'])
def obtener_registros():
    try:
        registros = LibroContable.query.all()
        resultado = [
            {
                "id": registro.id,
                "fecha": registro.fecha.isoformat(),
                "factura": registro.factura,
                "detalle": registro.detalle,
                "codigo_cuenta": registro.codigo_cuenta,
                "cuenta": registro.cuenta,
                "debe": registro.debe,
                "haber": registro.haber
            }
            for registro in registros
        ]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener los registros", "detalle": str(e)}), 500

@libro_contable_bp.route('/libro-contable/<int:id>', methods=['GET'])
def obtener_registro(id):
    try:
        registro = LibroContable.query.get(id)
        if not registro:
            return jsonify({"error": "Registro no encontrado"}), 404

        resultado = {
            "id": registro.id,
            "fecha": registro.fecha.isoformat(),
            "factura": registro.factura,
            "detalle": registro.detalle,
            "codigo_cuenta": registro.codigo_cuenta,
            "cuenta": registro.cuenta,
            "debe": registro.debe,
            "haber": registro.haber
        }
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener el registro", "detalle": str(e)}), 500

@libro_contable_bp.route('/api/contable/<int:id>', methods=['PUT'])
def actualizar_registro(id):
    try:
        datos = request.json
        registro = LibroContable.query.get(id)
        if not registro:
            return jsonify({"error": "Registro no encontrado"}), 404

        registro.fecha = datetime.fromisoformat(datos['fecha'])
        registro.factura = datos.get('factura')
        registro.detalle = datos.get('detalle')
        registro.codigo_cuenta = datos.get('codigo_cuenta')
        registro.cuenta = datos.get('cuenta')
        registro.debe = float(datos.get('debe', registro.debe))
        registro.haber = float(datos.get('haber', registro.haber))

        db.session.commit()
        return jsonify({"mensaje": "Registro actualizado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar el registro", "detalle": str(e)}), 500

@libro_contable_bp.route('/api/contable/<int:id>', methods=['DELETE'])
def eliminar_registro(id):
    try:
        registro = LibroContable.query.get(id)
        if not registro:
            return jsonify({"error": "Registro no encontrado"}), 404

        db.session.delete(registro)
        db.session.commit()
        return jsonify({"mensaje": "Registro eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar el registro", "detalle": str(e)}), 500


@libro_contable_bp.route('/api/contable/buscar-facturas', methods=['GET'])
def buscar_facturas():
    try:
        # Obtener el parámetro de búsqueda
        cadena = request.args.get('cadena', '').strip()
        if not cadena:
            return jsonify({"error": "Debe proporcionar una cadena para buscar"}), 400

        # Buscar facturas que comiencen con la cadena
        facturas = LibroContable.query.filter(LibroContable.factura.like(f"{cadena}%")).all()

        # Serializar resultados
        resultado = [
            {
                "id": factura.id,
                "fecha": factura.fecha.isoformat(),
                "factura": factura.factura,
                "detalle": factura.detalle,
                "codigo_cuenta": factura.codigo_cuenta,
                "cuenta": factura.cuenta,
                "debe": factura.debe,
                "haber": factura.haber
            }
            for factura in facturas
        ]

        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": "Error al buscar facturas", "detalle": str(e)}), 500


@libro_contable_bp.route('/api/factura-max', methods=['GET'])
def obtener_factura_max():
    try:
        # Obtener el parámetro de búsqueda (cadena inicial)
        prefijo = request.args.get('prefijo', default='', type=str).strip()

        if not prefijo:
            return jsonify({"error": "El prefijo es obligatorio para filtrar las facturas"}), 400

        # Filtrar facturas que comiencen con el prefijo especificado
        factura_max = db.session.query(func.max(LibroContable.factura))\
            .filter(LibroContable.factura.like(f"{prefijo}%")).scalar()

        if not factura_max:
            # Si no hay facturas con el prefijo, iniciar la numeración
            nueva_factura = f"{prefijo}0001"
        else:
            # Separar prefijo y número
            numero = ''.join(filter(str.isdigit, factura_max[len(prefijo):]))
            siguiente_numero = int(numero) + 1
            nueva_factura = f"{prefijo}{siguiente_numero:04d}"  # Formato con 4 dígitos

        return jsonify({"nueva_factura": nueva_factura}), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener la nueva factura", "detalle": str(e)}), 500
    
@libro_contable_bp.route('/api/debe-haber-cuenta', methods=['GET'])
def sumar_debe_haber():
    try:
        # Obtener el parámetro 'codigo_cuenta' de los argumentos de la URL
        codigo_cuenta = request.args.get('codigo_cuenta', None)
        
        if not codigo_cuenta:
            return jsonify({"error": "Debe proporcionar un código de cuenta"}), 400
        
        # Realizar la suma de 'debe' y 'haber' filtrando por 'codigo_cuenta'
        resultados = db.session.query(
            func.sum(LibroContable.debe).label('total_debe'),
            func.sum(LibroContable.haber).label('total_haber')
        ).filter(LibroContable.codigo_cuenta == codigo_cuenta).first()
        
        # Verificar si hay resultados
        if resultados.total_debe is None and resultados.total_haber is None:
            return jsonify({"mensaje": "No se encontraron registros para el código de cuenta proporcionado"}), 404

        # Responder con los totales
        return jsonify({
            "codigo_cuenta": codigo_cuenta,
            "total_debe": resultados.total_debe or 7,
            "total_haber": resultados.total_haber or 0
        }), 200

    except Exception as e:
        return jsonify({"error": "Hubo un error al procesar la solicitud", "detalle": str(e)}), 500