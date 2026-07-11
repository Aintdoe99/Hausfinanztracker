const categories=[
"Grundstück & Nebenkosten","Planung & Genehmigungen","Vermessung","Baugrund & Gutachten","Erdarbeiten","Bodenplatte","Rohbau / Holzbau","Dach","Fenster & Türen","Fassade","Elektro / KNX","Heizung","Lüftung","Sanitär","PV & Speicher","Innenausbau","Böden","Malerarbeiten","Küche","Bäder","Carport","Außenanlagen","Baunebenkosten","Versicherungen","Sonstiges"];

const palette={
  green:{name:"Mint",accent:"#2F9D67",soft:"#DFF3E8"},
  purple:{name:"Lavendel",accent:"#7D58C2",soft:"#EEE7FA"},
  yellow:{name:"Gelb",accent:"#C79A00",soft:"#FFF3C8"},
  blue:{name:"Blau",accent:"#3277C8",soft:"#E3EFFB"},
  rose:{name:"Rosé",accent:"#C85E79",soft:"#F9E6EC"},
  teal:{name:"Türkis",accent:"#2B9292",soft:"#DDF3F2"}
};

const defaultState={
  overallBudget:680000,
  colors:{
    "Eigenkapital":"green",
    "KfW":"purple",
    "Banktranche 1":"yellow",
    "Banktranche 2":"blue"
  },
  budgets:{
    "Elektro / KNX":50000,"PV & Speicher":25000,"Rohbau / Holzbau":120000,
    "Heizung":40000,"Carport":30000,"Sonstiges":15000
  },
  expenses:[
    {id:crypto.randomUUID(),category:"Vermessung",title:"Lage- und Höhenplan",company:"Vermessungsbüro Scholz",amount:1207.85,financing:"Eigenkapital",ordered:"2026-03-12",received:"2026-03-20",due:"2026-03-24",paid:"2026-03-24",note:"Rechnung Nr. 2026-045",docs:[]},
    {id:crypto.randomUUID(),category:"Baugrund & Gutachten",title:"Baugrundgutachten",company:"GeoPlan GmbH",amount:1380,financing:"KfW",ordered:"2026-07-02",received:"2026-07-05",due:"2026-08-15",paid:"",note:"",docs:[]},
    {id:crypto.randomUUID(),category:"Erdarbeiten",title:"Erdarbeiten",company:"Bauunternehmen Müller",amount:8750,financing:"Banktranche 1",ordered:"2026-07-10",received:"2026-07-12",due:"2026-07-28",paid:"",note:"",docs:[]},
    {id:crypto.randomUUID(),category:"Fenster & Türen",title:"Fenster",company:"Fensterwelt GmbH",amount:23450,financing:"Banktranche 2",ordered:"2026-07-01",received:"",due:"",paid:"",note:"",docs:[]},
    {id:crypto.randomUUID(),category:"Elektro / KNX",title:"Planung KNX",company:"KNX Planungsbüro",amount:4500,financing:"Eigenkapital",ordered:"2026-07-09",received:"",due:"",paid:"",note:"Angebot liegt vor",docs:[]}
  ]
};

let state=loadState();
let currentFilter="Alle";
let currentFinancing=null;
let editingId=null;
let editingBudgetKey=null;
let draftDocs=[];
let draftExpenseColor=null;

function loadState(){
  try{
    const raw=localStorage.getItem("hausbauCockpitState");
    const parsed=raw?JSON.parse(raw):structuredClone(defaultState);
    parsed.colors={...defaultState.colors,...(parsed.colors||{})};
    return parsed;
  }catch{return structuredClone(defaultState);}
}
function saveState(){localStorage.setItem("hausbauCockpitState",JSON.stringify(state));}
function money(v){return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(v||0));}
function dateDE(v){return v?new Date(v+"T00:00:00").toLocaleDateString("de-DE"):"";}
function statusOf(e){if(e.paid)return"Bezahlt";if(e.received)return"Rechnung offen";if(e.ordered)return"Beauftragt";return"Geplant";}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800);}
function metaFor(fin,override=null){return palette[override||state.colors[fin]||"blue"]||palette.blue;}



