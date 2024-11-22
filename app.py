from flask import Flask, request, jsonify
from models import db, Proveedor
from __init__ import create_app

app = create_app()

@app.route('/proveedores', methods=['POST'])
def crear_proveedor():
    data = request.json
    nuevo_proveedor = Proveedor(nombre=data['nombre'], contacto=data.get('contacto', ''))
    db.session.add(nuevo_proveedor)
    db.session.commit()
    return jsonify({'mensaje': 'Proveedor creado con éxito'}), 201

@app.route('/proveedores', methods=['GET'])
def listar_proveedores():
    proveedores = Proveedor.query.all()
    resultado = [{'id': p.id, 'nombre': p.nombre, 'contacto': p.contacto} for p in proveedores]
    return jsonify(resultado)

@app.route('/proveedores/<int:id>', methods=['PUT'])
def actualizar_proveedor(id):
    data = request.get_json()
    proveedor = Proveedor.query.get_or_404(id)
    proveedor.nombre = data.get('nombre', proveedor.nombre)
    proveedor.contacto = data.get('contacto', proveedor.contacto)
    db.session.commit()
    return jsonify({"mensaje": "Proveedor actualizado con éxito"})

@app.route('/proveedores/<int:id>', methods=['DELETE'])
def eliminar_proveedor(id):
    proveedor = Proveedor.query.get_or_404(id)
    db.session.delete(proveedor)
    db.session.commit()
    return jsonify({"mensaje": "Proveedor eliminado con éxito"})

if __name__ == '__main__':
    app.run(debug=True)
