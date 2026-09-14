const MY_MAPS_URL = "https://www.google.com/maps/d/edit?hl=pt-BR&mid=10HwNRTu34UfYUParmwc_21swb9OrORy8&ll=-23.491120767237867%2C-46.59948536465595&z=11";
const FILTERS = {
  fAba: "Aba de origem",
  fParceira: "Parceira",
  fStatus: "Status",
  fTipo: "Tipo de Serviço",
  fData: "Data Prog.",
  fIntervencao: "Intervenção",
  fRegiao: "Região"
};
const SEARCH_COLUMNS = ["Projeto", "Tipo de Serviço", "Data Prog.", "Status", "Intervenção", "PowerON", "Equipamento", "Parceira", "Região", "Latitude", "Longitude", "Situação Coordenadas"];
const CSV_COLUMNS = [...SEARCH_COLUMNS, "Horário Início", "Horário Fim", "Link Google Maps", "Link My Maps"];

function byId(id) { return document.getElementById(id); }
function normalize(value) { return String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function parseDate(value) {
  const [day, month, year] = String(value || "").split("/").map(Number);
  return year && month && day ? new Date(year, month - 1, day).getTime() : Number.MAX_SAFE_INTEGER;
}
function unique(field) {
  const values = [...new Set(PROJETOS.map((project) => project[field]).filter(Boolean))];
  if (field === "Data Prog.") return values.sort((a, b) => parseDate(a) - parseDate(b));
  return values.sort((a, b) => a.localeCompare(b, "pt-BR"));
}
function fillSelect(id, field) {
  const select = byId(id);
  select.replaceChildren(new Option("Todas / todos", ""));
  unique(field).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}
function hasCoordinates(project) {
  const lat = String(project.Latitude ?? '').trim().replace(',','.');
  const lon = String(project.Longitude ?? '').trim().replace(',','.');
  return lat !== '' && lon !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lon)) <= 180;
}
function countBy(projects, field) {
  return projects.reduce((counts, project) => {
    const label = project[field] || "Não informado";
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, Object.create(null));
}
function createCell(text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text || "";
  if (className) cell.className = className;
  return cell;
}
function createLinkCell(url, label, emptyLabel = "—") {
  const cell = document.createElement("td");
  if (!url) {
    cell.textContent = emptyLabel;
    cell.className = "muted";
    return cell;
  }
  const link = document.createElement("a");
  link.className = "link-mini";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = label;
  cell.appendChild(link);
  return cell;
}
function createStatusCell(project) {
  const cell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `coord-status ${hasCoordinates(project) ? "ok" : "missing"}`;
  badge.textContent = project["Situação Coordenadas"];
  cell.appendChild(badge);
  return cell;
}
function renderTable(projects) {
  const header = document.querySelector('#projectTable thead');
  const tr = document.createElement('tr');
  ['#','Aba de origem',...RAW_COLUMNS,'Google Maps'].forEach(name => {const th=document.createElement('th');th.textContent=name;tr.appendChild(th);});
  header.replaceChildren(tr);
  const body=document.querySelector('#projectTable tbody');
  const fragment=document.createDocumentFragment();
  projects.forEach((project,index) => {
    const row=document.createElement('tr');
    row.append(createCell(String(index+1)),createCell(project['Aba de origem']));
    RAW_COLUMNS.forEach(field => row.appendChild(createCell(project._raw[field])));
    row.appendChild(createLinkCell(hasCoordinates(project) ? 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(project.Latitude.replace(',','.')+','+project.Longitude.replace(',','.')) : '', 'Abrir Maps','—'));
    fragment.appendChild(row);
  });
  body.replaceChildren(fragment);
}
function chartRows(containerId, counts, colorClass, limit) {
  const container = byId(containerId);
  let entries = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
  if (limit) entries = entries.slice(0, limit);
  const maximum = Math.max(1, ...entries.map((entry) => entry[1]));
  container.replaceChildren(...entries.map(([label, value]) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    const title = document.createElement("div");
    title.className = "bar-label";
    title.title = label;
    title.textContent = label;
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = `bar-fill ${colorClass}`;
    fill.style.width = `${(value / maximum * 100).toFixed(2)}%`;
    track.appendChild(fill);
    const number = document.createElement("div");
    number.className = "bar-num";
    number.textContent = String(value);
    row.append(title, track, number);
    return row;
  }));
}
function renderPartners(projects) {
  const counts = countBy(projects, "Parceira");
  const chips = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR")).map(([label, value]) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.append(`${label} `);
    const count = document.createElement("strong");
    count.textContent = `(${value})`;
    chip.appendChild(count);
    return chip;
  });
  byId("partnerTags").replaceChildren(...chips);
}
function getFilteredProjects() {
  const query = normalize(byId("fBusca").value);
  return PROJETOS.filter((project) => {
    const matchesText = !query || Object.values(project._raw).some(value => normalize(value).includes(query));
    const matchesSelections = Object.entries(FILTERS).every(([id, field]) => !byId(id).value || project[field] === byId(id).value);
    return matchesText && matchesSelections;
  });
}
function refresh() {
  const projects = getFilteredProjects();
  const withCoordinates = projects.filter(hasCoordinates).length;
  renderTable(projects);
  chartRows("chartStatus", countBy(projects, "Status"), "blue");
  chartRows("chartInterv", countBy(projects, "Intervenção"), "green");
  chartRows("chartTipo", countBy(projects, "Tipo de Serviço"), "purple", 8);
  renderPartners(projects);
  byId("kFiltered").textContent = String(projects.length);
  byId("summaryCount").textContent = String(projects.length);
  byId("summaryCoord").textContent = String(withCoordinates);
  byId("summaryMissing").textContent = String(projects.length - withCoordinates);
  byId("emptyMsg").style.display = projects.length ? "none" : "block";
}
function updateClock() {
  byId("clock").textContent = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Sao_Paulo"
  }).format(new Date());
}

