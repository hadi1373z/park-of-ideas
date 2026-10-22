'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),guard=require('./source-guard.cjs');
const root=path.resolve(__dirname,'..'),src=path.join(root,'src'),dest=path.join(root,'_site');
if(!fs.existsSync(path.join(src,'index.html')))throw Error('No stable city source snapshot has been imported.');
const sourceFiles=guard.files(src);guard.checkFiles(src,sourceFiles);
const entries=guard.inventory(src,sourceFiles),contentHash=guard.contentHash(entries);
let commit=process.env.GITHUB_SHA;
if(!commit){const p=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true});if(p.status===0)commit=p.stdout.trim();}
// Only remove this build's fixed output directory, after checking its resolved location.
if(path.dirname(dest)!==root||path.basename(dest)!=='_site')throw Error('Invalid build destination');
if(fs.existsSync(dest)&&fs.lstatSync(dest).isSymbolicLink())throw Error('Build destination must not be a symbolic link');
fs.rmSync(dest,{recursive:true,force:true});fs.cpSync(src,dest,{recursive:true});
guard.assertCopy(dest,entries);
if(JSON.stringify(guard.inventory(src))!==JSON.stringify(entries))throw Error('Source changed during build; do not publish this artifact.');
const version={project:'Park of Ideas',schemaVersion:1,commit:commit||'local-uncommitted',contentHash,files:entries.length,bytes:entries.reduce((n,e)=>n+e.bytes,0)};
fs.writeFileSync(path.join(dest,'version.json'),JSON.stringify(version,null,2)+'\n');
fs.writeFileSync(path.join(dest,'asset-manifest.json'),JSON.stringify({contentHash,files:entries},null,2)+'\n');
fs.writeFileSync(path.join(dest,'.nojekyll'),'');
console.log(JSON.stringify(version));
