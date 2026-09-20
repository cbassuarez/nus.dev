import {createServer} from 'node:http';
import {createReadStream, statSync, realpathSync} from 'node:fs';
import {resolve, sep, extname} from 'node:path';

const TYPES = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
 '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon',
 '.woff2':'font/woff2','.ttf':'font/ttf','.mp4':'video/mp4','.xml':'application/xml',
 '.txt':'text/plain; charset=utf-8','.cast':'text/plain; charset=utf-8','.wasm':'application/wasm'};

export function siteServer(root) {
 root=realpathSync(root);
 return createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
  let path, size;
  try {
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   path=realpathSync(resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':'')));
   if(!path.startsWith(root+sep))throw new Error('Outside site');
   const stat=statSync(path);if(!stat.isFile())throw new Error('Not a file');size=stat.size;
  } catch {res.writeHead(404);return res.end('Not found');}
  const headers={'Content-Type':TYPES[extname(path)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  let start=0,end=size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(match&&(match[1]||match[2])){
    start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
    end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
   } else start=NaN;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
  if(req.method==='HEAD'||!size)return res.end();
  const stream=createReadStream(path,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 });
}
