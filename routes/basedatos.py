from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import pandas as pd
from models import db, Socios, Proveedor

dataBase_db = Blueprint('/basedatos', __name__)

@dataBase_db.route('/api/cargar_excel_temp', methods=['POST'])
def cargar_excel_temp():
    if 'file' not in request.files:
        return jsonify({"message": "Archivo no encontrado"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "Nombre de archivo vacío"}), 400

    # Obtener el valor de UPLOAD_FOLDER desde la configuración de Flask
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filename = secure_filename(file.filename)  # Asegura que el nombre del archivo sea seguro
    file_path = os.path.join(upload_folder, filename)  # Construye la ruta completa del archivo
    file.save(file_path)  # Guarda el archivo en la carpeta definida

    try:
        # Procesar el archivo Excel
        data = pd.read_excel(file_path)
        rows = data[['A', 'B', 'C', 'D', 'E', 'F', 'G']].rename(
            columns={
                'A': 'bodega', 'B': 'referencia', 'C': 'nombre', 
                'D': 'tipo', 'E': 'cantidad', 'F': 'precio_compra', 
                'G': 'precio_venta'
            }
        ).to_dict(orient='records')

        # Validar y crear socio
        socio_id = str(data.iloc[0, 9])  # Fila 1, Columna J (índice 9)
        socio_nombre = str(data.iloc[0, 10])  # Fila 2, Columna K (índice 10)
        socio_contacto = str(data.iloc[0, 11])  # Fila 2, Columna L (índice 11)
        socio = Socios.query.filter_by(id=socio_id).first()
        if not socio:
            socio = Socios(id=socio_id, nombre=socio_nombre, contacto=socio_contacto)
            db.session.add(socio)

        # Validar y crear proveedor
        proveedor_nombre = str(data.iloc[1, 9]) #if not pd.isnull(data.iloc[2, 9]) else None
        proveedor_contacto = str(data.iloc[1, 10]) #if not pd.isnull(data.iloc[2, 10]) else None
        proveedor_telefono = str(data.iloc[1, 11]) #if not pd.isnull(data.iloc[2, 11]) else None
        proveedor = Proveedor.query.filter_by(nombre=proveedor_nombre).first()
        if not proveedor:
            proveedor = Proveedor(nombre=proveedor_nombre, contacto=proveedor_contacto, telefono=proveedor_telefono)
            db.session.add(proveedor)

        db.session.commit()

        return jsonify({
            "rows": rows,
            "socio": {"id": socio.id, "nombre": socio.nombre},
            "proveedor": {"nombre": proveedor.nombre}
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
