var Dest = null;
var Src = null;
window.onload = (()=>{
  bindActions();
  Dest = dgebi('Dest');Dest.Data = [];
  Src = dgebi('Src');Src.Data = [];
  Dest.addEventListener('paste',((e)=>{e.preventDefault();var tsv = e.clipboardData.getData("text");dgebi('DestText').value=tsv;fillDataTable(Dest,tsv)}));
  Dest.addEventListener('copy',((e)=>{e.preventDefault();var tsv = array2tsv(Dest.Data);dgebi('DestText').value=tsv;e.clipboardData.setData("text",tsv)}));
  Src.addEventListener('paste',((e)=>{e.preventDefault();var tsv = e.clipboardData.getData("text");dgebi('SrcText').value=tsv;fillDataTable(Src,tsv)}));
});

var DestData = [];
var SrcData = [];

function bindActions(){
  Array.prototype.map.call(
    document.getElementsByClassName('action'),
    ((e)=>{
    e.addEventListener('click',handleActions);
  }))
}

function handleActions(e){
  var f = document['handleAction_' + e.target.dataset.action];
  if(typeof(f) === 'function'){return f()}
}

function status(text){
  var e = dgebi('status');
  e.innerText = e.innerText + text + "\n-----------\n";
}

document.handleAction_importDest = function(){fillDataTable(Dest,dgebi('DestText').value)}
document.handleAction_importSrc = function(){fillDataTable(Src,dgebi('SrcText').value)}
document.handleAction_exportDest = function(){dgebi('DestText').value = array2tsv(Dest.Data)}
document.handleAction_vlookup = function(){
  var form = dgebi('VlookupParameters');
  if (! form.checkValidity()){return}
  var VlookupParameters = {
    key: 3,
    index: 3,
    take: 4,
    place: 22,
  }
  for(const k in VlookupParameters){VlookupParameters[k] = form[k].value.toUpperCase().charCodeAt(0)-65}
  var index = {}
  var statistic = {
    doubles: {},
    empties: 0,
  }
  Src.Data.map((e,i)=>{
    var v = e[VlookupParameters.index];
    if(v != ''){
      if(index[v] != null){
        if(statistic.doubles[v] == null){statistic.doubles[v] = 2}else{statistic.doubles[v] = statistic.doubles[v] + 1}
      }
      index[v] = i;
    }else{statistic.empties++}
  });status('Indexing: ' + JSON.stringify(statistic));
  Dest.Data.map((e,i)=>{
    try{
      var k = e[VlookupParameters.key];
      if((k != null) && (k != '')){
        var  j = index[k]
        if(j != null){
          Dest.Data[i][VlookupParameters.place] = Src.Data[j][VlookupParameters.take]
        }
      }
    }finally{}
  })
  emptyNode(Dest.tBodies[0]);
  fillTable(Dest,Dest.Data);
}

function tsv2array(tsv){
  var result = tsv.split("\n");
  for(const k of result.keys()){
    var a = result[k].split('\t');
    a.map((e,i)=>{a[i] = a[i].trim()});
    if(a.join('') != ''){result[k] = a}else{result[k]=null};
  }
  var i = 0;for(;;){
    if (i >= result.length){break}
    if (result[i] != null){i++; continue}
    result.splice(i,1);
  }
  return result;
}

function array2tsv(a){
  var result = '';
  result = a.reduce((ac,v)=>{return (ac + v.join("\t") + "\n")},"");
  return result;
}

function fillDataTable(dt,tsv){
  dt.Data.length = 0;
  emptyNode(dt.tBodies[0]);
  dt.Data = tsv2array(tsv)
  fillTable(dt,dt.Data);
}

function fillTable(t,a){
  var rc = 0;
  var cc = 0;
  var body = t.tBodies[0];
  for(var i=0;i<a.length;i++){
    if(a[i] == null){continue}
    if(rc < a[i].length){rc = a[i].length}
    body.appendChild(createRow(a[i],i));
  }
  body.insertBefore(createHeaderRow(rc,1),body.firstChild);
}

function createHeaderRow(l,indexed){
  var result = document.createElement('tr');
  if(indexed != undefined){indexed = 1}else{indexed = 0}
  for(var i=0;i<(l + indexed);i++){
    var th = document.createElement('th');
    if(i >= indexed){th.innerText = String.fromCharCode(65 + i - indexed)};
    result.appendChild(th);
  }
  return result;
}

function createRow(a,index){
  var result = document.createElement('tr');
  if(index != undefined){
    var th = document.createElement('th');
    th.innerText = index+1;
    result.appendChild(th);
  }
  for(var i=0;i<a.length;i++){
    var td = document.createElement('td');
    td.innerText = a[i];
    result.appendChild(td);
  }
  return result;
}

function dgebi(id){return document.getElementById(id)}

function emptyNode(node){
  node.replaceChildren();
}
