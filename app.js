const MY_MAPS_URL = "https://www.google.com/maps/d/edit?hl=pt-BR&mid=10HwNRTu34UfYUParmwc_21swb9OrORy8&ll=-23.491120767237867%2C-46.59948536465595&z=11";
const FILTERS = {
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
  unique(field).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}
function hasCoordinates(project) { return Boolean(project.Latitude && project.Longitude); }
function countBy(projects, field) {
  return projects.reduce((counts, project) => {
    const label = project[field] || "Não informado";
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {});
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
  const body = document.querySelector("#projectTable tbody");
  const fragment = document.createDocumentFragment();
  projects.forEach((project, index) => {
    const row = document.createElement("tr");
    row.appendChild(createCell(String(index + 1)));
    ["Projeto", "Tipo de Serviço", "Data Prog.", "Status", "Intervenção", "PowerON", "Equipamento", "Horário Início", "Horário Fim", "Parceira", "Região", "Latitude", "Longitude"].forEach((field) => row.appendChild(createCell(project[field])));
    row.appendChild(createStatusCell(project));
    row.appendChild(createLinkCell(project["Link Google Maps"], "Abrir Maps", "Sem coordenadas"));
    row.appendChild(createLinkCell(project["Link My Maps"] || MY_MAPS_URL, "My Maps"));
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
    const matchesText = !query || SEARCH_COLUMNS.some((field) => normalize(project[field]).includes(query));
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
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  }).format(new Date());
}
function csvEscape(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function exportFiltered() {
  const projects = getFilteredProjects();
  const rows = [CSV_COLUMNS.map(csvEscape).join(";"), ...projects.map((project) => CSV_COLUMNS.map((field) => csvEscape(project[field])).join(";"))];
  const blob = new Blob(["\uFEFF", rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "projetos_filtrados.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

document.addEventListener("DOMContentLoaded", () => {
  Object.entries(FILTERS).forEach(([id, field]) => fillSelect(id, field));
  byId("kTotal").textContent = String(SITE_META.total);
  byId("kCoord").textContent = String(SITE_META.withCoordinates);
  byId("kPartners").textContent = String(SITE_META.partners);
  updateClock();
  setInterval(updateClock, 1000);
  byId("fBusca").addEventListener("input", refresh);
  Object.keys(FILTERS).forEach((id) => byId(id).addEventListener("change", refresh));
  byId("clearFilters").addEventListener("click", () => {
    byId("fBusca").value = "";
    Object.keys(FILTERS).forEach((id) => { byId(id).value = ""; });
    refresh();
  });
  byId("downloadFiltered").addEventListener("click", exportFiltered);
  refresh();
});
