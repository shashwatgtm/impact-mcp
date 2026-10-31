// Present only sections actually emitted by the original server tool. No new scoring.
function section(text:string,heading:string):string {const start=text.indexOf('\n## '+heading+'\n');if(start<0)return '';const from=start+heading.length+5,next=text.indexOf('\n## ',from);return text.slice(from,next<0?undefined:next).trim();}
export function auditSummary(text:string){
 const positioning=section(text,'Recommended Positioning');const draft=positioning.split('\n').filter(line=>/^>\s/.test(line)).map(line=>line.replace(/^>\s?/,''));
 const work=section(text,'Areas to work on next'),gaps=[];const groups=work.split(/\n(?=### )/);
 const labels:Record<string,string>={Identify:'Buyer detail',Map:'Alternatives',Pinpoint:'Value and difference',Anchor:'Target market',Craft:'Current message',Translate:'Customer feedback'};
 for(const group of groups){const heading=/^### (\w+) \((\d+)\/100\)/m.exec(group);if(!heading)continue;const detail=/\*\*Input\*\*:\s*([^\n]+)/.exec(group)?.[1]??(/This input is already detailed: sharpen it next\./.exec(group)?.[0]??'Review the original tool text for this input.');const action=/\*\*Action\*\*:\s*([^\n]+)/.exec(group)?.[1]??'';gaps.push({label:labels[heading[1]]??heading[1],detail,action});}
 const proof=section(text,'Proof You Already Have').replace(/\n---\s*$/,'').trim();
 if(!draft.length||!gaps.length)return {kind:'unavailable',reason:'A focused summary is unavailable. Review the complete tool result.'};
 return {kind:'positioning-audit',label:'Draft positioning to test',draft,gaps,nextAction:gaps[0].action,proof,qualification:'This is generated from your inputs. Test the wording with buyers and verify each proof point. The original score measures input detail, not positioning strength.'};
}
