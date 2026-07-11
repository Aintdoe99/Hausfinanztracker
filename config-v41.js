/* Hausbau-Cockpit v4.0 – zentrale Konfiguration */
const categories=[
"Grundstück & Nebenkosten","Planung & Genehmigungen","Vermessung","Baugrund & Gutachten","Erdarbeiten","Bodenplatte","Rohbau / Holzbau","Dach","Fenster & Türen","Fassade","Elektro / KNX","Heizung","Lüftung","Sanitär","PV & Speicher","Innenausbau","Böden","Malerarbeiten","Küche","Bäder","Carport","Außenanlagen","Baunebenkosten","Versicherungen","Sonstiges"];

const palette={
  green:{name:"Mint",accent:"#2F9D67",soft:"#DFF3E8"},
  purple:{name:"Lavendel",accent:"#7D58C2",soft:"#EEE7FA"},
  yellow:{name:"Gelb",accent:"#C79A00",soft:"#FFF3C8"},
  blue:{name:"Blau",accent:"#3277C8",soft:"#E3EFFB"},
  rose:{name:"Rosé",accent:"#C85E79",soft:"#F9E6EC"},
  teal:{name:"Türkis",accent:"#159FA8",soft:"#DDF4F3"},
  red:{name:"Rot",accent:"#D95C62",soft:"#FBE5E7"}
};

const expenseColorOrder=["purple","yellow","blue","rose","green","teal","red"];

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

function categoryIconSvg(category,overrideType=null){
  const dynamicType=(typeof state!=="undefined"&&state?.categoryIcons?.[category])||null;
  const type=overrideType||dynamicType||categoryIconTypes[category]||"tool";
  const paths=categorySvgPaths[type]||categorySvgPaths.tool;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

const financeIconTypes={
  "Eigenkapital":"piggy",
  "KfW":"landmark",
  "Banktranche 1":"banknote",
  "Banktranche 2":"banknote"
};

const financeSvgPaths={
  piggy:'<path d="M5 10.2C6.4 7.8 9.2 6.5 12.5 6.5h2.6l1.8-1.5.7 2.5c1.5.7 2.6 2.2 2.8 4h1.6v2.8h-2c-.5 1.3-1.5 2.4-2.8 3.1V20h-2.7v-2H9.3v2H6.6v-2.8C5 16.3 4 14.8 4 13.1c0-1.1.3-2.1 1-2.9Z"/><path d="M9.5 6.5V5.2h5V6.5M9.8 9h4.8"/><circle cx="17.5" cy="10.4" r=".7" fill="currentColor" stroke="none"/><path d="M4.2 11.2c-1.7 0-2.6-1-2.2-2.2"/>',
  landmark:'<path d="M3 10 12 4l9 6"/><path d="M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M3 21h18"/>',
  banknote:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/><path d="M6.5 9.5h.01M17.5 14.5h.01"/>'
};

function financeIconSvg(fin){
  const type=financeIconTypes[fin]||"banknote";
  const paths=financeSvgPaths[type]||financeSvgPaths.banknote;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

const categoryColorKeys={
  "Grundstück & Nebenkosten":"teal",
  "Planung & Genehmigungen":"purple",
  "Vermessung":"green",
  "Baugrund & Gutachten":"purple",
  "Erdarbeiten":"yellow",
  "Bodenplatte":"blue",
  "Rohbau / Holzbau":"rose",
  "Dach":"rose",
  "Fenster & Türen":"blue",
  "Fassade":"yellow",
  "Elektro / KNX":"green",
  "Heizung":"rose",
  "Lüftung":"teal",
  "Sanitär":"blue",
  "PV & Speicher":"yellow",
  "Innenausbau":"yellow",
  "Böden":"teal",
  "Malerarbeiten":"purple",
  "Küche":"rose",
  "Bäder":"blue",
  "Carport":"blue",
  "Außenanlagen":"green",
  "Baunebenkosten":"teal",
  "Versicherungen":"purple",
  "Sonstiges":"teal"
};

function categoryMeta(category){
  return palette[categoryColorKeys[category]||"teal"]||palette.teal;
}