const categoryIconTypes={
  "Grundstück & Nebenkosten":"map",
  "Planung & Genehmigungen":"clipboard",
  "Vermessung":"ruler",
  "Baugrund & Gutachten":"flask",
  "Erdarbeiten":"construction",
  "Bodenplatte":"square",
  "Rohbau / Holzbau":"blocks",
  "Dach":"house",
  "Fenster & Türen":"window",
  "Fassade":"layers",
  "Elektro / KNX":"bolt",
  "Heizung":"flame",
  "Lüftung":"wind",
  "Sanitär":"drop",
  "PV & Speicher":"sun",
  "Innenausbau":"hammer",
  "Böden":"grid",
  "Malerarbeiten":"brush",
  "Küche":"pot",
  "Bäder":"bath",
  "Carport":"car",
  "Außenanlagen":"tree",
  "Baunebenkosten":"receipt",
  "Versicherungen":"shield",
  "Sonstiges":"tool"
};

const categorySvgPaths={
  map:'<path d="M9 18 3.5 20.5V6L9 3.5l6 2.5 5.5-2.5V18L15 20.5 9 18Z"/><path d="M9 3.5V18M15 6v14.5"/>',
  clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10h8M8 14h6"/>',
  ruler:'<path d="m4 20 16-16 3 3L7 23H4v-3Z"/><path d="m14 6 4 4M11 9l2 2M8 12l2 2"/>',
  flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 15h8"/>',
  construction:'<path d="M4 18h16M6 18l2-8h8l2 8M9 10V6h6v4M10 14h4"/>',
  square:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8v8H8z"/>',
  blocks:'<rect x="3" y="11" width="8" height="8" rx="1"/><rect x="13" y="11" width="8" height="8" rx="1"/><rect x="8" y="3" width="8" height="8" rx="1"/>',
  house:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  window:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  bolt:'<path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>',
  flame:'<path d="M12 22c4 0 7-3 7-7 0-5-4-8-6-12 0 4-3 5-4 8-2-1-3-3-3-4-2 3-3 5-3 8 0 4 4 7 9 7Z"/>',
  wind:'<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  drop:'<path d="M12 2s7 8 7 13a7 7 0 1 1-14 0c0-5 7-13 7-13Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  hammer:'<path d="m14 5 5 5M12 7l5 5M3 21l10-10 3 3L6 24H3v-3Z"/><path d="m13 3 8 8"/>',
  grid:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  brush:'<path d="m14 4 6 6-9 9H5v-6l9-9Z"/><path d="M4 20c2 0 3-1 3-3"/>',
  pot:'<path d="M5 10h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8Z"/><path d="M3 10h18M9 6c0-2 1-3 3-3s3 1 3 3"/>',
  bath:'<path d="M4 13h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M7 13V6a3 3 0 0 1 6 0M4 20v2M20 20v2"/>',
  car:'<path d="m5 17-1 3M19 17l1 3M3 13l2-6h14l2 6v5H3v-5Z"/><circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/>',
  tree:'<path d="M12 22v-7M8 22h8"/><path d="M12 3 6 11h3l-3 5h12l-3-5h3l-6-8Z"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  tool:'<path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.4 7.2 6.1 4.9a4 4 0 0 0 5 5L4 17v3h3l7.7-7.7a4 4 0 0 0 5-5L17.4 9.6 14 6.2l.7.1Z"/>'
};

