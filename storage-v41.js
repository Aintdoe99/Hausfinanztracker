const DB_NAME="HausbauCockpitDB";
const DB_VERSION=1;
const STORE="documents";

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE)){
        db.createObjectStore(STORE,{keyPath:"id"});
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function putDocument(record){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
async function getDocument(id){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(STORE,"readonly").objectStore(STORE).get(id);
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
}
async function deleteDocument(id){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
async function getAllDocuments(){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(STORE,"readonly").objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}
async function clearDocuments(){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
function blobToDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
    r.readAsDataURL(blob);
  });
}
function dataUrlToBlob(dataUrl){
  const [meta,data]=dataUrl.split(",");
  const mime=(meta.match(/data:(.*?);/)||[])[1]||"application/octet-stream";
  const bin=atob(data);
  const arr=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
  return new Blob([arr],{type:mime});
}
