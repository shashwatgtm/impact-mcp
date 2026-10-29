// Cloud Chromium checks using the built-in CDP client. No browser dependency download.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {createServer} from '../src/index.ts';
import {POSITIONING_HTML} from '../src/positioning-resource.ts';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const out=path.join(root,'work/w4-corrections');fs.mkdirSync(out+'/screenshots',{recursive:true});
const baseline=JSON.parse(fs.readFileSync(root+'/tests/fixtures/positioning-ui-baseline.json'));
const [a,b]=InMemoryTransport.createLinkedPair();const server=createServer(),client=new Client({name:'helix-test',version:'1'});await server.connect(b);await client.connect(a);
const results=[];for(const input of baseline.fixtures)results.push(await client.callTool({name:'impact_full_audit',arguments:input}));
const fixtures=JSON.stringify(baseline.fixtures).replace(/</g,'\\u003c'), resultJSON=JSON.stringify(results).replace(/</g,'\\u003c');
const harness=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><iframe title="Positioning MCP Apps" sandbox="allow-scripts" src="/resource" style="width:100%;height:300px;border:0;display:block"></iframe><script>
window.calls=[];window.bridge=[];window.fixtureIndex=0;window.fixtureResults=${resultJSON};window.fixtures=${fixtures};window.failNext=false;window.delayNext=false;window.pendingReplies=[];window.sizes=[];window.initialization=null;window.replyNext=()=>pendingReplies.shift()?.();
window.notify=(method,params)=>document.querySelector('iframe').contentWindow.postMessage({jsonrpc:'2.0',method,params},'*');
window.addEventListener('message',e=>{if(e.source!==document.querySelector('iframe').contentWindow)return;const m=e.data;if(m?.jsonrpc!=='2.0')return;bridge.push(m.method||'response');const reply=result=>e.source.postMessage({jsonrpc:'2.0',id:m.id,result},'*');
if(m.method==='ui/notifications/size-changed'){const size=m.params;if(Number.isFinite(size?.height)&&size.height>0&&size.height<=50000&&Number.isFinite(size.width)&&size.width>0){sizes.push({...size,at:performance.now()});document.querySelector('iframe').style.height=size.height+'px';}}
if(m.method==='ui/initialize'){window.initialization=m.params;reply({protocolVersion:'2026-01-26',hostInfo:{name:'cloud-test-host',version:'1'},hostCapabilities:{serverTools:{}},hostContext:{displayMode:'inline',availableDisplayModes:['inline'],containerDimensions:{width:innerWidth,maxHeight:50000}}});}
if(m.method==='tools/call'){calls.push(m.params);const fail=failNext,result=fixtureResults[fixtureIndex];failNext=false;const run=()=>{if(fail){e.source.postMessage({jsonrpc:'2.0',id:m.id,error:{code:-32603,message:'Synthetic host failure'}},'*');}else reply(result);};if(delayNext){delayNext=false;window.replyPending=run;pendingReplies.push(run);}else run();}
});</script></body></html>`;
const globalCSP=fs.readFileSync(root+'/public/_headers','utf8').match(/  Content-Security-Policy: (.*)/)[1];
const web=http.createServer((req,res)=>{
 if(req.url==='/resource'){res.setHeader('content-type','text/html');return res.end(POSITIONING_HTML);}
 if(req.url==='/harness'){res.setHeader('content-type','text/html');return res.end(harness);}
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const relative=pathname.endsWith('/')?pathname+'index.html':pathname;
 const file=path.resolve(root+'/public','.'+relative);
 if(!file.startsWith(root+'/public/')){res.writeHead(403);return res.end();}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
 const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
 res.setHeader('content-type',type);if(type==='text/html')res.setHeader('Content-Security-Policy',globalCSP);res.end(fs.readFileSync(file));
});web.listen(0,'127.0.0.1');await once(web,'listening');const origin='http://127.0.0.1:'+web.address().port;
const chrome=spawn('/usr/bin/chromium',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--no-first-run','--remote-debugging-port=0','--user-data-dir='+out+'/chromium','about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='';chrome.stderr.on('data',chunk=>stderr+=chunk);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browserURL;for(let i=0;i<100;i++){browserURL=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1];if(browserURL)break;await pause(100);}if(!browserURL)throw new Error('Chromium did not start: '+stderr.slice(-1500));
class CDP{constructor(ws){this.ws=ws;this.next=0;this.pending=new Map();this.listeners=[];ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}}else for(const listener of this.listeners)listener(m);});}async send(method,params={},sessionId){const id=++this.next;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}}
async function socket(url){const ws=new WebSocket(url);await once(ws,'open');return new CDP(ws);}
const browser=await socket(browserURL), debugOrigin=browserURL.replace('ws:','http:').split('/devtools')[0];
const {targetId}=await browser.send('Target.createTarget',{url:'about:blank'});const targets=await (await fetch(debugOrigin+'/json/list')).json();const cdp=await socket(targets.find(t=>t.id===targetId).webSocketDebuggerUrl);
const contexts=new Map(),runtimeErrors=[],requests=[];
cdp.listeners.push(m=>{if(m.method==='Runtime.executionContextCreated')contexts.set((m.sessionId||'')+':'+m.params.context.id,{...m.params.context,sessionId:m.sessionId});if(m.method==='Runtime.executionContextDestroyed')contexts.delete((m.sessionId||'')+':'+m.params.executionContextId);if(m.method==='Runtime.executionContextsCleared'){for(const [key,value] of contexts)if(value.sessionId===m.sessionId)contexts.delete(key);}if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(m.params.exceptionDetails);if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);});
cdp.listeners.push(m=>{if(m.method==='Target.attachedToTarget'){cdp.send('Runtime.enable',{},m.params.sessionId);cdp.send('Network.enable',{},m.params.sessionId);}});
await cdp.send('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:false,flatten:true});
await cdp.send('Runtime.enable');await cdp.send('Page.enable');await cdp.send('Network.enable');
async function evaluate(expression,contextId){const r=await cdp.send('Runtime.evaluate',{expression,contextId:typeof contextId==='object'?contextId.id:contextId,awaitPromise:true,returnByValue:true,userGesture:true},typeof contextId==='object'?contextId.sessionId:undefined);if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function waitFor(expression,contextId){for(let i=0;i<80;i++){if(await evaluate(expression,contextId))return;await pause(50);}throw new Error('Timed out: '+expression);}
async function navigate(route){contexts.clear();await cdp.send('Page.navigate',{url:origin+route});await waitFor('document.readyState === "complete"');}
async function screenshot(name){await evaluate('document.activeElement?.blur()');await cdp.send('Page.resetNavigationHistory');const {data}=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(out+'/screenshots/'+name+'.png',Buffer.from(data,'base64'));}
let pass=0;function check(name,condition){assert.ok(condition,name);pass++;console.log('PASS '+name);}
async function fill(input,ctx){await evaluate(`(()=>{const input=${JSON.stringify(input)};for(const [key,value] of Object.entries(input)){const el=document.getElementById('input-'+key);if(el){el.value=Array.isArray(value)?value.join('\\n'):value;el.dispatchEvent(new Event('input',{bubbles:true}));}}})()`,ctx);}
async function submit(ctx){await evaluate('document.getElementById("calculate").click()',ctx);}
try{
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:1366,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('/lab/positioning/');await waitFor('!!document.getElementById("input-company_name")');
 check('standalone starts empty',await evaluate('document.getElementById("input-company_name").value === "" && document.getElementById("original-score").textContent === "No valid calculation yet."'));
 await screenshot('standalone-empty-desktop');
 await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 check('keyboard skip link receives focus',await evaluate('document.activeElement.className === "skip"'));
 check('empty required input prevents submission',await evaluate('document.getElementById("input-product_description").validity.valueMissing'));
 await fill(baseline.fixtures[0]);await submit();
 check('standalone exact review fixture computes and marks missing feedback',await evaluate('document.getElementById("original-score").textContent.includes("59/100") && document.getElementById("missing").textContent.includes("customer_feedback") && document.getElementById("evidence").textContent.includes("Missing evidence statement")'));
 check('assumption is distinct and no independent observation is claimed',await evaluate('document.getElementById("evidence").textContent.includes("assumption") && document.querySelector(".legend").textContent.includes("Observed: 0")'));
 check('decision includes claim limit and minimum validation',await evaluate('document.getElementById("claim").textContent.startsWith("Do not claim") && document.getElementById("validation").textContent.startsWith("Minimum validation")'));
 check('alternatives separate fit and confidence',await evaluate('document.getElementById("alternatives").textContent.includes("Strategic fit: Not assessed") && document.getElementById("alternatives").textContent.includes("Evidence confidence: Unverified")'));
 const original=await evaluate('document.getElementById("original-score").textContent');
 await evaluate('const w=document.getElementById("weight-identify");w.value="10";w.dispatchEvent(new Event("input"))');
 check('local weights change scenario without changing original',await evaluate('document.getElementById("scenario-score").textContent.includes("66/100")') && await evaluate('document.getElementById("original-score").textContent')===original);
 await evaluate('document.getElementById("weight-map").value="-1";document.getElementById("weight-map").dispatchEvent(new Event("input"))');
 check('invalid local weight is explained',await evaluate('document.getElementById("scenario-score").textContent.startsWith("Invalid local weights")'));
 await evaluate('document.getElementById("reset-weights").click()');
 check('local weights reset',await evaluate('document.getElementById("scenario-score").textContent.includes("59/100")'));
 await screenshot('standalone-fixture-desktop');
 await evaluate('document.getElementById("score-title").scrollIntoView()');await screenshot('standalone-decisions-desktop');await evaluate('document.getElementById("decision-title").scrollIntoView()');await screenshot('standalone-validation-desktop');await evaluate('scrollTo(0,0)');
 for(let i=1;i<baseline.fixtures.length;i++){await evaluate('document.getElementById("reset").click()');await fill(baseline.fixtures[i]);await submit();check('standalone synthetic fixture '+(i+1),await evaluate('document.getElementById("missing").textContent.includes("customer_feedback") && document.getElementById("claim").textContent.startsWith("Do not claim")'));}
 await fill({...baseline.fixtures[0],company_name:'<img src="https://evil.example/x" onerror="window.pwned=1">',current_positioning:'Contradicted: faster handoffs'});await submit();
 check('standalone hostile HTML remains inert and contradiction is visible',await evaluate('document.querySelectorAll("#evidence img").length===0 && !window.pwned && document.getElementById("evidence").textContent.includes("contradicted")'));
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 check('standalone mobile has no horizontal overflow',await evaluate('document.documentElement.scrollWidth <= innerWidth'));
 await screenshot('standalone-mobile');
 check('standalone uses no durable browser storage',await evaluate('localStorage.length===0 && sessionStorage.length===0'));
 const staticRequests=requests.slice();check('standalone loads only local assets and no API',staticRequests.every(u=>u.startsWith(origin+'/lab/')||u.startsWith(origin+'/assets/')||u===origin+'/favicon.ico'));
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:1366,height:1000,deviceScaleFactor:1,mobile:false});
 const startRequests=requests.length;
 await navigate('/harness');
 let ctx;for(let i=0;i<100;i++){for(const [id,c]of contexts)if(c.auxData?.isDefault && c.origin === '://')ctx=c;if(ctx)break;await pause(50);}
 // Opaque-origin frame names differ between Chromium versions. Select its default context by DOM.
 if(!ctx)for(const [id,c]of contexts){if(c.auxData?.isDefault && await evaluate('!!document.getElementById("audit-form")',c))ctx=c;}
 assert.ok(ctx,'MCP iframe execution context');
 await waitFor('document.getElementById("status").textContent.startsWith("Connected")',ctx);
 check('MCP bridge initializes before initialized notification',await evaluate('bridge[0]==="ui/initialize" && bridge[1]==="ui/notifications/initialized"'));
 check('MCP initialization declares only inline display support',await evaluate('JSON.stringify(initialization.appCapabilities.availableDisplayModes)===JSON.stringify(["inline"])'));
 await waitFor('sizes.length>0');
 check('flexible host applies initial natural content height',await evaluate('Math.abs(document.querySelector("iframe").getBoundingClientRect().height-sizes.at(-1).height)<=1 && sizes.at(-1).height>300'));
 check('MCP starts empty in a sandboxed opaque origin',await evaluate('document.getElementById("input-company_name").value===""',ctx));
 await evaluate('notify("ui/notifications/tool-input",{arguments:fixtures[0]})');
 await waitFor('document.getElementById("input-company_name").value === "HubSpot"',ctx);
 check('MCP tool-input displays pending state',await evaluate('document.getElementById("view-label").textContent.includes("Waiting for a tool result")',ctx));
 await evaluate('notify("ui/notifications/tool-result",fixtureResults[0])');
 await waitFor('document.getElementById("status").textContent === "Host result loaded."',ctx);
 check('MCP tool-result uses structured inputs and preserves legacy text',await evaluate('document.getElementById("original-score").textContent.includes("59/100") && document.getElementById("legacy-text").textContent.length > 100',ctx));
 // An event carrying valid-looking data but with a non-parent source must be ignored.
 await evaluate('window.dispatchEvent(new MessageEvent("message",{source:window,origin:'+JSON.stringify(origin)+',data:{jsonrpc:"2.0",method:"ui/notifications/tool-input",params:{arguments:{company_name:"spoofed"}}}}))',ctx);
 check('MCP rejects messages from a non-parent source',await evaluate('document.getElementById("input-company_name").value === "HubSpot"',ctx));
 await evaluate('notify("ui/notifications/tool-result",{structuredContent:{version:1,inputs:{},inputsBase64:"bad"}})');
 await waitFor('document.getElementById("error").textContent.length>0',ctx);
 check('MCP rejects malformed structured content',await evaluate('document.getElementById("error").textContent.includes("Invalid encoded host inputs")',ctx));
 await evaluate('notify("ui/notifications/tool-result",fixtureResults[0])');
 await screenshot('mcp-fixture-desktop');
 await evaluate('document.getElementById("score-title").scrollIntoView()',ctx);await screenshot('mcp-decisions-desktop');await evaluate('document.getElementById("decision-title").scrollIntoView()',ctx);await screenshot('mcp-validation-desktop');await evaluate('scrollTo(0,0)',ctx);await evaluate('scrollTo(0,0)');
 for(let i=1;i<baseline.fixtures.length;i++){await evaluate('fixtureIndex='+i);await evaluate('document.getElementById("reset").click()',ctx);await fill(baseline.fixtures[i],ctx);await submit(ctx);await waitFor('document.getElementById("status").textContent === "Host result loaded."',ctx);check('MCP synthetic fixture '+(i+1)+' calls existing tool',await evaluate('calls.at(-1).name==="impact_full_audit" && calls.at(-1).arguments.problem_solved===fixtures['+i+'].problem_solved'));}
 await evaluate('delayNext=true;fixtureIndex=0');await fill(baseline.fixtures[0],ctx);await submit(ctx);
 await waitFor('document.getElementById("status").textContent.includes("Loading")',ctx);
 check('MCP loading disables duplicate submission',await evaluate('document.getElementById("calculate").disabled && document.getElementById("audit-form").getAttribute("aria-busy")==="true"',ctx));
 await evaluate('replyNext()');await waitFor('!document.getElementById("calculate").disabled',ctx);
 await evaluate('failNext=true');await submit(ctx);await waitFor('document.getElementById("error").textContent.length>0',ctx);
 check('MCP errors are clear and preserve edits',await evaluate('document.getElementById("error").textContent.includes("Host request failed") && document.getElementById("input-company_name").value==="HubSpot"',ctx));
 await submit(ctx);await waitFor('document.getElementById("status").textContent === "Host result loaded."',ctx);check('MCP retry recovers',await evaluate('document.getElementById("status").textContent === "Host result loaded."',ctx));
 await cdp.send('Page.bringToFront');const callCount=await evaluate('calls.length');await evaluate('document.getElementById("calculate").focus()',ctx);
 await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13},ctx.sessionId);await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},ctx.sessionId);
 await waitFor('calls.length > '+callCount);check('MCP recalculate supports native keyboard activation',true);

 // The host only sends uncorrelated notifications here. Local ownership must survive all of them.
 const ownedResult=await evaluate('document.getElementById("evidence").textContent+document.getElementById("original-score").textContent+document.getElementById("legacy-text").textContent',ctx);
 await evaluate('delayNext=true;fixtureIndex=0');await submit(ctx);
 await waitFor('!!replyPending');
 await fill({company_name:'Synthetic newer local edit'},ctx);
 await evaluate('notify("ui/notifications/tool-input",{arguments:fixtures[1]});notify("ui/notifications/tool-result",fixtureResults[1]);notify("ui/notifications/tool-cancelled",{reason:"old synthetic run"})');
 await waitFor('document.getElementById("stale-notice").textContent.includes("Stale host update ignored")',ctx);
 check('stale input/result/cancel notifications preserve local inputs',await evaluate('document.getElementById("input-company_name").value==="Synthetic newer local edit"',ctx));
 check('stale notifications preserve result and current loading ownership',ownedResult===await evaluate('document.getElementById("evidence").textContent+document.getElementById("original-score").textContent+document.getElementById("legacy-text").textContent',ctx) && await evaluate('document.getElementById("calculate").disabled',ctx));
 await evaluate('replyNext()');await waitFor('!document.getElementById("calculate").disabled',ctx);
 check('delayed success after an edit cannot restore obsolete inputs or results',await evaluate('document.getElementById("input-company_name").value==="Synthetic newer local edit" && document.getElementById("error").textContent===""',ctx) && ownedResult===await evaluate('document.getElementById("evidence").textContent+document.getElementById("original-score").textContent+document.getElementById("legacy-text").textContent',ctx));
 await evaluate('delayNext=true;failNext=true');await submit(ctx);await fill({company_name:'Synthetic latest edit after error request'},ctx);
 await evaluate('replyNext()');await waitFor('!document.getElementById("calculate").disabled',ctx);
 check('delayed rejected RPC after an edit has no obsolete error',await evaluate('document.getElementById("error").textContent==="" && document.getElementById("input-company_name").value==="Synthetic latest edit after error request" && document.getElementById("stale-notice").textContent.includes("Stale")',ctx));
 check('late error leaves the last accepted result intact',ownedResult===await evaluate('document.getElementById("evidence").textContent+document.getElementById("original-score").textContent+document.getElementById("legacy-text").textContent',ctx));
 // Reset invalidates both input revision and request generation. Old replies cannot finish a newer run.
 await evaluate('delayNext=true');await submit(ctx);
 check('clear remains available while a request is pending',await evaluate('!document.getElementById("reset").disabled',ctx));
 await evaluate('document.getElementById("reset").click()',ctx);
 await evaluate('notify("ui/notifications/tool-input",{arguments:fixtures[0]});notify("ui/notifications/tool-result",fixtureResults[0])');
 await waitFor('document.getElementById("stale-notice").textContent.length>0',ctx);
 check('reset stays empty when old uncorrelated notifications arrive',await evaluate('document.getElementById("input-company_name").value==="" && document.getElementById("legacy-text").textContent==="" && document.getElementById("original-score").textContent==="No valid calculation yet."',ctx));
 await fill(baseline.fixtures[0],ctx);await evaluate('delayNext=true');await submit(ctx);
 await evaluate('replyNext()');await pause(100);
 check('old success after reset cannot end the newer loading state',await evaluate('document.getElementById("calculate").disabled && document.getElementById("legacy-text").textContent===""',ctx));
 await evaluate('replyNext()');await waitFor('document.getElementById("status").textContent==="Host result loaded."',ctx);
 check('matching success after reset owns the new result',await evaluate('!document.getElementById("calculate").disabled && document.getElementById("legacy-text").textContent.length>100 && document.getElementById("stale-notice").textContent===""',ctx));
 await evaluate('delayNext=true;failNext=true');await submit(ctx);await evaluate('document.getElementById("reset").click()',ctx);
 await fill(baseline.fixtures[0],ctx);await evaluate('delayNext=true');await submit(ctx);await evaluate('replyNext()');await pause(100);
 check('old rejected RPC cannot set an error or end a newer generation',await evaluate('document.getElementById("error").textContent==="" && document.getElementById("calculate").disabled',ctx));
 await evaluate('replyNext()');await waitFor('document.getElementById("status").textContent==="Host result loaded."',ctx);
 // Exercise literal text through a real local server result, not a canned HTML view.
 const literal={...baseline.fixtures[0],company_name:'  Synthetic literal <img src=x> \\ 😀  ',customer_feedback:'Reported: "literal" <script>inert</script> 😀'};
 const literalResult=await client.callTool({name:'impact_full_audit',arguments:literal});
 await evaluate('fixtureResults.push('+JSON.stringify(literalResult)+');fixtureIndex=fixtureResults.length-1');
 await fill(literal,ctx);await submit(ctx);await waitFor('document.getElementById("status").textContent==="Host result loaded."',ctx);
 check('literal supported input text round-trips through tools/call',await evaluate('JSON.stringify(calls.at(-1).arguments)')===JSON.stringify(literal));
 check('literal host result remains inert and preserves exact field values',await evaluate('document.getElementById("input-company_name").value',ctx)===literal.company_name && await evaluate('document.getElementById("input-customer_feedback").value',ctx)===literal.customer_feedback && await evaluate('document.querySelectorAll("#evidence img,#evidence script").length===0',ctx));
 await evaluate('notify("ui/notifications/tool-result",fixtureResults[1])');await waitFor('document.getElementById("stale-notice").textContent.length>0',ctx);
 check('uncorrelated notification after a local result cannot take ownership',await evaluate('document.getElementById("input-company_name").value',ctx)===literal.company_name);
 // Restore the review fixture via an explicit correlated request before resize checks.
 await evaluate('fixtureIndex=0');await fill(baseline.fixtures[0],ctx);await submit(ctx);await waitFor('document.getElementById("status").textContent==="Host result loaded."',ctx);
 await pause(250);const collapsedHeight=await evaluate('document.querySelector("iframe").getBoundingClientRect().height');
 await evaluate('document.getElementById("legacy").open=true',ctx);
 await waitFor('document.querySelector("iframe").getBoundingClientRect().height > '+(collapsedHeight+1000));
 const expandedHeight=await evaluate('document.querySelector("iframe").getBoundingClientRect().height');
 check('flexible host iframe really grows when legacy details expand',expandedHeight>collapsedHeight+1000);
 await screenshot('mcp-flexible-grown');await evaluate('document.getElementById("legacy").open=false',ctx);
 await waitFor('document.querySelector("iframe").getBoundingClientRect().height < '+(expandedHeight-1000));
 const shrunkHeight=await evaluate('document.querySelector("iframe").getBoundingClientRect().height');
 check('flexible host iframe really shrinks when legacy details collapse',Math.abs(shrunkHeight-collapsedHeight)<=2);
 await screenshot('mcp-flexible-shrunk');
 await pause(250);const countBefore=await evaluate('sizes.length');
 await evaluate('for(let i=0;i<20;i++)window.dispatchEvent(new Event("resize"))',ctx);await pause(250);
 check('resize bursts with unchanged dimensions send no duplicate sizes',await evaluate('sizes.length')===countBefore);
 const burstStart=await evaluate('sizes.length');
 for(let i=0;i<6;i++){await evaluate('document.getElementById("legacy").open='+String(i%2===0),ctx);await pause(20);}
 await evaluate('document.getElementById("legacy").open=true',ctx);
 await waitFor('document.querySelector("iframe").getBoundingClientRect().height > '+(collapsedHeight+1000));
 check('rapid content changes debounce to one final size notification',await evaluate('sizes.length')===burstStart+1);
 await evaluate('document.getElementById("legacy").open=false',ctx);await waitFor('document.querySelector("iframe").getBoundingClientRect().height < '+(expandedHeight-1000));await pause(250);
 const settledCount=await evaluate('sizes.length');await pause(250);
 check('host height updates do not cause an observer feedback loop',await evaluate('sizes.length')===settledCount);
 const growthReceipt={collapsedHeight,expandedHeight,shrunkHeight};
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await waitFor('innerWidth <= 390',ctx);
 check('MCP mobile uses a narrow viewport and one-column layout',await evaluate('innerWidth >= 360 && innerWidth <= 390 && getComputedStyle(document.querySelector(".layout")).gridTemplateColumns.split(" ").length===1',ctx));
 check('MCP mobile has no horizontal overflow',await evaluate('document.documentElement.scrollWidth <= innerWidth',ctx));await evaluate('scrollTo(0,0)',ctx);await evaluate('scrollTo(0,0)');await screenshot('mcp-mobile');

 await waitFor('sizes.at(-1)?.width <= 390');
 const mobile390=await evaluate('({frame:document.querySelector("iframe").getBoundingClientRect().toJSON(),size:sizes.at(-1)})');
 check('flexible host height tracks the 390px mobile layout',Math.abs(mobile390.frame.height-mobile390.size.height)<=1 && mobile390.size.width<=390);
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});
 await waitFor('innerWidth <= 320',ctx);await waitFor('sizes.at(-1)?.width <= 320');
 check('320px mobile iframe has one column without horizontal overflow',await evaluate('innerWidth>=290 && document.documentElement.scrollWidth<=innerWidth && getComputedStyle(document.querySelector(".layout")).gridTemplateColumns.split(" ").length===1',ctx));
 const mobile320=await evaluate('({frame:document.querySelector("iframe").getBoundingClientRect().toJSON(),size:sizes.at(-1)})');
 check('flexible host applies height and width reports after mobile resize',Math.abs(mobile320.frame.height-mobile320.size.height)<=1 && mobile320.size.width<=320 && mobile320.size.height!==mobile390.size.height);
 await screenshot('mcp-mobile-320');
 fs.writeFileSync(out+'/flexible-host-receipt.json',JSON.stringify({growthReceipt,mobile390,mobile320,sizes:await evaluate('sizes'),appCapabilities:await evaluate('initialization.appCapabilities')},null,2));
 const resourceRequests=requests.slice(startRequests);check('MCP resource makes no asset or API requests',resourceRequests.every(u=>u===origin+'/harness'||u===origin+'/resource'||u===origin+'/favicon.ico'||u.startsWith('data:')));
 check('both modes have no uncaught browser exceptions',runtimeErrors.length===0);
 console.log(`Checks: ${pass}; pass: ${pass}; fail: 0; skip: 0`);
 fs.writeFileSync(out+'/browser-receipt.json',JSON.stringify({checks:pass,pass,fail:0,skip:0,runtimeErrors,staticRequests,resourceRequests,bridge:'Sandboxed cloud test host, not a live ChatGPT session',screenshots:fs.readdirSync(out+'/screenshots')},null,2));
}catch(e){console.error('FAIL',e);for(const c of contexts.values()){try{console.error('STATE',JSON.stringify(await evaluate('({status:document.getElementById("status")?.textContent,error:document.getElementById("error")?.textContent,width:innerWidth,docWidth:document.documentElement.scrollWidth,grid:document.querySelector(".layout")?getComputedStyle(document.querySelector(".layout")).gridTemplateColumns:undefined,active:document.activeElement?.id,button:document.getElementById("calculate")?.disabled,invalid:[...document.querySelectorAll("input,textarea,select")].filter(e=>!e.validity.valid).map(e=>({id:e.id,value:e.value,message:e.validationMessage})),calls:window.calls,bridge:window.bridge})',c)));}catch{}}fs.writeFileSync(out+'/browser-failure.json',JSON.stringify({error:String(e),runtimeErrors,requests,contexts:[...contexts.values()]},null,2));process.exitCode=1;}
finally{cdp.ws.close();browser.ws.close();chrome.kill();web.close();await client.close();await server.close();}
