import zipfile
import xml.etree.ElementTree as ET

docx_in = r"c:\PROJECTS\CAPSTONE\FINOPS_FINAL.docx"
docx_out = r"c:\PROJECTS\CAPSTONE\FINOPS_FINAL_FIXED.docx"

with zipfile.ZipFile(docx_in, 'r') as zin:
    all_files = {item.filename: zin.read(item.filename) for item in zin.infolist()}

doc_xml = all_files['word/document.xml'].decode('utf-8')

# Fix known text drops and stripped symbols caused by paste
replacements = [
    ("Cherukuri Deepeika", "Cherukuri Deepika"),
    ("Alapati Geeshma", "Alapati Greeshma"),
    ("Extracting high-frequency () telemetry", "Extracting high-frequency (<= 2.0s) telemetry"),
    ("sub-20% compute waste", "sub-20% compute waste"),
    ("Disabling the EMA filter () caused idle containers to erratically flip to active states times per minute",
     "Disabling the EMA filter (alpha = 1.0) caused idle containers to erratically flip to active states 4 to 6 times per minute"),
    ("mathematical limit alignment ()", "mathematical limit alignment (0.95 / 2 Cores = 47.5%)"),
    ("algorithm (), and programmed", "algorithm (0.95 / 2 Cores = 47.5%), and programmed"),
    ("sampling jitter ()", "sampling jitter (> 50%)"),
    ("eliminates jitter", "eliminates >= 60% jitter"),
    ("Fail ()", "Fail (< 50)"),
    ("Marginal ()", "Marginal (50 - 79)"),
    ("Pass Anchor ()", "Pass Anchor (>= 80)"),
    ("Perfect mathematical sync ()", "Perfect mathematical sync (Used / Limit * 100)"),
    ("Reliably isolates compute waste", "Reliably isolates < 20% compute waste"),
    ("Table row 51: 5.4 O3 FinOps Waste Detection and Right-Sizing Engine | 30", "5.4 O3 FinOps Waste Detection and Right-Sizing Engine | 30"),
    ("APPENDIX A: SUPPORTED LANGUAGES, AST NORMALISATION &amp; SIGNAL SCHEMA", "APPENDIX A: OBJECTIVE-TO-EVIDENCE TRACEABILITY AUDIT"),
    ("APPENDIX A – SUPPORTED LANGUAGES, AST NORMALISATION", "APPENDIX A – OBJECTIVE-TO-EVIDENCE TRACEABILITY AUDIT"),
    ("2.5 Telemetry Ingestion, Cgroups and Noise Mitigation Models", "2.5 Telemetry Ingestion, Cgroups and Noise Mitigation Models"),
]

for old, new in replacements:
    if old in doc_xml:
        doc_xml = doc_xml.replace(old, new)
        print(f"Replaced: '{old}' -> '{new}'")

all_files['word/document.xml'] = doc_xml.encode('utf-8')

with zipfile.ZipFile(docx_out, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
    for filename, data in all_files.items():
        zout.writestr(filename, data)

print("Saved repaired docx to:", docx_out)
