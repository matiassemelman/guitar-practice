import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { APP_MODE, canUsePrivateApi, getAppMode } from '../lib/app-mode.mjs';
import {
  AIRequestValidationError,
  parseAIAnalysisRequest,
} from '../lib/ai-request-validation.mjs';

test('runtime mode fails closed', () => {
  assert.equal(getAppMode(undefined), APP_MODE.DISABLED);
  assert.equal(getAppMode(''), APP_MODE.DISABLED);
  assert.equal(getAppMode('unexpected'), APP_MODE.DISABLED);
  assert.equal(canUsePrivateApi(undefined), false);
  assert.equal(canUsePrivateApi('demo'), false);
  assert.equal(canUsePrivateApi('private'), true);
});

test('AI request accepts only the bounded allowlist', () => {
  assert.deepEqual(
    parseAIAnalysisRequest({
      analysisTypes: ['patterns', 'experiments'],
      sessionLimit: 5,
    }),
    {
      analysisTypes: ['patterns', 'experiments'],
      sessionLimit: 5,
    }
  );

  assert.deepEqual(
    parseAIAnalysisRequest({ analysisTypes: ['strengths'] }),
    {
      analysisTypes: ['strengths'],
      sessionLimit: 30,
    }
  );
});

for (const [name, payload] of [
  ['empty types', { analysisTypes: [] }],
  ['unknown type', { analysisTypes: ['anything'] }],
  ['duplicate types', { analysisTypes: ['patterns', 'patterns'] }],
  ['zero limit', { analysisTypes: ['patterns'], sessionLimit: 0 }],
  ['large limit', { analysisTypes: ['patterns'], sessionLimit: 31 }],
  ['fractional limit', { analysisTypes: ['patterns'], sessionLimit: 1.5 }],
]) {
  test(`AI request rejects ${name}`, () => {
    assert.throws(() => parseAIAnalysisRequest(payload), AIRequestValidationError);
  });
}

test('AI output has no raw HTML sink', async () => {
  const modal = await readFile('app/components/AIAnalysisModal.tsx', 'utf8');
  const renderer = await readFile('app/components/SafeAnalysisText.tsx', 'utf8');

  assert.doesNotMatch(modal, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(renderer, /dangerouslySetInnerHTML|innerHTML\s*=/);
});

test('public demo is fixture-only and the DB diagnostic route is absent', async () => {
  const demo = await readFile('app/components/PublicDemo.tsx', 'utf8');

  assert.doesNotMatch(demo, /fetch\s*\(|\/api\//);
  await assert.rejects(access('app/api/test/route.ts'));
});
