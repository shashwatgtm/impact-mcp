import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { CHAIN_RESULTS_HTML } from '../dist/chain-results-html.js';
import handler from '../netlify/functions/mcp.mjs';

const brief = JSON.parse(readFileSync(new URL('./fixtures/segment-message-known.json', import.meta.url)));
async function call(args) {
  const response = await handler(new Request('https://unit.invalid/mcp', {
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'impact_build_segment_message', arguments: args } }),
  }));
  return (await response.json()).result;
}

function render(result, host) {
  const { window, document } = parseHTML(CHAIN_RESULTS_HTML);
  const messages = [];
  const parent = { postMessage: m => messages.push(m) };
  window.parent = host === 'openai' ? window : parent;
  window.openai = { toolResponseMetadata: result._meta };
  if (host === 'openai') window.openai.sendFollowUpMessage = ({ prompt }) => messages.push(prompt);
  const source = CHAIN_RESULTS_HTML.match(/<script>([\s\S]*?)<\/script>/)[1];
  document.body.getBoundingClientRect = () => ({ height: 700 });
  vm.runInNewContext(source, { window, document, setTimeout, clearTimeout, console });
  if (host === 'bridge') {
    const event = new window.Event('message');
    Object.assign(event, { source: parent, origin: 'https://host.invalid', data: { jsonrpc: '2.0', id: 'helix-results-init', result: {} } });
    window.dispatchEvent(event);
  }
  const buttons = [...document.querySelectorAll('#result button')];
  for (const button of buttons) button.click();
  const prompts = host === 'openai' ? messages : messages.filter(m => m.method === 'ui/message').map(m => m.params.content[0].text);
  return { document, buttons, prompts };
}

test('map choices carry their option number and result reference on both widget bridges', async () => {
  const map = await call({ stage: 'map', brief });
  assert.deepEqual(map.structuredContent.brief, brief);
  const ref = map.structuredContent.result_ref;
  assert.match(ref, /^[a-f0-9]{64}$/);
  for (const host of ['openai', 'bridge']) {
    const { prompts } = render(map, host);
    assert.deepEqual(prompts, [
      'Select champion option 1 for Helix result ' + ref + '.',
      ...map.structuredContent.alternative_choices.map((_, i) => 'Select alternative option ' + (i + 1) + ' for Helix result ' + ref + '.'),
    ]);
  }
});

test('handoff approval displays the destination and every shared field before sending a fixed choice', async () => {
  const map = await call({ stage: 'map', brief });
  const result = await call({ stage: 'message', brief, review_receipt: map.structuredContent.review_receipt,
    choices: { confirmed: true, champion: 'Operations lead', champion_segment: 'operations leads at ' + brief.segments[0], alternative: brief.alternatives[0] } });
  const { buttons, prompts } = render(result, 'openai');
  assert.ok(buttons.length > 0);
  for (const [i, action] of result.structuredContent.actions.entries()) {
    const panel = buttons[i].closest('details');
    assert.ok(panel.textContent.includes(action.destination));
    for (const value of Object.values(action.fields)) {
      assert.ok(panel.textContent.includes(Array.isArray(value) ? value.join('\n') : String(value)));
    }
    assert.equal(prompts[i], 'Approve the displayed fields for ' + action.destination + ' for Helix result ' + result.structuredContent.result_ref + '.');
  }
});
