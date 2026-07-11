const defaultState={
  overallBudget:680000,
  colors:{
    "Eigenkapital":"green",
    "KfW":"purple",
    "Banktranche 1":"yellow",
    "Banktranche 2":"blue"
  },
  categoryColors:{
    "Grundstück & Nebenkosten":"teal",
    "Planung & Genehmigungen":"purple",
    "Vermessung":"green",
    "Baugrund & Gutachten":"purple",
    "Erdarbeiten":"yellow",
    "Bodenplatte":"blue",
    "Rohbau / Holzbau":"rose",
    "Dach":"red",
    "Fenster & Türen":"blue",
    "Fassade":"yellow",
    "Elektro / KNX":"teal",
    "Heizung":"red",
    "Lüftung":"teal",
    "Sanitär":"blue",
    "PV & Speicher":"yellow",
    "Innenausbau":"rose",
    "Böden":"teal",
    "Malerarbeiten":"purple",
    "Küche":"rose",
    "Bäder":"blue",
    "Carport":"blue",
    "Außenanlagen":"green",
    "Baunebenkosten":"teal",
    "Versicherungen":"purple",
    "Sonstiges":"teal"
  },
  categories:[...categories],
  categoryIcons:{...categoryIconTypes},
  budgets:{
    "Elektro / KNX":50000,"PV & Speicher":25000,"Rohbau / Holzbau":120000,
    "Heizung":40000,"Carport":30000,"Sonstiges":15000
  },
  companies:[],
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
let editingCompanyId=null;
let companyReturnToExpense=false;
let editingCategoryName=null;


function normalizeCompanyName(value=""){
  return String(value).trim().replace(/\s+/g," ");
}

function ensureCompaniesFromExpenses(targetState){
  targetState.companies=Array.isArray(targetState.companies)?targetState.companies:[];
  const byKey=new Map(
    targetState.companies.map(company=>[
      `${company.category}::${normalizeCompanyName(company.name).toLowerCase()}`,
      company
    ])
  );

  (targetState.expenses||[]).forEach(expense=>{
    const name=normalizeCompanyName(expense.company);
    if(!name)return;
    const category=expense.category||activeCategories()[0];
    const key=`${category}::${name.toLowerCase()}`;
    let company=byKey.get(key);
    if(!company){
      company={id:crypto.randomUUID(),name,category,contactPerson:"",phone:"",email:""};
      targetState.companies.push(company);
      byKey.set(key,company);
    }
    expense.companyId=expense.companyId||company.id;
    expense.company=company.name;
  });

  return targetState;
}

function companyById(id){
  return state.companies.find(company=>company.id===id)||null;
}

function companiesForCategory(category){
  return state.companies
    .filter(company=>company.category===category)
    .sort((a,b)=>a.name.localeCompare(b.name,"de"));
}

function loadState(){
  try{
    const raw=localStorage.getItem("hausbauCockpitState");
    const parsed=raw?JSON.parse(raw):structuredClone(defaultState);
    parsed.colors={...defaultState.colors,...(parsed.colors||{})};
    parsed.categoryColors={...defaultState.categoryColors,...(parsed.categoryColors||{})};
    parsed.categories=Array.isArray(parsed.categories)&&parsed.categories.length?parsed.categories:[...defaultState.categories];
    parsed.categoryIcons={...defaultState.categoryIcons,...(parsed.categoryIcons||{})};
    parsed.companies=Array.isArray(parsed.companies)?parsed.companies:[];
    parsed.companies=parsed.companies.map(company=>({
      ...company,
      contactPerson:company.contactPerson||company.contact||"",
      phone:company.phone||"",
      email:company.email||""
    }));
    return ensureCompaniesFromExpenses(parsed);
  }catch{return ensureCompaniesFromExpenses(structuredClone(defaultState));}
}
function saveState(){localStorage.setItem("hausbauCockpitState",JSON.stringify(state));}
function money(v){return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(v||0));}
function dateDE(v){return v?new Date(v+"T00:00:00").toLocaleDateString("de-DE"):"";}
function isPaidExpense(e){
  return Boolean(e && e.paid);
}
function statusOf(e){if(isPaidExpense(e))return"Bezahlt";if(e.received)return"Rechnung offen";if(e.ordered)return"Beauftragt";return"Geplant";}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800);}
function metaFor(fin,override=null,category=null){
  const key=override || (category ? state.categoryColors?.[category] : null) || state.colors[fin] || "blue";
  return palette[key]||palette.blue;
}