function categoryIconSvg(category){
  const type=categoryIconTypes[category]||"tool";
  const paths=categorySvgPaths[type]||categorySvgPaths.tool;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function navTo(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.nav===id));
  const t={overview:["Hausbau","Übersicht"],expenses:["Ausgaben","Alle Vorgänge"],budget:["Budget","Gewerke"],documents:["Dokumente","PDF-Ablage"],more:["Mehr","Einstellungen & Export"]};
  document.getElementById("pageTitle").textContent=t[id][0];
  document.getElementById("pageSub").textContent=t[id][1];
  
}
function totalsByFinance(){
  const out={"Eigenkapital":0,"KfW":0,"Banktranche 1":0,"Banktranche 2":0};
  state.expenses.forEach(e=>out[e.financing]=(out[e.financing]||0)+Number(e.amount||0));
  return out;
}
function showExpenses(filter="Alle",financing=null){
  currentFilter=filter;currentFinancing=financing;
  document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("active",c.dataset.filter===filter));
  navTo("expenses");renderExpenseList();
}
function render(){
  saveState();
  const total=state.expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const pct=state.overallBudget?Math.min(100,total/state.overallBudget*100):0;
  totalSpent.textContent=money(total);overallBudgetText.textContent=money(state.overallBudget);
  overallPctSmall.textContent=Math.round(pct)+" %";overallBar.style.width=pct+"%";

  const by=totalsByFinance();
  financeGrid.innerHTML=Object.keys(by).map(k=>{
    const m=metaFor(k);
    return `<div class="finance-card" data-financing="${k}" style="--accent:${m.accent};--soft:${m.soft}">
      <div class="finance-top"><div class="bubble">●</div><div class="finance-label">${k}</div></div>
      <div class="finance-value">${money(by[k])}</div><div class="finance-caption">verbraucht</div>
    </div>`;
  }).join("");
  document.querySelectorAll(".finance-card").forEach(c=>c.onclick=()=>showExpenses("Alle",c.dataset.financing));

  const open=state.expenses.filter(e=>statusOf(e)==="Rechnung offen").reduce((s,e)=>s+Number(e.amount||0),0);
  openAmount.textContent=money(open);

  const recent=[...state.expenses].slice(-4).reverse();
  recentExpenses.innerHTML=recent.length?recent.map(summaryRow).join(""):`<div class="empty">Noch keine Ausgaben</div>`;

  renderExpenseList();renderBudgets();renderDocuments();renderColorSettings();if(window.lucide)lucide.createIcons();
}
function summaryRow(e){
  const m=metaFor(e.financing,e.color);
  return `<div class="summary-row" onclick="openExpense('${e.id}')">
    <div class="summary-left"><span class="dot" style="--c:${m.accent}"></span>
      <div><div class="summary-name">${escapeHtml(e.title)}</div><div class="summary-sub">${statusOf(e)}</div></div></div>
    <div class="summary-value">${money(e.amount)}</div>
  </div>`;
}
function renderExpenseList(){
  const list=state.expenses.filter(e=>(currentFilter==="Alle"||statusOf(e)===currentFilter)&&(!currentFinancing||e.financing===currentFinancing));
  expenseList.innerHTML=list.length?list.map(e=>{
    const m=metaFor(e.financing,e.color);const st=statusOf(e);
    const dateText=st==="Bezahlt"?"Bezahlt am "+dateDE(e.paid):st==="Rechnung offen"?"fällig "+dateDE(e.due):st==="Beauftragt"?"Beauftragt am "+dateDE(e.ordered):"Geplant";
    return `<div class="card expense-card" onclick="openExpense('${e.id}')">
      <div class="expense-icon" style="--accent:${m.accent};--soft:${m.soft}" title="${escapeHtml(e.category)}">${categoryIconSvg(e.category)}</div>
      <div class="expense-main">
        <div class="expense-head"><div class="expense-title">${escapeHtml(e.title)}</div><div class="expense-amount">${money(e.amount)}</div></div>
        <div class="expense-meta">${escapeHtml(e.company||e.category)}</div>
        <div class="expense-foot"><span class="status">${dateText}</span><span class="badge" style="--accent:${m.accent};--soft:${m.soft}">${e.financing}</span></div>
      </div>
    </div>`;
  }).join(""):`<div class="card empty">Keine passenden Ausgaben</div>`;
}
function renderBudgets(){
  budgetList.innerHTML=Object.entries(state.budgets).map(([cat,budget])=>{
    const spent=state.expenses.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.amount||0),0);
    const pct=budget?Math.min(100,spent/budget*100):0;
    const accent="#3277C8";
    return `<button type="button" class="budget-row budget-row-button" data-budget-key="${encodeURIComponent(cat)}" style="--accent:${accent};--pct:${pct}%">
      <div class="budget-head"><div><div class="budget-title">${escapeHtml(cat)}</div><div class="budget-sub">${money(spent)} von ${money(budget)}</div></div><b>${Math.round(pct)} %</b></div>
      <div class="budget-bar"><span></span></div>
    </button>`;
  }).join("")||`<div class="empty">Noch keine Budgets erfasst</div>`;

  budgetList.querySelectorAll("[data-budget-key]").forEach(row=>{
    row.addEventListener("click",()=>openBudgetEditor(decodeURIComponent(row.dataset.budgetKey)));
  });
}
function renderDocuments(){
  const items=[];
  state.expenses.forEach(e=>(e.docs||[]).forEach(d=>items.push({e,d})));
  documentOverview.innerHTML=items.length?items.map(({e,d})=>`
    <div class="summary-row">
      <div class="summary-left"><div class="bubble" style="--accent:#df3c45;--soft:#fdebed">PDF</div>
      <div><div class="summary-name">${escapeHtml(d.name)}</div><div class="summary-sub">${escapeHtml(e.title)}</div></div></div>
      <button class="mini" onclick="event.stopPropagation();openStoredDoc('${d.id}')">Öffnen</button>
    </div>`).join(""):`<div class="empty">Noch keine PDFs hinterlegt</div>`;
}
function renderColorSettings(){
  const fins=["Eigenkapital","KfW","Banktranche 1","Banktranche 2"];
  colorSettings.innerHTML=fins.map(fin=>`
    <div class="color-setting">
      <div><b>${fin}</b></div>
      <div class="swatches">${Object.entries(palette).map(([key,m])=>`
        <button class="swatch ${state.colors[fin]===key?"active":""}" title="${m.name}"
          style="background:${m.soft};border-color:${m.accent}" onclick="setFinanceColor('${fin}','${key}')"></button>`).join("")}
      </div>
    </div>`).join("");
}
function setFinanceColor(fin,key){state.colors[fin]=key;render();toast("Farbe gespeichert");}


