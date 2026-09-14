/* Leitura local de Excel Open XML e CSV. Nenhum arquivo é enviado a servidores. */
(() => {
  const xml = text => {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('XML inválido no Excel.');
    return doc;
  };
  const all = (node, tag) => Array.from(node.getElementsByTagNameNS('*', tag));
  const first = (node, tag) => all(node, tag)[0];
  const content = (node, tag) => first(node, tag)?.textContent || '';
  function dateValue(serial, timeOnly, date1904) {
    if (timeOnly) {
      const seconds = Math.round((serial % 1) * 86400);
      return `${String(Math.floor(seconds / 3600) % 24).padStart(2,'0')}:${String(Math.floor(seconds / 60) % 60).padStart(2,'0')}`;
    }
    const date = new Date(Date.UTC(date1904 ? 1904 : 1899, date1904 ? 0 : 11, date1904 ? 1 : 30) + serial * 86400000);
    return `${String(date.getUTCDate()).padStart(2,'0')}/${String(date.getUTCMonth()+1).padStart(2,'0')}/${date.getUTCFullYear()}`;
  }
  async function readExcel(buffer) {
    if (!window.JSZip) throw new Error('O leitor Excel não carregou. Verifique se a pasta vendor acompanha o site.');
    const zip = await JSZip.loadAsync(buffer);
    let total = 0;
    for (const entry of Object.values(zip.files)) {
      total += entry._data?.uncompressedSize || 0;
      if (total > 80 * 1024 * 1024) throw new Error('Excel descompactado maior que 80 MB. Divida a base em arquivos menores.');
    }
    const read = async path => { const file = zip.file(path); if (!file) throw new Error(`Estrutura Excel incompleta: ${path}.`); return xml(await file.async('string')); };
    const workbook = await read('xl/workbook.xml');
    const rels = await read('xl/_rels/workbook.xml.rels');
    const targets = Object.fromEntries(all(rels,'Relationship').filter(r => r.getAttribute('TargetMode') !== 'External').map(r => [r.getAttribute('Id'),r.getAttribute('Target')]));
    const shared = zip.file('xl/sharedStrings.xml') ? all(await read('xl/sharedStrings.xml'),'si').map(si => all(si,'t').map(t => t.textContent).join('')) : [];
    const styles = zip.file('xl/styles.xml') ? await read('xl/styles.xml') : null;
    const formats = styles ? Object.fromEntries(all(styles,'numFmt').map(n => [n.getAttribute('numFmtId'),n.getAttribute('formatCode')])) : {};
    const xfs = styles ? Array.from(first(styles,'cellXfs')?.children || []) : [];
    const date1904 = ['1','true'].includes(first(workbook,'workbookPr')?.getAttribute('date1904'));
    const sheets = [];
    for (const sheet of all(workbook,'sheet')) {
      const target = targets[sheet.getAttribute('r:id') || sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')];
      if (!target) throw new Error('Aba sem referência válida.');
      const path = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//,'');
      const doc = await read(path);
      const rows = [];
      for (const row of all(doc,'row')) {
        const values = [];
        for (const cell of all(row,'c')) {
          const letters = (cell.getAttribute('r') || '').match(/^[A-Z]+/i)?.[0];
          let index = letters ? [...letters.toUpperCase()].reduce((n,c) => n*26+c.charCodeAt(0)-64,0)-1 : values.length;
          if (index > 16383) throw new Error('Coluna Excel inválida.');
          let value = content(cell,'v');
          const type = cell.getAttribute('t');
          if (type === 's') value = shared[Number(value)] ?? '';
          else if (type === 'inlineStr') value = all(cell,'t').map(t => t.textContent).join('');
          else if (type === 'b') value = value === '1' ? 'TRUE' : 'FALSE';
          else if (!value && first(cell,'f')) value = '=' + content(cell,'f');
          else if (!type || type === 'n') {
            const id = Number(xfs[Number(cell.getAttribute('s') || 0)]?.getAttribute('numFmtId') || 0);
            const format = (formats[id] || '').replace(/"[^"]*"|\\.|\[[^\]]*\]/g,'').toLowerCase();
            if (value !== '' && Number.isFinite(Number(value))) {
              const isTime = (id >= 18 && id <= 21) || id === 45 || id === 46 || id === 47 || (/h|s/.test(format) && !/d|y/.test(format));
              if ((id >= 14 && id <= 22) || isTime || /d|y/.test(format)) value = dateValue(Number(value),isTime,date1904);
              else if (/^0+$/.test(format)) value = value.padStart(format.length,'0');
            }
          }
          values[index] = value;
        }
        rows.push(Array.from({length:values.length},(_,i) => values[i] ?? ''));
      }
      sheets.push({name:sheet.getAttribute('name'),rows});
    }
    return sheets;
  }
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/,'');
    if (/^sep=[;,\t]\r?\n/i.test(text)) { const delimiter = text[4]; return parseDelimited(text.slice(text.indexOf('\n')+1),delimiter); }
    const candidates = [';',',','\t'].map(d => ({d,rows:parseDelimited(text,d)}));
    candidates.sort((a,b) => (b.rows[0]?.length || 0)-(a.rows[0]?.length || 0));
    return candidates[0].rows;
  }
  function parseDelimited(text, delimiter) {
    const rows=[]; let row=[],value='',quoted=false;
    for(let i=0;i<text.length;i++) {
      const c=text[i];
      if(c === '"') { if(quoted && text[i+1] === '"') { value+='"'; i++; } else if(quoted || !value) quoted=!quoted; else value+=c; }
      else if(c === delimiter && !quoted) {row.push(value);value='';}
      else if((c === '\n' || c === '\r') && !quoted) {row.push(value);rows.push(row);row=[];value='';if(c==='\r' && text[i+1]==='\n')i++;}
      else value+=c;
    }
    if(quoted) throw new Error('CSV com aspas não fechadas. Corrija o arquivo e tente novamente.');
    if(value || row.length) {row.push(value);rows.push(row);}
    return rows;
  }
  async function readFile(file) {
    if(file.size > 30*1024*1024) throw new Error('O limite por arquivo é 30 MB.');
    const buffer = await file.arrayBuffer();
    const extension = file.name.split('.').pop().toLowerCase();
    let sheets;
    if(extension === 'xlsx') sheets=await readExcel(buffer);
    else if(extension === 'csv') {
      const bytes=new Uint8Array(buffer);
      let encoding = bytes[0]===255 && bytes[1]===254 ? 'utf-16le' : bytes[0]===254 && bytes[1]===255 ? 'utf-16be' : 'utf-8';
      let text=new TextDecoder(encoding).decode(buffer);
      if(encoding==='utf-8' && text.includes('\uFFFD')) text=new TextDecoder('windows-1252').decode(buffer);
      sheets=[{name:'CSV',rows:parseCSV(text)}];
    } else throw new Error('Selecione um Excel .xlsx ou um arquivo .csv.');
    return {filename:file.name,updatedAt:new Date().toISOString(),sheets};
  }
  window.BaseImport = {readFile,parseCSV};
})();