function activeCategories(){
  return state.categories||categories;
}

function refreshCategorySelects(){
  const values=activeCategories();
  const fill=(select,current="")=>{
    if(!select)return;
    select.innerHTML=values.map(category=>`<option>${escapeHtml(category)}</option>`).join("");
    if(current&&values.includes(current))select.value=current;
  };
  fill(fCategory,fCategory.value);
  fill(cCategory,cCategory.value);
  fill(bCategory,bCategory.value);
}

function syncCategoryRename(oldName,newName){
  if(oldName===newName)return;
  state.expenses.forEach(expense=>{if(expense.category===oldName)expense.category=newName;});
  state.companies.forEach(company=>{if(company.category===oldName)company.category=newName;});

  if(Object.prototype.hasOwnProperty.call(state.budgets,oldName)){
    const oldBudget=state.budgets[oldName];
    delete state.budgets[oldName];
    state.budgets[newName]=oldBudget;
  }
  if(Object.prototype.hasOwnProperty.call(state.categoryColors,oldName)){
    state.categoryColors[newName]=state.categoryColors[oldName];
    delete state.categoryColors[oldName];
  }
  if(Object.prototype.hasOwnProperty.call(state.categoryIcons,oldName)){
    state.categoryIcons[newName]=state.categoryIcons[oldName];
    delete state.categoryIcons[oldName];
  }
}

function renderCategoryList(){
  const values=[...activeCategories()].sort((a,b)=>a.localeCompare(b,"de"));
  categoryCount.textContent=values.length;
  categoryList.innerHTML=values.map(category=>{
    const meta=categoryMeta(category);
    return `<button type="button" class="company-list-item" data-category-name="${encodeURIComponent(category)}" style="--accent:${meta.accent};--soft:${meta.soft}">
      <span class="company-list-icon">${categoryIconSvg(category)}</span>
      <span class="company-list-copy">
        <strong>${escapeHtml(category)}</strong>
        <small>${money(state.budgets[category]||0)} Budget · ${state.companies.filter(company=>company.category===category).length} Firmen</small>
      </span>
      <span class="company-list-chevron" data-lucide="chevron-right"></span>
    </button>`;
  }).join("")||`<div class="empty">Noch keine Gewerke gespeichert</div>`;

  categoryList.querySelectorAll("[data-category-name]").forEach(button=>{
    button.addEventListener("click",()=>editCategory(decodeURIComponent(button.dataset.categoryName)));
  });
  if(window.lucide)lucide.createIcons();
}

function updateCategoryPreview(){
  const colorKey=gColor?.value||"teal";
  const meta=palette[colorKey]||palette.teal;
  gIconPreview.style.setProperty("--accent",meta.accent);
  gIconPreview.style.setProperty("--soft",meta.soft);
  gIconPreview.innerHTML=categoryIconSvg(gName.value||editingCategoryName||"",gIcon.value||"tool");
}

function clearCategoryForm(){
  editingCategoryName=null;
  categoryModalTitle.textContent="Neues Gewerk";
  gName.value="";
  gIcon.value="tool";
  gColor.value="teal";
  updateCategoryPreview();
  deleteCategory.style.display="none";
}

function editCategory(name){
  editingCategoryName=name;
  categoryModalTitle.textContent="Gewerk bearbeiten";
  gName.value=name;
  gIcon.value=state.categoryIcons[name]||categoryIconTypes[name]||"tool";
  gColor.value=state.categoryColors[name]||"teal";
  updateCategoryPreview();
  deleteCategory.style.display="inline-flex";
}