function renderExpenseColorPicker(){
  const manualColors=["purple","yellow","blue","rose","teal"];
  expenseColorNote.textContent=draftExpenseColor
    ? `Individuell: ${palette[draftExpenseColor]?.name||""}`
    : `Automatisch: ${palette[state.colors[fFinancing.value]]?.name||""}`;
  expenseColorSwatches.innerHTML=`
    <button type="button"
      class="expense-color-choice auto ${draftExpenseColor===null?"active":""}"
      title="Automatisch nach Finanzierung"
      aria-label="Automatisch nach Finanzierung"
      onclick="setExpenseColor(null)"></button>
    ${manualColors.map(key=>{
      const m=palette[key];
      return `<button type="button"
        class="expense-color-choice ${draftExpenseColor===key?"active":""}"
        title="${m.name}" aria-label="${m.name}"
        style="background:${m.soft};border-color:${m.accent}"
        onclick="setExpenseColor('${key}')"></button>`;
    }).join("")}
  `;
}
function setExpenseColor(key){
  draftExpenseColor=key;
  renderExpenseColorPicker();
}

function openExpense(id=null){
  editingId=id;const e=id?state.expenses.find(x=>x.id===id):null;
  const head=document.querySelector("#expenseModal .premium-head");
  head.classList.toggle("mode-edit",!!e);
  head.classList.toggle("mode-new",!e);
  modalTitle.textContent=e?"Ausgabe bearbeiten":"Neue Ausgabe";
  deleteExpense.style.display=e?"inline-block":"none";
  fCategory.value=e?.category||categories[0];fTitle.value=e?.title||"";fCompany.value=e?.company||"";
  fAmount.value=e?.amount||"";fFinancing.value=e?.financing||"Eigenkapital";fOrdered.value=e?.ordered||"";
  fReceived.value=e?.received||"";fDue.value=e?.due||"";fPaid.value=e?.paid||"";fNote.value=e?.note||"";noteCount.textContent=fNote.value.length;
  draftDocs=structuredClone(e?.docs||[]);draftExpenseColor=e?.color||null;renderExpenseColorPicker();renderDraftDocs();expenseModal.classList.add("open");if(window.lucide)lucide.createIcons();
}
function closeExpense(){expenseModal.classList.remove("open");}
async function saveExpenseRecord(){
  const title=fTitle.value.trim();if(!title){toast("Bitte eine Bezeichnung eingeben");return;}
  const obj={id:editingId||crypto.randomUUID(),category:fCategory.value,title,company:fCompany.value.trim(),amount:Number(fAmount.value||0),financing:fFinancing.value,ordered:fOrdered.value,received:fReceived.value,due:fDue.value,paid:fPaid.value,note:fNote.value.trim(),color:draftExpenseColor,docs:draftDocs};
  if(editingId){const i=state.expenses.findIndex(x=>x.id===editingId);state.expenses[i]=obj;}else state.expenses.push(obj);
  closeExpense();render();if(window.lucide)lucide.createIcons();toast("Gespeichert");
}
async function deleteExpenseItem(){
  if(!editingId)return;const e=state.expenses.find(x=>x.id===editingId);if(!e)return;
  if(!confirm(`Ausgabe "${e.title}" wirklich löschen?`))return;
  for(const d of e.docs||[])await deleteDocument(d.id);
  state.expenses=state.expenses.filter(x=>x.id!==editingId);closeExpense();render();toast("Ausgabe gelöscht");
}

