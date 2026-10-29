/* Shared component. No fetch, links, analytics, checkout or durable storage. */
(() => {
  'use strict';
  const calculate = window.HelixPositioning.calculatePositioning;
  const schema = window.HelixAuditSchema;
  const $ = id => document.getElementById(id);
  const embedded = window.parent !== window;
  let ready = !embedded, busy = false, original = null, hostOrigin = null, editRevision = 0;
  let requestId = 0, generation = 0, localOwnership = false;
  const pending = new Map();
  const weights = Object.fromEntries(['identify','map','pinpoint','anchor','craft','translate'].map(k => [k,1]));
  const labels = {company_name:'Company name',product_description:'Product description',target_customer:'Target customer',problem_solved:'Problem solved',key_differentiation:'Key differentiation',competitors:'Alternatives, one per line',current_positioning:'Current positioning',customer_feedback:'Customer feedback',business_model:'Business model',your_sector:'Your sector'};
  function node(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
  function status(text) { $('status').textContent = text; }
  function error(text) { $('error').textContent = text; }
  function setBusy(value) { busy = value; $('calculate').disabled = value || !ready; $('audit-form').setAttribute('aria-busy', String(value)); }
  function readInputs() {
    const input = {};
    for (const key of Object.keys(labels)) {
      const value = $('input-'+key).value;
      if (!value.trim()) continue;
      input[key] = key === 'competitors' ? value.split('\n').filter(v => v.trim()) : value;
    }
    return input;
  }
  function fillInputs(input) {
    for (const key of Object.keys(labels)) {
      const value = input?.[key];
      $('input-'+key).value = key === 'competitors' && Array.isArray(value) && value.every(v => typeof v === 'string') ? value.join('\n') : typeof value === 'string' ? value : '';
    }
  }
  for (const [key, label] of Object.entries(labels)) {
    const spec = schema.properties[key];
    const row = node('div');
    const lab = node('label', label + (schema.required.includes(key) ? ' (required)' : ''));
    lab.htmlFor = 'input-'+key;
    const input = node(spec.enum ? 'select' : key === 'company_name' ? 'input' : 'textarea');
    input.id = lab.htmlFor; input.name = key;
    if (spec.enum) for (const value of ['', ...spec.enum]) { const option = node('option', value || 'Not supplied'); option.value = value; input.append(option); }
    else input.maxLength = key === 'competitors' ? 100000 : 4000;
    if (schema.required.includes(key)) input.required = true;
    row.append(lab,input); $('fields').append(row);
  }
  for (const key of Object.keys(weights)) {
    const row = node('div',undefined,'weight-row');
    const label = node('label',key+' weight');label.htmlFor = 'weight-'+key;
    const input = node('input'); input.id=label.htmlFor; input.type='number';input.min='0';input.max='10';input.step='1';input.value='1';
    input.addEventListener('input', () => {claimLocalOwnership();weights[key] = input.value === '' ? NaN : Number(input.value);renderWeights();});
    row.append(label,input);$('weights').append(row);
  }
  function renderWeights() {
    const entries = Object.entries(weights);
    for (const [key] of entries) {
      document.querySelector('label[for="weight-'+key+'"]').textContent = key + (original?.completeness ? ' input detail '+original.completeness.scores[key]+'/100' : '') + ' / local weight';
    }
    if (entries.some(([,v]) => !Number.isInteger(v) || v < 0 || v > 10) || !entries.some(([,v]) => v > 0)) {
      $('scenario-score').textContent='Invalid local weights. Use whole numbers from 0 to 10 and at least one positive weight.';return;
    }
    if (!original?.completeness) {$('scenario-score').textContent='Calculate inputs before exploring local weights.';return;}
    const weighted = Math.round(entries.reduce((sum,[key,w]) => sum+original.completeness.scores[key]*w,0)/entries.reduce((sum,[,w])=>sum+w,0));
    $('scenario-score').textContent='Local what-if completeness: '+weighted+'/100. Original tool scoring is unchanged.';
  }
  function render(view, sourceLabel) {
    $('view-label').textContent=sourceLabel;
    $('evidence').replaceChildren();
    for (const item of view.evidence) {
      const card=node('article',undefined,'evidence-card');
      card.append(node('span',item.missing ? 'Missing evidence statement' : item.status,'status-label'),node('p',item.text),node('p',item.source+'. Not independently observed.','source'));
      $('evidence').append(card);
    }
    if (!view.evidence.length) $('evidence').textContent='No evidence supplied. Start with your own inputs.';
    $('missing').textContent = view.missing.join(', ') || 'All input fields are filled. This is not proof that any claim is validated.';
    $('original-score').textContent=view.completeness ? 'Original equal-weight input completeness: '+view.completeness.overall+'/100.' : 'No valid calculation yet.';
    $('alternatives').replaceChildren();
    for (const alt of view.alternatives) {const card=node('article',undefined,'alternative');card.append(node('h3',alt.name),node('p','Strategic fit: '+alt.strategicFit),node('p','Evidence confidence: '+alt.evidenceConfidence));$('alternatives').append(card);}
    if (!view.alternatives.length) $('alternatives').textContent='No alternatives supplied.';
    $('draft').textContent=view.decision?.draft || 'Add the product, customer and problem to explore a draft.';
    $('claim').textContent=view.decision?.doNotClaim || '';
    $('validation').textContent=view.decision?.minimumValidation || '';
    renderWeights();
  }
  function apply(input, label) { const view=calculate(input,schema); if (!view.valid) throw new Error(view.errors.join(' '));original=view;render(view,label); }
  function acceptResult(result) {
    if (!result || typeof result !== 'object' || result.isError) throw new Error('The host tool returned an error. Review inputs and retry.');
    const data=result.structuredContent;
    if (!data || data.version !== 1 || !data.inputs || typeof data.inputs !== 'object' || Array.isArray(data.inputs)) throw new Error('The host did not return supported structuredContent. Existing text remains available in the host.');
    // Recompute the view from supported raw inputs. Never trust remote markup, statuses or computed claims.
    if (typeof data.inputsBase64 !== 'string' || data.inputsBase64.length > 350000) throw new Error('Invalid encoded host inputs.');
    let input;
    try { input=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(data.inputsBase64), c=>c.charCodeAt(0)))); } catch { throw new Error('Invalid encoded host inputs.'); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid host inputs.');
    apply(input,'Host result from impact_full_audit. Reports remain unverified.');
    fillInputs(input);
    const text=Array.isArray(result.content) ? result.content.filter(v=>v?.type==='text' && typeof v.text==='string').map(v=>v.text).join('\n') : '';
    $('legacy-text').textContent=text;
  }
  function send(message) { window.parent.postMessage({jsonrpc:'2.0',...message},hostOrigin && hostOrigin !== 'null' ? hostOrigin : '*'); }
  function staleNotice() {
    $('stale-notice').textContent = 'Stale host update ignored. Your local inputs and last calculation were kept. Recalculate to update the result.';
  }
  function claimLocalOwnership() {
    localOwnership = true;
    editRevision++;
    error('');
  }
  // Measure natural body height, not scrollHeight, which cannot shrink below a tall iframe.
  let sizeTimer, sizeObserver, lastSize;
  function scheduleSize() {
    if (!embedded || !ready) return;
    clearTimeout(sizeTimer);
    sizeTimer = setTimeout(() => {
      const size = { width: Math.ceil(window.innerWidth), height: Math.ceil(document.body.getBoundingClientRect().height) };
      if (size.width > 0 && size.height > 0 && (!lastSize || size.width !== lastSize.width || size.height !== lastSize.height)) {
        lastSize = size;
        send({method:'ui/notifications/size-changed',params:size});
      }
    }, 75);
  }
  function observeSize() {
    sizeObserver = new ResizeObserver(scheduleSize);
    sizeObserver.observe(document.body);
    window.addEventListener('resize', scheduleSize);
    document.fonts.ready.then(scheduleSize);
    scheduleSize();
  }
  window.addEventListener('pagehide', () => {clearTimeout(sizeTimer);sizeObserver?.disconnect();window.removeEventListener('resize',scheduleSize);});
  function request(method,params) {
    const id=++requestId;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{pending.delete(id);reject(new Error(method==='ui/initialize'?'Host initialization timed out. Reopen this component.':'Tool request timed out. Your edits remain. Retry when the host is available.'));},15000);
      pending.set(id,{resolve,reject,timer});send({id,method,params});
    });
  }
  if (embedded) window.addEventListener('message', event => {
    if (event.source !== window.parent || hostOrigin && event.origin !== hostOrigin) return;
    const message=event.data;
    if (!message || message.jsonrpc !== '2.0') return;
    if ('id' in message && pending.has(message.id)) {
      // Bind the origin only after a matching initialization response from the actual parent.
      if (!hostOrigin && message.id === 1 && message.result) hostOrigin=event.origin;
      const p=pending.get(message.id);clearTimeout(p.timer);pending.delete(message.id);
      if (message.error) p.reject(new Error('Host request failed. Review your inputs and retry.'));else p.resolve(message.result);
      return;
    }
    if (!ready) return;
    if (localOwnership && ['ui/notifications/tool-input','ui/notifications/tool-result','ui/notifications/tool-cancelled'].includes(message.method)) {
      staleNotice();
      return;
    }
    try {
      if (message.method === 'ui/notifications/tool-input') {
        generation++;setBusy(false);const input=message.params?.arguments;
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid host inputs.');
        fillInputs(input);original=null;const waiting=calculate(input,schema);waiting.completeness=null;waiting.decision=null;render(waiting,'Host inputs received. Waiting for a tool result.');status('Host inputs received.');
      } else if (message.method === 'ui/notifications/tool-result') {
        generation++;setBusy(false);acceptResult(message.params);status('Host result loaded.');error('');
      } else if (message.method === 'ui/notifications/tool-cancelled') {
        generation++;setBusy(false);status('Host tool call was cancelled. Your edits remain.');
      }
    } catch (e) {error(e.message);}
  });
  $('audit-form').addEventListener('input',()=>{claimLocalOwnership();status('Inputs edited. Showing the last calculation until you recalculate.');});
  async function recalculate(event){
    event.preventDefault();if(busy || !ready)return;
    const input=readInputs(), view=calculate(input,schema);error('');
    if(!view.valid){error(view.errors.join(' '));return;}
    localOwnership = true;
    $('stale-notice').textContent = '';
    const revision=editRevision, ownGeneration=++generation;
    try {
      setBusy(true);status(embedded?'Loading host calculation...':'Calculating locally...');
      if (embedded) {
        const result=await request('tools/call',{name:'impact_full_audit',arguments:input});
        if(ownGeneration !== generation)return;
        if(revision !== editRevision){staleNotice();return;}
        acceptResult(result);$('stale-notice').textContent='';status('Host result loaded.');
      } else { apply(input,'Standalone calculation from your inputs. No external calls.');status('Calculated locally. Nothing saved.'); }
    } catch(e){
      if(ownGeneration !== generation)return;
      if(revision !== editRevision){staleNotice();return;}
      error(e.message);
    }
    finally {if(ownGeneration === generation)setBusy(false);}
  }
  $('audit-form').addEventListener('submit',recalculate);
  $('calculate').addEventListener('click',recalculate);
  $('reset').addEventListener('click',()=>{generation++;claimLocalOwnership();setBusy(false);$('stale-notice').textContent='';fillInputs({});original=null;render(calculate({},schema),'Empty state.');$('legacy-text').textContent='';error('');status('Cleared. Nothing saved.');});
  $('reset-weights').addEventListener('click',()=>{claimLocalOwnership();for(const key of Object.keys(weights)){weights[key]=1;$('weight-'+key).value='1';}renderWeights();});
  render(calculate({},schema),'Empty state.');
  $('mode').textContent=embedded?'MCP Apps mode / host calculation':'Standalone mode / no external calls';
  $('calculate').textContent=embedded?'Recalculate with host':'Calculate locally';setBusy(false);
  if(embedded){
    status('Connecting to host...');
    const initialRevision=editRevision, initialGeneration=generation;
    request('ui/initialize',{appInfo:{name:'Helix positioning lab',version:'1.0.0'},appCapabilities:{availableDisplayModes:['inline']},protocolVersion:'2026-01-26'}).then(result=>{
      if(!result || typeof result !== 'object')throw new Error('Invalid initialization response.');
      ready=true;send({method:'ui/notifications/initialized',params:{}});setBusy(false);observeSize();
      if(initialRevision===editRevision && initialGeneration===generation)status('Connected. Waiting for host inputs or your edits.');
    }).catch(e=>{if(initialRevision===editRevision && initialGeneration===generation)error(e.message);});
  } else status('Start empty. Add your product, customer and problem.');
})();