function openCategoryManager(){
  clearCategoryForm();
  renderCategoryList();
  categoryModal.classList.add("open");
  requestAnimationFrame(renderCategoryList);
}

function closeCategoryManager(){
  categoryModal.classList.remove("open");
}

function saveCategoryItem(){
  const name=normalizeCompanyName(gName.value);
  if(!name){toast("Bitte eine Bezeichnung eingeben");return;}

  const duplicate=activeCategories().some(category=>
    category!==editingCategoryName&&category.toLowerCase()===name.toLowerCase()
  );
  if(duplicate){toast("Dieses Gewerk gibt es bereits");return;}

  if(editingCategoryName){
    const index=state.categories.indexOf(editingCategoryName);
    if(index>=0)state.categories[index]=name;
    syncCategoryRename(editingCategoryName,name);
  }else{
    state.categories.push(name);
  }

  state.categoryIcons[name]=gIcon.value;
  state.categoryColors[name]=gColor.value;

  // Alte individuelle Ausgabenfarben dieses Gewerks entfernen,
  // damit künftig immer die zentrale Gewerksfarbe gilt.
  state.expenses.forEach(expense=>{
    if(expense.category===name) expense.color=null;
  });

  editingCategoryName=name;
  saveState();

  refreshCategorySelects();
  render();
  renderCategoryList();
  editCategory(name);
  updateCategoryPreview();
  toast("Gewerk gespeichert");
}

