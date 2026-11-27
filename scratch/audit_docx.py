import zipfile
import xml.etree.ElementTree as ET

docx_path = r"c:\PROJECTS\CAPSTONE\FINOPS_FINAL.docx"

with zipfile.ZipFile(docx_path) as z:
    media_files = [f for f in z.namelist() if f.startswith("word/media/")]
    print(f"=== EMBEDDED MEDIA/IMAGES ({len(media_files)}) ===")
    for m in media_files:
        print(f"  {m} ({z.getinfo(m).file_size} bytes)")
    
    xml_content = z.read("word/document.xml")
    root = ET.fromstring(xml_content)

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

# Extract all paragraphs and tables in document order
body = root.find('w:body', namespaces)

elements = []
for child in body:
    tag = child.tag.split('}')[-1]
    if tag == 'p':
        texts = [t.text for t in child.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
        p_text = ''.join(texts).strip()
        if p_text:
            elements.append(('p', p_text))
    elif tag == 'tbl':
        rows = []
        for r in child.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tr'):
            row = []
            for c in r.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tc'):
                c_texts = [t.text for t in c.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
                row.append(' '.join(''.join(c_texts).split()))
            rows.append(row)
        elements.append(('tbl', rows))

print(f"\nTotal top-level elements: {len(elements)}")

# 1. Inspect all tables
print("\n=== TABLES AUDIT ===")
tbl_count = 0
for elem_type, data in elements:
    if elem_type == 'tbl':
        tbl_count += 1
        print(f"\n--- TABLE {tbl_count} (Rows: {len(data)}, Cols: {len(data[0]) if data else 0}) ---")
        for i, row in enumerate(data[:4]): # print first 4 rows
            print(f"  Row {i+1}: {' | '.join(row[:5])}")
        if len(data) > 4:
            print(f"  ... ({len(data)-4} more rows)")

# 2. Check for keywords from the other team's project
leak_keywords = [
    "tree-sitter", "tree sitter", "treesitter", "ast", "cst", 
    "plagiarism", "moss", "jplag", "ccfinder", "clone", 
    "pylint", "flake8", "spotbugs", "checkstyle", "codebert",
    "polyglot", "single-language", "cross-language"
]

print("\n=== LEAKED KEYWORDS FROM OLD PROJECT AUDIT ===")
found_leaks = []
for i, (elem_type, data) in enumerate(elements):
    if elem_type == 'p':
        text_lower = data.lower()
        for kw in leak_keywords:
            if kw in text_lower:
                found_leaks.append((i, kw, data[:120]))
    elif elem_type == 'tbl':
        for r_idx, row in enumerate(data):
            row_str = ' '.join(row).lower()
            for kw in leak_keywords:
                if kw in row_str:
                    found_leaks.append((i, kw, f"Table row {r_idx+1}: {' | '.join(row)[:100]}"))

print(f"Total keyword leak hits: {len(found_leaks)}")
for item in found_leaks[:20]:
    print(f"  [Keyword: '{item[1]}'] (Element {item[0]}): {item[2]}")
if len(found_leaks) > 20:
    print(f"  ... and {len(found_leaks) - 20} more occurrences")

# 3. Check Student IDs
print("\n=== STUDENT ID AUDIT ===")
all_text = ' '.join([data if elem_type=='p' else ' '.join([' '.join(r) for r in data]) for elem_type, data in elements])

import re
id_pattern = re.compile(r'23000\d{5}')
found_ids = set(id_pattern.findall(all_text))
print("Found IDs in document:", found_ids)

# Check specifically for the target IDs
target_ids = {
    "Syed Anas": "2300032619",
    "Alapati Greeshma": "2300033580",
    "Cherukuri Deepika": "2300032259",
    "B. Krishna Koushik": "2300031283"
}
for name, tid in target_ids.items():
    count = all_text.count(tid)
    print(f"  {name} ({tid}): found {count} times")

# Check for rogue/old IDs
rogue_ids = ["2300030670", "2300033813", "2300030466", "230003131283"]
for rid in rogue_ids:
    count = all_text.count(rid)
    if count > 0:
        print(f"  WARNING: Rogue/Old ID {rid} found {count} times!")

# 4. Check Chapter Structure
print("\n=== CHAPTER HEADINGS DETECTED ===")
for elem_type, data in elements:
    if elem_type == 'p':
        upper = data.upper()
        if any(h in upper for h in ["CHAPTER ", "APPENDIX ", "PROJECT AT A GLANCE", "STRUCTURED ABSTRACT"]):
            print(f"  >> {data[:90]}")
