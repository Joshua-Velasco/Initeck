import pandas as pd
import mysql.connector
from datetime import datetime
import numpy as np

# ============== CONFIGURACIÓN ==============
# Reemplaza con tus credenciales de MySQL
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "" # Pon tu contraseña aquí si tienes una
DB_NAME = "inibay_tvs"
EXCEL_FILE = "VENTAS DE APPS TVS 2026.xlsx"
# ===========================================

def clean_boolean(val):
    if pd.isna(val) or val == '' or val is None:
        return False
    if str(val).lower() in ['true', '1', 'si', 'sí', 'yes', 'y']:
        return True
    return False

def clean_text(val):
    if pd.isna(val):
        return None
    return str(val).strip()

def clean_date(val):
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val.strftime('%Y-%m-%d')
    try:
        return pd.to_datetime(val).strftime('%Y-%m-%d')
    except:
        return None

def main():
    print("Conectando a MySQL...")
    try:
        # Primero conectar sin base de datos para crearla
        db = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = db.cursor()
        
        print(f"Creando base de datos '{DB_NAME}' si no existe...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        cursor.execute(f"USE {DB_NAME}")
        
        # Crear tabla clientes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                no_cliente VARCHAR(50) UNIQUE,
                nombre VARCHAR(150),
                telefono VARCHAR(50)
            )
        """)
        
        # Crear tabla suscripciones
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS suscripciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cliente_id INT,
                estatus BOOLEAN,
                demo BOOLEAN,
                equipo_1 VARCHAR(50),
                tv_1 BOOLEAN,
                equipo_2 VARCHAR(50),
                tv_2 BOOLEAN,
                detalles TEXT,
                fecha_activacion DATE,
                meses_activos INT,
                fecha_renovacion DATE,
                costo DECIMAL(10,2),
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            )
        """)
        
        # Crear tabla pagos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pagos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                suscripcion_id INT,
                mes INT,
                anio INT,
                pagado BOOLEAN,
                FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id)
            )
        """)
        
        db.commit()
    except Exception as e:
        print(f"Error de base de datos: {e}")
        return

    print("Leyendo archivo Excel...")
    try:
        # Los encabezados están en la fila 7 (índice 7) basándonos en la exploración previa
        df = pd.read_excel(EXCEL_FILE, header=7)
        # Limpiar filas completamente vacías
        df.dropna(how='all', inplace=True)
    except Exception as e:
        print(f"Error leyendo el Excel: {e}")
        return

    clientes_insertados = 0
    suscripciones_insertadas = 0
    pagos_insertados = 0

    print("Procesando e insertando datos...")
    
    # Asignar nombres limpios a las columnas basándonos en el índice
    for index, row in df.iterrows():
        # Extraer datos de cliente
        no_cliente = clean_text(row.get('No CLIENTE'))
        if not no_cliente:
            continue # Saltar filas sin número de cliente
            
        nombre = clean_text(row.get('NOMBRE DEL CLIENTE'))
        telefono = clean_text(row.get('TELEFONO'))
        
        # Insertar o encontrar cliente
        cursor.execute("SELECT id FROM clientes WHERE no_cliente = %s", (no_cliente,))
        res = cursor.fetchone()
        
        if res:
            cliente_id = res[0]
        else:
            cursor.execute(
                "INSERT INTO clientes (no_cliente, nombre, telefono) VALUES (%s, %s, %s)",
                (no_cliente, nombre, telefono)
            )
            cliente_id = cursor.lastrowid
            clientes_insertados += 1

        # Extraer datos de suscripción
        estatus = clean_boolean(row.get('ESTATUS'))
        demo = clean_boolean(row.get('DEMO'))
        
        equipo_1 = clean_text(row.get('EQUIPO'))
        tv_1 = clean_boolean(row.get('TV 1'))
        
        equipo_2 = clean_text(row.get('EQUIPO 2'))
        tv_2 = clean_boolean(row.get('TV 2'))
        
        detalles = clean_text(row.get('DETALLES'))
        
        fecha_activacion = clean_date(row.get('FECHA DE ACTIVACION'))
        
        meses_activos = row.get('MESES ACTIVOS')
        try:
            meses_activos = int(meses_activos) if pd.notna(meses_activos) else 0
        except:
            meses_activos = 0
            
        fecha_renovacion = clean_date(row.get('FECHA DE RENOVACION'))
        
        costo = row.get('COSTO')
        try:
            costo = float(costo) if pd.notna(costo) else 0.0
        except:
            costo = 0.0

        # Insertar suscripción
        cursor.execute("""
            INSERT INTO suscripciones 
            (cliente_id, estatus, demo, equipo_1, tv_1, equipo_2, tv_2, detalles, 
            fecha_activacion, meses_activos, fecha_renovacion, costo) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (cliente_id, estatus, demo, equipo_1, tv_1, equipo_2, tv_2, detalles, 
              fecha_activacion, meses_activos, fecha_renovacion, costo))
        
        suscripcion_id = cursor.lastrowid
        suscripciones_insertadas += 1

        # Procesar pagos (Enero, Febrero, Marzo)
        meses_columnas = {
            1: 'ENERO',
            2: 'FEBRERO',
            3: 'MARZO'
        }
        
        anio_actual = 2026 # Según el nombre del archivo

        for mes_num, col_name in meses_columnas.items():
            if col_name in row.index:
                pagado = clean_boolean(row.get(col_name))
                cursor.execute("""
                    INSERT INTO pagos (suscripcion_id, mes, anio, pagado)
                    VALUES (%s, %s, %s, %s)
                """, (suscripcion_id, mes_num, anio_actual, pagado))
                pagos_insertados += 1
                
        db.commit()

    print("\n--- RESUMEN DE MIGRACIÓN ---")
    print(f"Clientes nuevos insertados: {clientes_insertados}")
    print(f"Suscripciones registradas: {suscripciones_insertadas}")
    print(f"Registros de pagos guardados: {pagos_insertados}")
    
    cursor.close()
    db.close()
    print("¡Migración completada con éxito!")

if __name__ == "__main__":
    try:
        import mysql.connector
    except ImportError:
        print("Falta la librería mysql-connector-python. Por favor instálala ejecutando:")
        print("pip install mysql-connector-python")
        exit(1)
        
    main()
