const {app,BrowserWindow,session,shell}=require('electron');
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json'};
const root=path.join(__dirname,'..','www');
function serve(){return new Promise(resolve=>{
  const s=http.createServer((q,res)=>{
    let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
    const f=path.join(root,path.normalize(p));
    if(!f.startsWith(root)){res.writeHead(403);return res.end()}
    fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end()}
      res.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});res.end(d)});
  });
  s.once('error',()=>s.listen(0,'127.0.0.1',()=>resolve(s.address().port)));
  s.listen(47831,'127.0.0.1',()=>resolve(s.address().port));
})}
app.whenReady().then(async()=>{
  const port=await serve();
  session.defaultSession.setPermissionRequestHandler((wc,perm,cb)=>cb(perm==='media'));
  const w=new BrowserWindow({width:1100,height:720,minWidth:380,minHeight:500,autoHideMenuBar:true,title:'Кружок'});
  w.webContents.setWindowOpenHandler(({url})=>{shell.openExternal(url);return{action:'deny'}});
  w.loadURL('http://127.0.0.1:'+port+'/');
});
app.on('window-all-closed',()=>app.quit());
