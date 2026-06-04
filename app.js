
const columns = ['Projeto','Tipo de Serviço','Data Prog.','Status','Contrato','OS','Equipamento','Região','Início Prog.','Fim Prog.','Parceira','Latitude','Longitude','Link Google Maps'];
const state = {search:'', parceira:'', data:'', tipo:'', status:'', contrato:'', regiao:''};
const el = id => document.getElementById(id);
function normalize(v){return (v||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function unique(field){return [...new Set(PROJETOS.map(p=>p[field]||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));}
function fillSelect(id, field){const select=el(id); unique(field).forEach(v=>{const o=document.createElement('option'); o.value=v; o.textContent=v; select.appendChild(o);});}
function hasCoord(p){return p.Latitude && p.Longitude;}
function applyFilters(){
  const q=normalize(state.search);
  return PROJETOS.filter(p=>{
    const matchesQ = !q || columns.some(c=>normalize(p[c]).includes(q));
    return matchesQ && (!state.parceira||p.Parceira===state.parceira) && (!state.data||p['Data Prog.']===state.data) && (!state.tipo||p['Tipo de Serviço']===state.tipo) && (!state.status||p.Status===state.status) && (!state.contrato||p.Contrato===state.contrato) && (!state.regiao||p.Região===state.regiao);
  });
}
function renderTable(data){
  const tbody=el('tbodyProjetos'); tbody.innerHTML='';
  const frag=document.createDocumentFragment();
  data.forEach(p=>{
    const tr=document.createElement('tr');
    columns.forEach(c=>{
      const td=document.createElement('td');
      if(c==='Link Google Maps'){
        if(hasCoord(p)){td.innerHTML=`<a class="maps-link" target="_blank" rel="noopener" href="${p[c]}">Abrir mapa</a>`} else {td.innerHTML='<span class="no-coord">Sem coordenadas</span>'}
      } else {td.textContent=p[c]||'';}
      tr.appendChild(td);
    });
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
  el('totalFiltrado').textContent=data.length;
  el('coordFiltrado').textContent=data.filter(hasCoord).length;
  el('semCoordFiltrado').textContent=data.filter(p=>!hasCoord(p)).length;
}
function countBy(data, field){return data.reduce((acc,p)=>{const k=p[field]||'Não informado'; acc[k]=(acc[k]||0)+1; return acc;},{});}
function renderBars(containerId, counts){
  const box=el(containerId); box.innerHTML='';
  const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const max=Math.max(...entries.map(e=>e[1]),1);
  entries.forEach(([label,value])=>{
    const row=document.createElement('div'); row.className='bar';
    row.innerHTML=`<div class="bar-label" title="${label}">${label}</div><div class="bar-track"><div class="bar-fill" style="width:${(value/max)*100}%"></div></div><div class="bar-value">${value}</div>`;
    box.appendChild(row);
  });
}
function refresh(){const data=applyFilters(); renderTable(data); renderBars('chartParceiras', countBy(data,'Parceira')); renderBars('chartTipos', countBy(data,'Tipo de Serviço'));}
function exportFiltered(){
  const data=applyFilters();
  const rows=[columns.join(';'), ...data.map(p=>columns.map(c=>'"'+String(p[c]||'').replaceAll('"','""')+'"').join(';'))];
  const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='projetos_filtrados.csv'; a.click(); URL.revokeObjectURL(a.href);
}
window.addEventListener('DOMContentLoaded',()=>{
  fillSelect('fParceira','Parceira'); fillSelect('fData','Data Prog.'); fillSelect('fTipo','Tipo de Serviço'); fillSelect('fStatus','Status'); fillSelect('fContrato','Contrato'); fillSelect('fRegiao','Região');
  el('kTotal').textContent=PROJETOS.length; el('kCoord').textContent=PROJETOS.filter(hasCoord).length; el('kSemCoord').textContent=PROJETOS.filter(p=>!hasCoord(p)).length;
  el('kParceiras').textContent=unique('Parceira').length; el('kDatas').textContent=unique('Data Prog.').length;
  ['fParceira','fData','fTipo','fStatus','fContrato','fRegiao'].forEach(id=>el(id).addEventListener('change',e=>{state[id.replace('f','').toLowerCase()]=e.target.value; refresh();}));
  el('fBusca').addEventListener('input',e=>{state.search=e.target.value; refresh();});
  el('btnLimpar').addEventListener('click',()=>{document.querySelectorAll('select,input').forEach(i=>i.value=''); Object.keys(state).forEach(k=>state[k]=''); refresh();});
  el('btnExportar').addEventListener('click', exportFiltered);
  refresh();
});
