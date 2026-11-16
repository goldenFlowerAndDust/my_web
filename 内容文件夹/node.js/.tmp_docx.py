import sys
from docx import Document
d = Document(sys.argv[1])
out = []
for p in d.paragraphs:
    t = p.text.strip()
    if t: out.append(t)
for tb in d.tables:
    for row in tb.rows:
        out.append(' | '.join(c.text.strip() for c in row.cells))
open(sys.argv[2], 'w', encoding='utf-8').write('\n'.join(out))