function renderDraftDocs(){
  draftDocsEl.innerHTML=draftDocs.length?draftDocs.map(d=>`
    <div class="doc-row"><div class="doc-name">📄 ${escapeHtml(d.name)} · ${(d.size/1024/1024).toFixed(1).replace(".",",")} MB</div>
    <div class="doc-actions"><button class="mini" onclick="openStoredDoc('${d.id}')">Öffnen</button><button class="mini" onclick="removeDraftDoc('${d.id}')">Löschen</button></div></div>`).join(""):`<div class="empty">Noch keine PDF hinterlegt</div>`;
}
async function addPdfs(files){
  for(const file of files){
    if(file.type!=="application/pdf")continue;
    const id=crypto.randomUUID();
    await putDocument({id,name:file.name,type:file.type,size:file.size,blob:file,createdAt:new Date().toISOString()});
    draftDocs.push({id,name:file.name,size:file.size,type:file.type});
  }
  renderDraftDocs();toast("PDF hinzugefügt");
}
async function removeDraftDoc(id){draftDocs=draftDocs.filter(d=>d.id!==id);await deleteDocument(id);renderDraftDocs();}
async function openStoredDoc(id){
  const rec=await getDocument(id);if(!rec){toast("Dokument nicht gefunden");return;}
  const url=URL.createObjectURL(rec.blob);window.open(url,"_blank");setTimeout(()=>URL.revokeObjectURL(url),60000);
}

