#!/bin/bash

# Script para automatizar la instalación y ejecución de Tienda

# Verifica si el archivo tiende.tar.gz existe en el directorio actual
if [ ! -f "tienda.tar.gz" ]; then
    echo "El archivo 'tienda.tar.gz' no se encuentra en el directorio."
    exit 1
fi

# Pide la contraseña de administrador para realizar tareas como descomprimir y crear el lanzador
echo "Este script necesita privilegios de administrador para completar la instalación."

# Descomprimir el archivo en el directorio ~/tienda
echo "Descomprimiendo 'tienda.tar.gz' en el directorio ~/tienda..."
tar -xzvf tienda.tar.gz -C ~/

# Acceder al directorio del proyecto
cd ~/tienda

# Dar permisos de ejecución a los scripts
chmod +x install.sh run.sh

# Ejecutar el script de instalación
echo "Instalando dependencias de Python..."
./install.sh

# Crear un archivo .desktop para el lanzador en el escritorio
echo "Creando el lanzador en el escritorio..."
cat > ~/Desktop/Tienda.desktop <<EOF
[Desktop Entry]
Name=Tienda
Exec=/home/\$(whoami)/tienda/run.sh
Icon=/home/\$(whoami)/tienda/icono.png
Type=Application
Terminal=true
EOF

# Dar permisos de ejecución al lanzador
chmod +x ~/Desktop/Tienda.desktop

# Informar al usuario que la instalación ha finalizado y que puede ejecutar la aplicación desde el escritorio
echo "Instalación completada con éxito."
echo "Ahora puedes ejecutar la aplicación desde el escritorio haciendo doble clic en 'Tienda'."
