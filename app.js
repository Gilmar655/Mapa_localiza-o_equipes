
const columns = ['Projeto','Tipo de Serviço','Data Prog.','Status','Contrato','OS','Equipamento','Região','Início Prog.','Fim Prog.','Parceira','Latitude','Longitude','Link Google Maps'];
const state = {search:'', parceira:'', data:'', tipo:'', status:'', contrato:''};
const el = id => document.getElementById(id);
function normalize(v){return (v||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function unique(field){return [...new Set(PROJETOS.map(p=>p[field]||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));}
function fillSelect(id, field){
  const select=el(id); unique(field).forEach(v=>{const o=document.createElement('option'); o.value=v; o.textContent=v; select.appendChild(o);});
}
function hasCoord(p){return !!(p.Latitude && p.Longitude);}
function applyFilters(){
  const q=normalize(state.search);
  return PROJETOS.filter(p=>{
    const matchesQ = !q || columns.some(c=>normalize(p[c]).includes(q));
    return matchesQ && (!state.parceira || p.Parceira===state.parceira) && (!state.data || p['Data Prog.']===state.data) && (!state.tipo || p['Tipo de Serviço']===state.tipo) && (!state.status || p.Status===state.status) && (!state.contrato || p.Contrato===state.contrato);
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
        if(hasCoord(p)) td.innerHTML=`<a class="maps-link" href="${p[c]}" target="_blank" rel="noopener">Abrir mapa</a>`;
        else td.innerHTML='<span class="no-coord">Sem coordenadas</span>';
      } else td.textContent=p[c]||'';
      tr.appendChild(td);
    });
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
  const coord = data.filter(hasCoord).length;
  el('summaryText').textContent = `${data.length} registros filtrados • ${coord} com coordenadas • ${data.length - coord} sem coordenadas`;
}
function renderParceiras(){
  const box = el('listaParceiras');
  box.innerHTML='';
  unique('Parceira').forEach(name=>{
    const tag=document.createElement('span');
    tag.className='partner-tag';
    tag.textContent=name;
    box.appendChild(tag);
  });
}
function exportFiltered(){
  const data=applyFilters();
  const rows=[columns.join(';'), ...data.map(p=>columns.map(c=>'"'+String(p[c]||'').replaceAll('"','""')+'"').join(';'))];
  const blob=new Blob([rows.join('
')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='projetos_filtrados.csv'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),300);
}
function refresh(){renderTable(applyFilters());}
window.addEventListener('DOMContentLoaded',()=>{
  fillSelect('fParceira','Parceira');
  fillSelect('fStatus','Status');
  fillSelect('fTipo','Tipo de Serviço');
  fillSelect('fData','Data Prog.');
  fillSelect('fContrato','Contrato');
  renderParceiras();
  ['fParceira','fStatus','fTipo','fData','fContrato'].forEach(id=>el(id).addEventListener('change',e=>{state[id.replace('f','').toLowerCase()]=e.target.value; refresh();}));
  el('fBusca').addEventListener('input',e=>{state.search=e.target.value; refresh();});
  el('btnLimpar').addEventListener('click',()=>{
    Object.keys(state).forEach(k=>state[k]='');
    document.querySelectorAll('select, input[type="search"]').forEach(item=>item.value='');
    refresh();
  });
  el('btnExportar').addEventListener('click', exportFiltered);
  refresh();
});
