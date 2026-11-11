import json,re,hashlib,base64
from pathlib import Path
repo=Path(__file__).resolve().parents[1]
h=(repo/'scripts/chain-results-base.html').read_text()
# This is a derived copy of the pinned shared results view. The old resource is kept.
extra='''
 function chain(){const root=$('result'),c=data.chain??{};
  const add=(title,lines)=>{const box=make('section');box.append(make('h2',title));for(const line of lines??[])box.append(make('p',line));root.append(box);return box;};
  const show=(title,text)=>{const item=make('details');item.append(make('summary',title),make('pre',text));root.append(item);};
  if(c.checks){const box=add('Answer card',[c.status==='held'?'Drafts held. Complete the proof card first.':'First drafts. Check each result before using it.']);if(c.checks.length)grid(box,['Asset','Sentence check'],c.checks.map(x=>[x.asset,x.status]));}
  if(c.proof_gaps)add('Proof gaps',c.proof_gaps);
  if(c.status_quo_questions)add('Questions about the current approach',c.status_quo_questions);
  if(c.answer)add('Answer card',[c.answer]);
  if(c.role_questions)add('Confirm the champion',c.role_questions);
  if(c.proof_card){const box=add('Check this first',c.gaps);grid(box,['Proof card field','Your evidence'],c.proof_card);}
  if(c.buyer_lines){const box=add('Message: first draft',c.buyer_lines);}
  if(c.champion_map)show('Champion map: role hypotheses',c.champion_map);
  if(c.alternatives_map)show('Alternatives map: notes to test',c.alternatives_map);
  if(c.proof_plan)add('Proof plan',c.proof_plan);
  if(c.warnings?.length)add('Check the wording',c.warnings);
  if(c.category_question)add('Test the category',[c.category_question]);
  if(c.buyer_test_questions)add('Test with five buyers',c.buyer_test_questions);
  if(c.steps?.length){add('Steps and handoffs',[]);for(const step of c.steps)show(step.tool,typeof step.passed==='string'?step.passed:JSON.stringify(step.passed,null,2));}
  if(c.assets)for(const asset of c.assets)show(asset.name+': first draft',asset.text);
  if(c.checks)for(const check of c.checks){const lines=[...(check.flags??[]),...(check.date_issues??[]),...(check.derived_numbers??[]).map(x=>'Number not on the card: '+x),...(check.missing_view??[]).map(x=>'Missing view sentence: '+x)];if(lines.length)add(check.asset+': review these lines',lines);}
  add('Read before you use this',['The server check preserves the supplied words. Read every factual sentence against its source. It does not establish meaning or independent verification. The full server response is below.']);
  const actions=c.actions??[];
  if(actions.length){const box=add('Continue in chat',[]);
   for(const action of actions){const button=make('button',action.label);button.type='button';button.addEventListener('click',()=>{
    if(window.openai?.sendFollowUpMessage){window.openai.sendFollowUpMessage({prompt:action.prompt});}
    else if(ready){window.parent.postMessage({jsonrpc:'2.0',id:'chain-message-'+actions.indexOf(action),method:'ui/message',params:{role:'user',content:[{type:'text',text:action.prompt}]}},hostOrigin);}
    else{$('status').textContent='Continue in the conversation: '+action.prompt;}
   });box.append(button);}}
 }
'''
h=h.replace(' function render(view)',extra+' function render(view)')
h=h.replace("'content_repurposer'].includes(view.tool)","'content_repurposer','customer_result_to_content','impact_build_segment_message'].includes(view.tool)")
h=h.replace('content_repurposer:content})','content_repurposer:content,customer_result_to_content:chain,impact_build_segment_message:chain})')
h=h.replace('HELIX GTM CONSULTING','Helix GTM Consulting')
h=h.replace('--ink:#1a0e10;--paper:#faf8f6','--ink:#1D1416;--paper:#FBF7F1').replace('Archivo,Arial,sans-serif','"Instrument Sans",Arial,sans-serif')
h=h.replace('h2{font-size:1.3rem}', 'h1,h2,h3{font-family:Fraunces,Georgia,serif}h2{font-size:1.3rem}')
h=h.replace('letter-spacing:.1em;font-size:12px','font-size:14px')
h=h.replace('border:1px solid #ead9d5','border:1px solid #EADFD6')
h=h.replace('header{border-bottom:4px solid var(--ox)}','header{border-bottom:4px solid var(--ox);background:linear-gradient(110deg,#F2C6BF,#F8E1DA,#F3F0EB,#D8E8EE)}')
h=h.replace('@media print','button{border-radius:10px;margin:6px 8px 6px 0;white-space:normal;overflow-wrap:anywhere}section{min-width:0}pre{font-family:inherit}body{overflow-wrap:anywhere}@media print')

# Self-contained fonts keep the view offline and follow Helix Paper.
fonts=[]
for family,name in [('Fraunces','fraunces'),('Instrument Sans','instrumentsans')]:
 data=base64.b64encode((repo/'public/assets/fonts'/('chain-'+name+'-normal-latin.woff2')).read_bytes()).decode()
 fonts.append("@font-face{font-family:'"+family+"';src:url(data:font/woff2;base64,"+data+") format('woff2');font-weight:100 900;font-display:swap}")
h=h.replace('<style>','<style>'+''.join(fonts)).replace("base-uri 'none'","font-src data:; base-uri 'none'")

# Recompute the shared view's CSP hashes after adding display-only parts.
for tag,key in [('script','script-src'),('style','style-src')]:
 code=re.search('<'+tag+'>([\\s\\S]*?)</'+tag+'>',h).group(1)
 digest=base64.b64encode(hashlib.sha256(code.encode()).digest()).decode()
 h=re.sub(key+r" 'sha256-[^']+'",key+" 'sha256-"+digest+"'",h)
(repo/'src/chain-results-html.ts').write_text('// Derived from the pinned Helix results v1 view. New chain resource only.\nexport const CHAIN_RESULTS_HTML = '+json.dumps(h)+';\n')