let PROJETOS = [], RAW_COLUMNS = [], ACTIVE_BASE, originalURL;
const ALIASES = {
  'Projeto':['Projeto','Projetos'],
  'Tipo de Serviço':['Descrição do Projeto','Tipo de Serviço','Descricao','Tipo de Servico'],
  'Data Prog.':['Data Programacao','Data Programação','Data Prog.','Data Prog','Data_Programação'],
  'Status':['Status Programacao','Status Programação','Status'],
  'Intervenção':['Tipo Intervencao','Tipo Intervenção','Intervenção','Tipo_Int'],
  'PowerON':['Numero PowerON','Número PowerON','PowerON'],
  'Equipamento':['Equipamentos','Equipamento'],
  'Parceira':['Contratada','Parceira','Empreiteira_Contratos'],
  'Região':['Regiao','Região','Regional'],
  'Horário Início':['Horario Inicio','Horário Início'],
  'Horário Fim':['Horario Fim','Horário Fim'],
  'Longitude':['Localização X (Longitude)','Longitude','Localizacao X'],
  'Latitude':['Localização Y (Latitude)','Latitude','Localizacao Y']
};
const key = value => normalize(value).replace(/[^a-z0-9]/g,'');
const DATE_COLUMN = 'Data Prog.';
function canonicalDate(value) {
  value=String(value ?? '').trim();
  let match=value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*| .*)?$/);
  if(match) return `${match[3]}/${match[2]}/${match[1]}`;
  match=value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(match) return `${match[1].padStart(2,'0')}/${match[2].padStart(2,'0')}/${match[3]}`;
  return value;
}
function prepareBase(base) {
  if(!base || !Array.isArray(base.sheets)) throw new Error('Base inválida.');
  const projects=[], columns=[];
  for(const sheet of base.sheets) {
    if(!Array.isArray(sheet.rows)) throw new Error('Aba inválida.');
    const rows=sheet.rows.filter(row => Array.isArray(row) && row.some(v => String(v ?? '').trim()));
    if(!rows.length) continue;
    const width=rows.reduce((maximum,row)=>Math.max(maximum,row.length),0);
    const used=new Set();
    const headers=Array.from({length:width},(_,i)=>{
      const original=String(rows[0][i] ?? '').trim() || `Coluna ${i+1}`;
      let name=original,n=2;
      while(used.has(name)) name=`${original} (${n++})`;
      used.add(name); if(!columns.includes(name)) columns.push(name);
      return name;
    });
    if(!headers.some(h => ALIASES.Projeto.some(a=>key(a)===key(h)))) throw new Error(`A aba “${sheet.name}” não tem uma coluna Projeto na primeira linha preenchida. A base anterior foi mantida; nenhuma aba foi descartada.`);
    for(const values of rows.slice(1)) {
      const raw=Object.create(null);
      headers.forEach((h,i)=>raw[h]=String(values[i] ?? ''));
      const project={'Aba de origem':String(sheet.name),_raw:raw};
      for(const [field,aliases] of Object.entries(ALIASES)) {
        const header=headers.find(h=>aliases.some(a=>key(a)===key(h)));
        project[field]=header ? raw[header].trim() : '';
      }
      project[DATE_COLUMN]=canonicalDate(project[DATE_COLUMN]);
      projects.push(project);
    }
  }
  if(!projects.length) throw new Error('Nenhum registro encontrado. A base anterior foi mantida.');
  return {projects,columns};
}
function setMessage(text,error=false) {
  byId('importStatus').textContent=text;
  byId('importStatus').className=error ? 'error' : 'success';
}
function activateBase(base,local=false) {
  const prepared=prepareBase(base);
  ACTIVE_BASE=base;PROJETOS=prepared.projects;RAW_COLUMNS=prepared.columns;
  byId('fBusca').value='';
  Object.entries(FILTERS).forEach(([id,field])=>fillSelect(id,field));
  byId('kTotal').textContent=PROJETOS.length;
  byId('kCoord').textContent=PROJETOS.filter(hasCoordinates).length;
  byId('kPartners').textContent=unique('Parceira').length;
  const dates=unique(DATE_COLUMN).filter(v=>/^\d{2}\/\d{2}\/\d{4}$/.test(v));
  byId('basePeriod').textContent=dates.length ? `${dates[0]} a ${dates[dates.length-1]}` : 'datas não informadas';
  byId('regionSummary').textContent=Object.entries(countBy(PROJETOS,'Região')).map(([r,n])=>`${r} ${n}`).join(' | ');
  byId('baseInfo').textContent=`${local ? 'Base importada neste navegador' : 'Base publicada'}: ${base.filename} • Atualização: ${new Date(base.updatedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})} (Brasília)`;
  byId('tableInfo').textContent=`${PROJETOS.length} registros • ${base.sheets.length} aba(s) • ${RAW_COLUMNS.length} colunas originais.`;
  const original=byId('downloadOriginal');
  original.hidden=local || base.filename !== 'Programacao_15_04_outubro_GitHub.xlsx';
  refresh();
}
function download(blob,filename) {
  const url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function csvEscape(value) {
  let text=String(value ?? '');
  // Impede execução de fórmulas em texto importado; números negativos ficam intactos.
  if(/^[=+@\t\r]/.test(text) || (/^-/.test(text) && !/^-\d+(?:[.,]\d+)?$/.test(text))) text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
function exportCSV(projects,name) {
  const includeSheet=ACTIVE_BASE.sheets.length>1;
  const fields=includeSheet ? ['Aba de origem',...RAW_COLUMNS] : RAW_COLUMNS;
  const rows=[fields.map(csvEscape).join(';'),...projects.map(p=>(includeSheet?[p['Aba de origem'],...RAW_COLUMNS.map(f=>p._raw[f])]:RAW_COLUMNS.map(f=>p._raw[f])).map(csvEscape).join(';'))];
  download(new Blob(['\uFEFF',rows.join('\r\n')],{type:'text/csv;charset=utf-8'}),name);
}
document.addEventListener('DOMContentLoaded',()=>{
  const storageKey='mapa-equipes-importacao-v1';
  const publishedVersion=JSON.stringify(window.BASE_PUBLICADA);
  activateBase(window.BASE_PUBLICADA);
  try {
    const cached=JSON.parse(localStorage.getItem(storageKey) || 'null');
    if(cached?.publishedVersion===publishedVersion) {
      activateBase(cached.base,true);
      setMessage('Base importada restaurada neste navegador. Use “Restaurar base publicada” para consultar a versão do site.');
    } else localStorage.removeItem(storageKey);
  } catch {setMessage('Não foi possível restaurar uma importação anterior. A base publicada está disponível.',true);}
  updateClock();setInterval(updateClock,1000);
  byId('fBusca').addEventListener('input',refresh);
  Object.keys(FILTERS).forEach(id=>byId(id).addEventListener('change',refresh));
  byId('clearFilters').addEventListener('click',()=>{
    byId('fBusca').value='';Object.keys(FILTERS).forEach(id=>byId(id).value='');refresh();
  });
  byId('downloadFiltered').addEventListener('click',()=>exportCSV(getFilteredProjects(),'projetos_filtrados.csv'));
  byId('downloadAll').addEventListener('click',()=>exportCSV(PROJETOS,'projetos_atualizados.csv'));
  byId('downloadData').addEventListener('click',()=>download(new Blob(['window.BASE_PUBLICADA = '+JSON.stringify(ACTIVE_BASE)+';\n'],{type:'text/javascript;charset=utf-8'}),'dados.js'));
  byId('importButton').addEventListener('click',()=>byId('importFile').click());
  byId('importFile').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    byId('importButton').disabled=true;setMessage('Lendo todas as abas e colunas do arquivo…');
    try {
      const base=await BaseImport.readFile(file);
      activateBase(base,true);
      if(originalURL) URL.revokeObjectURL(originalURL);
      originalURL=URL.createObjectURL(file);
      const original=byId('downloadOriginal');original.href=originalURL;original.download=file.name;original.hidden=false;
      let suffix=' A importação fica salva neste navegador.';
      try {localStorage.setItem(storageKey,JSON.stringify({publishedVersion,base}));}
      catch {suffix=' O navegador não permitiu salvar a importação; ela estará disponível apenas nesta sessão.';}
      setMessage(`${PROJETOS.length} registros importados de ${base.sheets.length} aba(s), com ${RAW_COLUMNS.length} colunas.`+suffix);
    } catch(error) {setMessage(error.message || 'Não foi possível ler o arquivo. A base anterior foi mantida.',true);}
    finally {byId('importButton').disabled=false;event.target.value='';}
  });
  byId('restoreBase').addEventListener('click',()=>{
    try {localStorage.removeItem(storageKey);} catch {}
    activateBase(window.BASE_PUBLICADA);
    if(originalURL) URL.revokeObjectURL(originalURL);
    originalURL=null;
    const original=byId('downloadOriginal');original.href='Programacao_15_04_outubro_GitHub.xlsx';original.download='Programacao_15_04_outubro_GitHub.xlsx';
    setMessage('Base publicada restaurada.');
  });
});
