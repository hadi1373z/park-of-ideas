'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const reserved=new Set(['version.json','asset-manifest.json','.nojekyll']);
const textExtensions=new Set(['.html','.js','.mjs','.css','.json','.svg','.md','.txt','.webmanifest']);
const privatePath=/(?:^|\/)(?:\.env(?:[./]|$)|\.git(?:\/|$)|\.openai(?:\/|$)|(?:credentials?|secrets?)(?:[._-]|\/|$)|(?:private|user)[-_]?(?:export|backup)(?:[._-]|\/|$)|(?:session|storage|auth)[-_]state(?:[._-]|\/|$)|id_(?:rsa|ed25519)(?:\.|$))/i;
const secretPatterns=[
  ['OpenAI API credential',/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g],
  ['GitHub credential',/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/g],
  ['AWS access credential',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['private key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['literal service credential',/\b(?:OPENAI_API_KEY|GITHUB_TOKEN|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\b\s*["']?\s*[:=]\s*["'](?:[A-Za-z0-9_+/=-]{24,})["']/gi],
  ['literal bearer credential',/\bBearer\s+[A-Za-z0-9_+/.=-]{24,}/g]
];
function files(root,{ignoreDirectories=new Set()}={}){
  if(fs.lstatSync(root).isSymbolicLink())throw Error('Source root must not be a symbolic link.');
  function walk(dir,prefix=''){
    return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
      const rel=prefix+e.name;
      if(e.isSymbolicLink())throw Error('Source contains a symbolic link: '+rel);
      if(e.isDirectory())return ignoreDirectories.has(e.name)?[]:walk(path.join(dir,e.name),rel+'/');
      if(!e.isFile())throw Error('Unsupported source entry: '+rel);
      return [rel];
    }).sort();
  }
  return walk(root);
}
function checkFiles(root,entries,{allowReserved=false}={}){
  for(const rel of entries){
    if(privatePath.test(rel))throw Error('Private runtime file must not be published: '+rel);
    if(!allowReserved&&reserved.has(rel))throw Error('Source conflicts with generated publication metadata: '+rel);
    if(!textExtensions.has(path.extname(rel).toLowerCase()))continue;
    const text=fs.readFileSync(path.join(root,rel),'utf8');
    for(const [kind,pattern]of secretPatterns){
      pattern.lastIndex=0;
      const match=pattern.exec(text);
      // Never include the suspected credential or surrounding source in an error.
      if(match)throw Error('Possible '+kind+' in '+rel+':'+(text.slice(0,match.index).split('\n').length)+'; remove it before publication.');
    }
  }
}
function inventory(root,entries=files(root)){
  return entries.map(rel=>{const data=fs.readFileSync(path.join(root,rel));return{path:rel,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};});
}
function contentHash(entries){return crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex');}
function assertCopy(root,expected){
  const actual=inventory(root);
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Copied source bytes differ from the checked snapshot; build/import aborted.');
}
module.exports={files,checkFiles,inventory,contentHash,assertCopy,reserved};
