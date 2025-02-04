from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
import os
import pandas as pd
from models import db, Socios, Proveedor
import ezodf
import io
from datetime import datetime
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
# Importa tus modelos de la base de datos
from models import (
     Proveedor, Cliente, Empleado, Producto, Bodega,
    Almacenamiento, LibroRegistro, CuentaContable,
    LibroContable, Socios, Servicios
)

dataBase_db = Blueprint('/basedatos/', __name__)

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
        proveedor_detalle = str(data.iloc[1, 11]) #if not pd.isnull(data.iloc[2, 11]) else None
        proveedor = Proveedor.query.filter_by(nombre=proveedor_nombre).first()
        if not proveedor:
            proveedor = Proveedor(nombre=proveedor_nombre, contacto=proveedor_contacto, telefono=proveedor_detalle)
            db.session.add(proveedor)

        db.session.commit()

        return jsonify({
            "rows": rows,
            "socio": {"id": socio.id, "nombre": socio.nombre},
            "proveedor": {"nombre": proveedor.nombre}
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def create_ods_from_db(db_uri, tables):
    """Crea un archivo ODS con los datos de las tablas de la base de datos."""
    
    engine = create_engine(db_uri)
    Session = sessionmaker(bind=engine)
    session = Session()

    doc = ezodf.newdoc(doctype='ods', filename='erp_data.ods')

    for table_name in tables:
        table_model = globals().get(table_name)
        if not table_model:
            print(f"Warning: Table model not found for '{table_name}'. Skipping...")
            continue
        
        try:
           
            data = session.query(table_model).all()
            if not data:
                print(f"Warning: No data in table '{table_name}'. Skipping...")
                continue
            
            df = pd.read_sql_query(session.query(table_model).statement, session.bind)
            
            sheet = doc.sheets.create_sheet(table_name)
            sheet_name = table_name
            sheet.name = sheet_name
            
            # Escribir los nombres de las columnas
            for col_idx, column in enumerate(df.columns):
                sheet[(0, col_idx)].set_value(str(column))

            # Escribir los datos
            for row_idx, row in df.iterrows():
                for col_idx, value in enumerate(row):
                    sheet[(row_idx+1, col_idx)].set_value(str(value))
        except Exception as e:
            print(f"Error processing table '{table_name}': {e}")
    
    session.close()

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer

@dataBase_db.route('/api/download_ods')
def download_ods():
    all_tables = [
        'Proveedor', 'Cliente', 'Empleado', 'Producto', 'Bodega',
        'Almacenamiento', 'LibroRegistro', 'CuentaContable',
        'LibroContable', 'Socios', 'Servicios'
    ]
    ods_buffer = create_ods_from_db(current_app.config['SQLALCHEMY_DATABASE_URI'], all_tables)
    now = datetime.now().strftime("%Y%m%d_%H%M%S")  # Generar marca de tiempo
    filename = f"erp_export_{now}.ods"
    return send_file(
        ods_buffer,
        mimetype='application/vnd.oasis.opendocument.spreadsheet',
        as_attachment=True,
        download_name=filename
    )

#Asegúrate de que los nombres de las hojas en tu archivo ODS coincidan exactamente con los nombres de tus modelos en la base de datos.
def upload_ods_to_db(file_path):
    """Sube los datos de un archivo ODS a la base de datos."""
    try:
        doc = ezodf.opendoc(file_path)
        session = db.session()

        for sheet in doc.sheets:
            table_name = sheet.name
            table_model = globals().get(table_name)

            if not table_model:
                print(f"Warning: No se encontró el modelo para la hoja '{table_name}'. Saltando...")
                continue
            
            header = [cell.value for cell in sheet.rows()[0]] # Obtener los nombres de las columnas de la primera fila
            # Ahora iteramos por cada fila de la hoja
            for row_idx, row in enumerate(sheet.rows()):
                if row_idx == 0:
                    continue  # Saltar la fila de encabezado
                
                row_values = [cell.value for cell in row]
                if all(value is None for value in row_values): # Si todos los valores son nulos, saltar la fila
                   continue 

                row_dict = dict(zip(header, row_values)) # Crear un diccionario usando los nombres de las columnas como claves
                
                # Crear una nueva instancia del modelo con los datos de la fila
                try:
                    instance = table_model(**row_dict)
                    session.add(instance)
                except Exception as e:
                    print(f"Error al agregar la fila en la tabla '{table_name}': {e}")
                    session.rollback()  # Revierte los cambios si hay un error
                    continue  # Continua con la siguiente fila
        session.commit()
        return True
    
    except Exception as e:
        print(f"Error al procesar el archivo ODS: {e}")
        return False
    
@dataBase_db.route('/api/upload_ods', methods=['POST'])
def upload_ods():
    if 'file' not in request.files:
        return jsonify({"message": "Archivo no encontrado"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "Nombre de archivo vacío"}), 400
    
    # Obtener el valor de UPLOAD_FOLDER desde la configuración de Flask
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filename = secure_filename(file.filename)  # Asegura que el nombre del archivo sea seguro
    file_path = os.path.join(upload_folder, filename)  # Construye la ruta completa del archivo
    file.save(file_path) # Guarda el archivo en la carpeta definida

    if upload_ods_to_db(file_path):
        return jsonify({"message": "Archivo ODS subido con éxito"}), 200
    else:
        return jsonify({"message": "Error al subir el archivo ODS"}), 500
    
def export_db_to_sql(db_uri):
    """Exporta toda la base de datos a un archivo SQL."""
    engine = create_engine(db_uri)
    metadata = db.metadata
    sql_statements = []

    with engine.connect() as connection:
        # Primero, las definiciones de las tablas
        for table in metadata.sorted_tables:
            sql_statements.append(str(table.create(connection, checkfirst=True)))
        
        # Luego, los datos de las tablas
        for table in metadata.sorted_tables:
            rows = connection.execute(table.select()).fetchall()
            for row in rows:
                insert_statement = table.insert().values(row)
                sql_statements.append(str(insert_statement.compile(connection)))

    return '\n'.join(sql_statements).encode('utf-8')

@dataBase_db.route('/api/download_sql')
def download_sql():
    try:
        filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        backup = export_db_to_sql(current_app.config['SQLALCHEMY_DATABASE_URI'])
        return send_file(
            io.BytesIO(backup),
            as_attachment=True,
            download_name=filename,
            mimetype="application/sql"
        )
    except Exception as e:
        print(f"Error al descargar el backup de la base de datos: {e}")
        return jsonify({"message": f"Error al descargar el backup de la base de datos: {e}"}), 500

def import_sql_to_db(db_uri, sql_file):
    """Importa la base de datos desde un archivo SQL."""
    engine = create_engine(db_uri)
    
    try:
        with engine.begin() as connection:
            sql_statements = sql_file.decode('utf-8').split(';')
            for sql in sql_statements:
                sql = sql.strip()
                if sql:
                    connection.execute(text(sql))

        return True
    except Exception as e:
        print(f"Error al restaurar la base de datos: {e}")
        return False

@dataBase_db.route('/api/upload_sql', methods=['POST'])
def upload_sql():
    if 'file' not in request.files:
        return jsonify({"message": "Archivo no encontrado"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "Nombre de archivo vacío"}), 400
    
    # Obtener el valor de UPLOAD_FOLDER desde la configuración de Flask
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filename = secure_filename(file.filename)  # Asegura que el nombre del archivo sea seguro
    file_path = os.path.join(upload_folder, filename)  # Construye la ruta completa del archivo
    file.save(file_path) # Guarda el archivo en la carpeta definida
    try:
        with open(file_path, 'rb') as f:
            sql_file = f.read()
        if import_sql_to_db(current_app.config['SQLALCHEMY_DATABASE_URI'],sql_file):
           return jsonify({"message": "Base de datos restaurada con exito"}), 200
        else:
            return jsonify({"message": "Error al restaurar la base de datos"}), 500

    except Exception as e:
        print(f"Error al restaurar la base de datos: {e}")
        return jsonify({"message": f"Error al restaurar la base de datos: {e}"}), 500
    
def clear_database(database_uri):
    engine = create_engine(database_uri)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    with engine.begin() as conn:
        for table in reversed(tables):
            try:
                conn.execute(text(f'DELETE FROM {table};'))
                # Reiniciar el autoincremento si es SQLite
                if 'sqlite' in database_uri:
                    conn.execute(text(f"DELETE FROM sqlite_sequence WHERE name='{table}';"))
            except Exception as e:
                print(f"Error al limpiar la tabla {table}: {e}")
    
@dataBase_db.route('/api/clear_db', methods=['POST'])
def clear_db():
    """Endpoint para limpiar todas las tablas de la base de datos."""
    try:
        clear_database(current_app.config['SQLALCHEMY_DATABASE_URI'])
        return jsonify({"message": "Todas las tablas han sido limpiadas con éxito."}), 200
    except Exception as e:
        print(f"Error al limpiar la base de datos: {e}")
        return jsonify({"message": f"Error al limpiar la base de datos: {e}"}), 500