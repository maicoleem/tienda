#!/bin/bash

echo "Actualizando repositorios e instalando dependencias del sistema..."
sudo apt update
sudo apt install -y python3 python3-venv python3-pip

echo "Creando entorno virtual para Python..."
python3 -m venv venv

echo "Activando entorno virtual e instalando paquetes..."
source venv/bin/activate
pip install -r requirements.txt

echo "Instalación completada. Ahora puedes iniciar la aplicación con './run.sh'."
