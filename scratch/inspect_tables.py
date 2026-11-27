import zipfile
import xml.etree.ElementTree as ET

docx_path = r"c:\PROJECTS\CAPSTONE\FINOPS_FINAL.docx"

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read("word/document.xml")
    root = ET.fromstring(xml_content)

namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
body = root.find('w:body', namespaces)

tbls = body.findall('w:tbl', namespaces)
print(f"Total tables in document: {len(tbls)}")

for idx, tbl in enumerate(tbls):
    rows = []
    for r in tbl.findall('w:tr', namespaces):
        row = []
        for c in r.findall('w:tc', namespaces):
            c_texts = [t.text for t in c.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
            row.append(' '.join(''.join(c_texts).split()))
        rows.append(row)
    
    print(f"\n==================================================")
    print(f"TABLE {idx+1}: {len(rows)} rows, {len(rows[0]) if rows else 0} cols")
    for r_idx, r in enumerate(rows):
        print(f"  Row {r_idx+1}: {' | '.join(r)}")
