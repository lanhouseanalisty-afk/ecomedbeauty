
import csv
import uuid
import sys

# Input/Output files
INPUT_CSV = "migracao_inventario.csv"
OUTPUT_SQL = "RESTORE_FROM_CSV.sql"

def escape_sql(val):
    if not val:
        return "NULL"
    val = str(val).replace("'", "''")
    return f"'{val}'"

def normalize_status(raw_status, assigned_name):
    s = str(raw_status).lower()
    if 'uso' in s or 'use' in s or 'atribuido' in s:
        return 'in_use'
    if 'manutencao' in s or 'conserto' in s:
        return 'maintenance'
    if 'quebrado' in s or 'defeito' in s:
        return 'broken'
    if 'perda' in s or 'extravio' in s:
        return 'lost'
    if 'devolvido' in s:
        return 'available' # Or strictly available
    
    # Auto-assign in_use if has user
    if assigned_name and assigned_name not in ['Disponível', '*', '**', '']:
        return 'in_use'
        
    return 'available'

def normalize_type(raw_type, hostname):
    t = str(raw_type).lower()
    if 'lap' in hostname.lower():
        return 'notebook'
    if 'celular' in t or 'phone' in t or 'mobile' in t:
        return 'smartphone'
    if 'tablet' in t or 'ipad' in t:
        return 'tablet'
    if 'chip' in t or 'sim' in t:
        return 'chip'
    if 'monitor' in t:
        return 'monitor'
    if 'note' in t or 'computador' in t:
        return 'notebook'
    return 'other' # Default

try:
    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        sql_lines = []
        sql_lines.append("-- AUTOMATICALLY GENERATED RESTORE SCRIPT")
        sql_lines.append("-- Source: migracao_inventario.csv")
        sql_lines.append("")
        sql_lines.append("BEGIN;")
        sql_lines.append("")
        sql_lines.append("-- 1. Clean up test data (OPTIONAL)")
        sql_lines.append("DELETE FROM tech_assets WHERE asset_tag LIKE 'TEST-%';")
        sql_lines.append("")
        sql_lines.append("-- 2. Insert Data")
        
        count = 0
        for row in reader:
            # Map CSV columns
            patrimonio = row.get('Patrimônio', '').strip()
            if not patrimonio:
                continue
                
            model = row.get('Modelo', '') or row.get('Equipamento', '')
            brand = row.get('Marca', '')
            hostname = row.get('Hostname', '')
            assigned = row.get('Responsável', '')
            serial = row.get('Série', '')
            status_raw = row.get('Status', '')
            type_raw = row.get('Tipo', '')
            location = row.get('Local', '')
            company = row.get('Empresa', '')
            notes = row.get('Observações', '')
            
            # Logic
            final_status = normalize_status(status_raw, assigned)
            final_type = normalize_type(type_raw, hostname)
            
            # SQL Insert
            values = [
                escape_sql(patrimonio),
                escape_sql(model),
                escape_sql(brand),
                escape_sql(hostname),
                escape_sql(assigned),
                escape_sql(serial),
                escape_sql(final_status),
                escape_sql(final_type),
                escape_sql(location),
                escape_sql(company),
                escape_sql(notes)
            ]
            
            sql = f"""INSERT INTO tech_assets (asset_tag, model, brand, hostname, assigned_to_name, serial_number, status, device_type, location, company, notes) VALUES ({", ".join(values)}) ON CONFLICT (asset_tag) DO UPDATE SET assigned_to_name = EXCLUDED.assigned_to_name, status = EXCLUDED.status;"""
            sql_lines.append(sql)
            count += 1
            
        sql_lines.append("")
        sql_lines.append("COMMIT;")
        sql_lines.append(f"-- Total records: {count}")

    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))
        
    print(f"Success: Generated {OUTPUT_SQL} with {count} records.")

except Exception as e:
    print(f"Error: {e}")