function deleteCategoryItem(){
  if(!editingCategoryName)return;
  const usedByExpense=state.expenses.some(expense=>expense.category===editingCategoryName);
  const usedByCompany=state.companies.some(company=>company.category===editingCategoryName);
  const hasBudget=Object.prototype.hasOwnProperty.call(state.budgets,editingCategoryName);

  if(usedByExpense||usedByCompany||hasBudget){
    toast("Gewerk ist noch in Ausgaben, Firmen oder Budget verwendet");
    return;
  }
  if(!confirm(`Gewerk "${editingCategoryName}" wirklich löschen?`))return;

  state.categories=state.categories.filter(category=>category!==editingCategoryName);
  delete state.categoryColors[editingCategoryName];
  delete state.categoryIcons[editingCategoryName];

  saveState();
  clearCategoryForm();
  refreshCategorySelects();
  renderCategoryList();
  render();
  toast("Gewerk gelöscht");
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
  state.expenses
    .filter(isPaidExpense)
    .forEach(e=>out[e.financing]=(out[e.financing]||0)+Number(e.amount||0));
  return out;
}
function showExpenses(filter="Alle",financing=null){
  currentFilter=filter;currentFinancing=financing;
  document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("active",c.dataset.filter===filter));
  navTo("expenses");renderExpenseList();
}
function render(){
  saveState();
  const total=state.expenses.filter(isPaidExpense).reduce((s,e)=>s+Number(e.amount||0),0);
  const pct=state.overallBudget?Math.min(100,total/state.overallBudget*100):0;
  totalSpent.textContent=money(total);overallBudgetText.textContent=money(state.overallBudget);
  overallPctSmall.textContent=Math.round(pct)+" %";overallBar.style.width=pct+"%";

  const by=totalsByFinance();
  financeGrid.innerHTML=Object.keys(by).map(k=>{
    const m=metaFor(k);
    return `<div class="finance-card" data-financing="${k}" style="--accent:${m.accent};--soft:${m.soft}">
      <div class="finance-top"><div class="bubble">${financeIconSvg(k)}</div><div class="finance-label">${k}</div></div>
      <div class="finance-value">${money(by[k])}</div><div class="finance-caption">verbraucht</div>
    </div>`;
  }).join("");
  document.querySelectorAll(".finance-card").forEach(c=>c.onclick=()=>showExpenses("Alle",c.dataset.financing));

  const open=state.expenses.filter(e=>statusOf(e)==="Rechnung offen").reduce((s,e)=>s+Number(e.amount||0),0);
  openAmount.textContent=money(open);

  const recent=[...state.expenses].slice(-4).reverse();
  recentExpenses.innerHTML=recent.length?recent.map(summaryRow).join(""):`<div class="empty">Noch keine Ausgaben</div>`;

  renderExpenseList();renderBudgets();renderDocuments();renderColorSettings();renderCompanyList();renderCategoryList();if(window.lucide)lucide.createIcons();
}
function summaryRow(e){
  const m=metaFor(e.financing,e.color,e.category);
  return `<div class="summary-row" onclick="openExpense('${e.id}')">
    <div class="summary-left">
      <span class="summary-category-icon" style="--accent:${m.accent};--soft:${m.soft}" title="${escapeHtml(e.category)}">${categoryIconSvg(e.category)}</span>
      <div><div class="summary-name">${escapeHtml(e.title)}</div><div class="summary-sub">${statusOf(e)}</div></div>
    </div>
    <div class="summary-value">${money(e.amount)}</div>
  </div>`;
}
function renderExpenseList(){
  const list=state.expenses.filter(e=>(currentFilter==="Alle"||statusOf(e)===currentFilter)&&(!currentFinancing||e.financing===currentFinancing));
  expenseList.innerHTML=list.length?list.map(e=>{
    const m=metaFor(e.financing,e.color,e.category);const st=statusOf(e);
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
    const m=categoryMeta(cat);
    return `<button type="button" class="budget-row budget-row-button budget-row-with-icon" data-budget-key="${encodeURIComponent(cat)}" style="--accent:${m.accent};--soft:${m.soft};--pct:${pct}%">
      <div class="budget-category-icon" title="${escapeHtml(cat)}">${categoryIconSvg(cat)}</div>
      <div class="budget-content">
        <div class="budget-head">
          <div>
            <div class="budget-title">${escapeHtml(cat)}</div>
            <div class="budget-sub">${money(spent)} von ${money(budget)}</div>
          </div>
          <b>${Math.round(pct)} %</b>
        </div>
        <div class="budget-bar"><span></span></div>
      </div>
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
  const manualColors=expenseColorOrder;
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
  const category=fCategory.value;
  if(key && category){
    state.categoryColors[category]=key;
    state.expenses.forEach(expense=>{
      if(expense.category===category) expense.color=null;
    });
  }
  renderExpenseColorPicker();
  render();
}


function updateCategoryFieldIcon(){
  const icon=document.getElementById("fCategoryIcon");
  const select=document.getElementById("fCategory");
  if(!icon||!select)return;

  const category=select.value||activeCategories()[0];
  const m=categoryMeta(category);
  const type=categoryIconTypes[category]||"tool";
  const paths=categorySvgPaths[type]||categorySvgPaths.tool;

  icon.style.setProperty("--category-accent",m.accent);
  icon.style.setProperty("--category-soft",m.soft);

  const template=document.createElement("template");
  template.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"
    fill="none" stroke="${m.accent}" stroke-width="1.9"
    stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  icon.replaceChildren(template.content.cloneNode(true));
}


function renderCompanyOptions(selectedId=""){
  const category=fCategory.value||activeCategories()[0];
  const companies=companiesForCategory(category);
  fCompany.innerHTML=`<option value="">Keine Firma ausgewählt</option>`+
    companies.map(company=>`<option value="${company.id}">${escapeHtml(company.name)}</option>`).join("");
  if(selectedId && companies.some(company=>company.id===selectedId)) fCompany.value=selectedId;
  else fCompany.value="";
  updateCompanyContactHint();
}

function updateCompanyContactHint(){
  const company=companyById(fCompany.value);
  const parts=[company?.contactPerson,company?.phone,company?.email].filter(Boolean);
  companyContactHint.textContent=parts.join(" · ");
  companyContactHint.classList.toggle("visible",parts.length>0);
}

function renderCompanyList(){
  const companies=[...state.companies].sort((a,b)=>
    a.category.localeCompare(b.category,"de")||a.name.localeCompare(b.name,"de")
  );
  companyCount.textContent=companies.length;
  companyList.innerHTML=companies.length?companies.map(company=>{
    const meta=categoryMeta(company.category);
    return `<button type="button" class="company-list-item" data-company-id="${company.id}" style="--accent:${meta.accent};--soft:${meta.soft}">
      <span class="company-list-icon">${categoryIconSvg(company.category)}</span>
      <span class="company-list-copy">
        <strong>${escapeHtml(company.name)}</strong>
        <small>${escapeHtml(company.category)}${company.contactPerson?` · ${escapeHtml(company.contactPerson)}`:""}${company.phone?` · ${escapeHtml(company.phone)}`:""}${company.email?` · ${escapeHtml(company.email)}`:""}</small>
      </span>
      <span class="company-list-chevron" data-lucide="chevron-right"></span>
    </button>`;
  }).join(""):`<div class="empty">Noch keine Firmen gespeichert</div>`;

  companyList.querySelectorAll("[data-company-id]").forEach(button=>{
    button.addEventListener("click",()=>editCompany(button.dataset.companyId));
  });
  if(window.lucide)lucide.createIcons();
}

function clearCompanyForm(category=null){
  editingCompanyId=null;
  companyModalTitle.textContent="Neue Firma";
  cName.value="";
  cCategory.value=category||fCategory.value||activeCategories()[0];
  cContactPerson.value="";
  cPhone.value="";
  cEmail.value="";
  deleteCompany.style.display="none";
}

function editCompany(id){
  const company=companyById(id);
  if(!company)return;
  editingCompanyId=id;
  companyModalTitle.textContent="Firma bearbeiten";
  cName.value=company.name;
  cCategory.value=company.category;
  cContactPerson.value=company.contactPerson||company.contact||"";
  cPhone.value=company.phone||"";
  cEmail.value=company.email||"";
  deleteCompany.style.display="inline-flex";
}

function openCompanyManager({category=null,returnToExpense=false}={}){
  companyReturnToExpense=returnToExpense;
  clearCompanyForm(category);
  renderCompanyList();
  companyModal.classList.add("open");
}

function closeCompanyManager(){
  companyModal.classList.remove("open");
  companyReturnToExpense=false;
}

function saveCompanyItem(){
  const name=normalizeCompanyName(cName.value);
  const category=cCategory.value;
  const contactPerson=cContactPerson.value.trim();
  const phone=cPhone.value.trim();
  const email=cEmail.value.trim();
  if(!name){toast("Bitte einen Firmennamen eingeben");return;}
  if(!category){toast("Bitte ein Gewerk auswählen");return;}

  const duplicate=state.companies.find(company=>
    company.id!==editingCompanyId &&
    company.category===category &&
    normalizeCompanyName(company.name).toLowerCase()===name.toLowerCase()
  );
  if(duplicate){toast("Diese Firma ist für das Gewerk bereits gespeichert");return;}

  let company;
  if(editingCompanyId){
    company=companyById(editingCompanyId);
    if(!company)return;
    company.name=name;
    company.category=category;
    company.contactPerson=contactPerson;
    company.phone=phone;
    company.email=email;
    delete company.contact;
    state.expenses.forEach(expense=>{
      if(expense.companyId===company.id){
        expense.company=company.name;
        expense.category=company.category;
      }
    });
  }else{
    company={id:crypto.randomUUID(),name,category,contactPerson,phone,email};
    state.companies.push(company);
  }

  saveState();
  renderCompanyList();
  renderCompanyOptions(companyReturnToExpense?company.id:fCompany.value);
  render();

  if(companyReturnToExpense){
    fCategory.value=company.category;
    updateCategoryFieldIcon();
    renderCompanyOptions(company.id);
    companyModal.classList.remove("open");
    companyReturnToExpense=false;
  }else{
    editCompany(company.id);
  }
  toast("Firma gespeichert");
}

function deleteCompanyItem(){
  if(!editingCompanyId)return;
  const company=companyById(editingCompanyId);
  if(!company)return;
  if(!confirm(`Firma "${company.name}" wirklich löschen?`))return;

  state.companies=state.companies.filter(item=>item.id!==editingCompanyId);
  state.expenses.forEach(expense=>{
    if(expense.companyId===editingCompanyId) expense.companyId="";
  });

  saveState();
  clearCompanyForm();
  renderCompanyList();
  renderCompanyOptions();
  render();
  toast("Firma gelöscht");
}

function openExpense(id=null){
  editingId=id;const e=id?state.expenses.find(x=>x.id===id):null;
  const head=document.querySelector("#expenseModal .premium-head");
  head.classList.toggle("mode-edit",!!e);
  head.classList.toggle("mode-new",!e);
  modalTitle.textContent=e?"Ausgabe bearbeiten":"Neue Ausgabe";
  deleteExpense.style.display=e?"inline-block":"none";
  fCategory.value=e?.category||activeCategories()[0];updateCategoryFieldIcon();fTitle.value=e?.title||"";
  const matchedCompanyId=e?.companyId||state.companies.find(company=>
    company.category===fCategory.value &&
    normalizeCompanyName(company.name).toLowerCase()===normalizeCompanyName(e?.company||"").toLowerCase()
  )?.id||"";
  renderCompanyOptions(matchedCompanyId);
  fAmount.value=e?.amount||"";fFinancing.value=e?.financing||"Eigenkapital";fOrdered.value=e?.ordered||"";
  fReceived.value=e?.received||"";fDue.value=e?.due||"";fPaid.value=e?.paid||"";fNote.value=e?.note||"";noteCount.textContent=fNote.value.length;
  draftDocs=structuredClone(e?.docs||[]);draftExpenseColor=state.categoryColors[fCategory.value]||null;renderExpenseColorPicker();renderDraftDocs();expenseModal.classList.add("open");if(window.lucide)lucide.createIcons();updateCategoryFieldIcon();
}
function closeExpense(){expenseModal.classList.remove("open");}
async function saveExpenseRecord(){
  const title=fTitle.value.trim();if(!title){toast("Bitte eine Bezeichnung eingeben");return;}
  const selectedCompany=companyById(fCompany.value);
  const obj={id:editingId||crypto.randomUUID(),category:fCategory.value,title,companyId:selectedCompany?.id||"",company:selectedCompany?.name||"",amount:Number(fAmount.value||0),financing:fFinancing.value,ordered:fOrdered.value,received:fReceived.value,due:fDue.value,paid:fPaid.value,note:fNote.value.trim(),color:null,docs:draftDocs};
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
  refreshCategorySelects();
  bCategory.value=category||activeCategories()[0]||"";
  bCategory.disabled=Boolean(category);
  bAmount.value=category?(state.budgets[category]||""):"";
  deleteBudget.style.display=category?"inline-block":"none";budgetModal.classList.add("open");
}
function closeBudgetEditor(){budgetModal.classList.remove("open");bCategory.disabled=false;}
function saveBudgetItem(){
  const category=bCategory.value;const amount=Number(bAmount.value||0);
  if(!category){toast("Bitte einen Budgetposten eingeben");return;}
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
  state=ensureCompaniesFromExpenses(backup.state);
  state.categories=Array.isArray(state.categories)&&state.categories.length?state.categories:[...defaultState.categories];
  state.categoryIcons={...defaultState.categoryIcons,...(state.categoryIcons||{})};
  state.companies=(state.companies||[]).map(company=>({
    ...company,
    contactPerson:company.contactPerson||company.contact||"",
    phone:company.phone||"",
    email:company.email||""
  }));
  await clearDocuments();
  for(const [id,d] of Object.entries(backup.docs||{})){
    const blob=typeof d.blob==="string"?dataUrlToBlob(d.blob):d.blob;
    await putDocument({...d,id,blob});
  }
  render();toast("Backup importiert");
}

refreshCategorySelects();
updateCategoryFieldIcon();
renderCompanyOptions();
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.nav)));
settingsBtn.onclick=()=>navTo("more");
document.getElementById("inlineAddExpense").addEventListener("click",()=>openExpense());
document.getElementById("cancelExpense").addEventListener("click",closeExpense);
document.getElementById("saveExpense").addEventListener("click",saveExpenseRecord);
document.getElementById("deleteExpense").addEventListener("click",deleteExpenseItem);
expenseModal.addEventListener("click",e=>{if(e.target.id==="expenseModal")closeExpense();});
document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");currentFilter=c.dataset.filter;currentFinancing=null;renderExpenseList();});
openInvoicesCard.onclick=()=>showExpenses("Rechnung offen");openInvoicesCard.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();showExpenses("Rechnung offen");}};
fCategory.addEventListener("change",()=>{
  requestAnimationFrame(updateCategoryFieldIcon);
  draftExpenseColor=state.categoryColors[fCategory.value]||null;
  renderExpenseColorPicker();
  renderCompanyOptions();
});
fFinancing.addEventListener("change",()=>{if(draftExpenseColor===null)renderExpenseColorPicker();});
fCompany.addEventListener("change",updateCompanyContactHint);
addCompanyFromExpense.addEventListener("click",()=>openCompanyManager({category:fCategory.value,returnToExpense:true}));
manageCategoriesBtn.addEventListener("click",openCategoryManager);
cancelCategory.addEventListener("click",closeCategoryManager);
saveCategory.addEventListener("click",saveCategoryItem);
newCategory.addEventListener("click",clearCategoryForm);
gIcon.addEventListener("change",updateCategoryPreview);
gColor.addEventListener("change",updateCategoryPreview);
gName.addEventListener("input",updateCategoryPreview);
deleteCategory.addEventListener("click",deleteCategoryItem);
categoryModal.addEventListener("click",event=>{if(event.target.id==="categoryModal")closeCategoryManager();});
manageCompaniesBtn.addEventListener("click",()=>openCompanyManager());
cancelCompany.addEventListener("click",closeCompanyManager);
saveCompany.addEventListener("click",saveCompanyItem);
newCompany.addEventListener("click",()=>clearCompanyForm());
deleteCompany.addEventListener("click",deleteCompanyItem);
companyModal.addEventListener("click",event=>{if(event.target.id==="companyModal")closeCompanyManager();});

fNote.addEventListener("input",()=>noteCount.textContent=fNote.value.length);
addPdfBtn.onclick=()=>pdfInput.click();pdfInput.onchange=e=>addPdfs([...e.target.files]);
addBudgetBtn.onclick=()=>openBudgetEditor();cancelBudget.onclick=closeBudgetEditor;saveBudget.onclick=saveBudgetItem;deleteBudget.onclick=deleteBudgetItem;
budgetModal.addEventListener("click",e=>{if(e.target.id==="budgetModal")closeBudgetEditor();});
editBudgetBtn.onclick=()=>{const v=prompt("Gesamtbudget in Euro",state.overallBudget);if(v!==null&&!isNaN(Number(v))){state.overallBudget=Number(v);render();}};
exportBtn.onclick=exportBackup;importBtn.onclick=()=>importFile.click();importFile.onchange=async e=>{try{await importBackup(e.target.files[0]);}catch{toast("Import fehlgeschlagen");}};
resetBtn.onclick=async()=>{if(confirm("Testdaten wirklich zurücksetzen?")){state=structuredClone(defaultState);await clearDocuments();render();toast("Zurückgesetzt");}};
window.openExpense=openExpense;window.openStoredDoc=openStoredDoc;window.removeDraftDoc=removeDraftDoc;window.openBudgetEditor=openBudgetEditor;window.setFinanceColor=setFinanceColor;window.setExpenseColor=setExpenseColor;window.editCompany=editCompany;

const draftDocsEl=document.getElementById("draftDocs");
render();
if(window.lucide)lucide.createIcons();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw-v41.js"));
