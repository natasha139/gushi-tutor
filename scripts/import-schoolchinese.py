import re,json,hashlib,subprocess,sys
from pathlib import Path
root=Path(sys.argv[1]); entries=[]; edition=''; grade=''; missing=[]
for line in (root/'README.md').read_text().splitlines():
 if line.startswith('## '): edition=line[3:].strip()
 if line.startswith('### '): grade=line[4:].strip()
 m=re.match(r'\[(.*?)\]\(([^)]+\.md)\)',line)
 if not m: continue
 path=root/m[2]
 if not path.is_file(): missing.append(m[2]);continue
 text=path.read_text().strip(); title=re.search(r'^# (.+)',text,re.M)[1].strip(); authors=re.findall(r'^>\s*(.+)',text,re.M); author=' / '.join(authors)
 parts=re.split(r'^## (.+)\n',re.sub(r'^# .+\n?', '',text,count=1,flags=re.M),flags=re.M)
 sections=[(title,parts[0])] if len(parts)==1 else [(title+' · '+parts[i],parts[i+1]) for i in range(1,len(parts),2)]
 for name,body in sections:
  body=re.sub(r'^>.*\n?', '',body,flags=re.M).strip();body=re.sub(r'\n{3,}','\n\n',body)
  if not body: raise ValueError(path)
  ident=hashlib.sha256((name+'\0'+author+'\0'+body).encode()).hexdigest()[:24]
  paragraphs=[s for s in body.splitlines() if s.strip()]
  kind='poem' if all(len(s)<=45 for s in paragraphs) and not any(x in name for x in ['论语','大道之行','夸父','共工']) else 'prose'
  entries.append(dict(id=ident,title=name,author=author,body=body,kind=kind,edition=edition,grade=grade,source_path=m[2],source_url='https://github.com/lanhin/SchoolChinese/blob/'+subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()+'/'+m[2]))
seen={}; unique=[]
for e in entries:
 if e['id'] in seen:
  seen[e['id']]['grade']+=' / '+e['grade'];continue
 seen[e['id']]=e;unique.append(e)
def q(v): return "'"+v.replace("'","''")+"'"
schema='CREATE TABLE IF NOT EXISTS literature_library (id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, body TEXT NOT NULL, kind TEXT NOT NULL, edition TEXT NOT NULL, grade TEXT NOT NULL, source_path TEXT NOT NULL, source_url TEXT NOT NULL);\n'
sql=schema+'\n'.join('INSERT INTO literature_library ('+', '.join(e)+') VALUES ('+', '.join(q(v) for v in e.values())+') ON CONFLICT(id) DO NOTHING;' for e in unique)+'\n'
Path(__file__).resolve().parents[1].joinpath('data/schoolchinese.sql').write_text(sql)
Path(__file__).resolve().parents[1].joinpath('data/schoolchinese.json').write_text(json.dumps(unique,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'entries':len(entries),'unique':len(unique),'missing':missing,'grades':sorted(set(e['grade'] for e in unique))},ensure_ascii=False))