function openBudgetEditor(category=null){
  editingBudgetKey=category;budgetModalTitle.textContent=category?"Budget bearbeiten":"Budget hinzufügen";
  bCategory.value=category||"";bAmount.value=category?(state.budgets[category]||""):"";
  deleteBudget.style.display=category?"inline-block":"none";budgetModal.classList.add("open");
}
function closeBudgetEditor(){budgetModal.classList.remove("open");}
function saveBudgetItem(){
  const category=bCategory.value.trim();const amount=Number(bAmount.value||0);
  if(!category){toast("Bitte einen Budgetposten eingeben");return;}
  if(editingBudgetKey&&editingBudgetKey!==category)delete state.budgets[editingBudgetKey];
  state.budgets[category]=amount;closeBudgetEditor();render();toast("Budget gespeichert");
}
function deleteBudgetItem(){
  if(!editingBudgetKey)return;if(!confirm(`Budgetposten "${editingBudgetKey}" wirklich löschen?`))return;
  delete state.budgets[editingBudgetKey];closeBudgetEditor();render();toast("Budgetposten gelöscht");
}

async function exportBackup(){
  const docs=await getAllDocuments();
  const docsExport={};
  for(const d of docs)docsExport[d.id]={...d,blob:await blobToDataUrl(d.blob)};
  const backup={version:2,exportedAt:new Date().toISOString(),state,docs:docsExport};
  const blob=new Blob([JSON.stringify(backup)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Hausbau-Backup_"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(a.href);
}
async function importBackup(file){
  const backup=JSON.parse(await file.text());if(!backup.state)throw new Error("Ungültige Datei");
  state=backup.state;await clearDocuments();
  for(const [id,d] of Object.entries(backup.docs||{})){
    const blob=typeof d.blob==="string"?dataUrlToBlob(d.blob):d.blob;
    await putDocument({...d,id,blob});
  }
  render();toast("Backup importiert");
}

fCategory.innerHTML=categories.map(c=>`<option>${c}</option>`).join("");
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.nav)));
settingsBtn.onclick=()=>navTo("more");
document.getElementById("inlineAddExpense").addEventListener("click",()=>openExpense());
document.getElementById("cancelExpense").addEventListener("click",closeExpense);
document.getElementById("saveExpense").addEventListener("click",saveExpenseRecord);
document.getElementById("deleteExpense").addEventListener("click",deleteExpenseItem);
expenseModal.addEventListener("click",e=>{if(e.target.id==="expenseModal")closeExpense();});
document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");currentFilter=c.dataset.filter;currentFinancing=null;renderExpenseList();});
openInvoicesCard.onclick=()=>showExpenses("Rechnung offen");openInvoicesCard.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();showExpenses("Rechnung offen");}};
fFinancing.addEventListener("change",()=>{if(draftExpenseColor===null)renderExpenseColorPicker();});
fNote.addEventListener("input",()=>noteCount.textContent=fNote.value.length);
addPdfBtn.onclick=()=>pdfInput.click();pdfInput.onchange=e=>addPdfs([...e.target.files]);
addBudgetBtn.onclick=()=>openBudgetEditor();cancelBudget.onclick=closeBudgetEditor;saveBudget.onclick=saveBudgetItem;deleteBudget.onclick=deleteBudgetItem;
budgetModal.addEventListener("click",e=>{if(e.target.id==="budgetModal")closeBudgetEditor();});
editBudgetBtn.onclick=()=>{const v=prompt("Gesamtbudget in Euro",state.overallBudget);if(v!==null&&!isNaN(Number(v))){state.overallBudget=Number(v);render();}};
exportBtn.onclick=exportBackup;importBtn.onclick=()=>importFile.click();importFile.onchange=async e=>{try{await importBackup(e.target.files[0]);}catch{toast("Import fehlgeschlagen");}};
resetBtn.onclick=async()=>{if(confirm("Testdaten wirklich zurücksetzen?")){state=structuredClone(defaultState);await clearDocuments();render();toast("Zurückgesetzt");}};
window.openExpense=openExpense;window.openStoredDoc=openStoredDoc;window.removeDraftDoc=removeDraftDoc;window.openBudgetEditor=openBudgetEditor;window.setFinanceColor=setFinanceColor;window.setExpenseColor=setExpenseColor;

const draftDocsEl=document.getElementById("draftDocs");
render();
if(window.lucide)lucide.createIcons();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
