// Tests for lib/signup-attribution.ts: which source a sign-up link carries.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { decorateSignupHref, firstTouchFrom } from './signup-attribution.ts';

const loc = (pathname: string, search = '') => ({ pathname, search, hostname: 'implexa.ai' });

test('external referrer is kept as a host only, with UTM tags', () => {
  const t = firstTouchFrom(
    loc('/blog/agents-md', '?utm_source=hn&utm_campaign=launch&q=secret'),
    'https://news.ycombinator.com/item?id=123',
  );
  assert.deepEqual(t, {
    lp: '/blog/agents-md', ref: 'news.ycombinator.com',
    utm_source: 'hn', utm_campaign: 'launch',
  });
});

test('an internal or missing referrer counts as direct', () => {
  assert.equal(firstTouchFrom(loc('/'), 'https://www.implexa.ai/pricing').ref, '');
  assert.equal(firstTouchFrom(loc('/'), '').ref, '');
});

test('signup links get the first touch and the clicked page', () => {
  const out = decorateSignupHref(
    'https://app.implexa.ai/signup?intent=build%20x',
    { lp: '/blog/agents-md', ref: 'google.com', utm_source: 'hn' },
    '/workflows/x',
  );
  const u = new URL(out!);
  assert.equal(u.searchParams.get('intent'), 'build x');
  assert.equal(u.searchParams.get('cta'), '/workflows/x');
  assert.equal(u.searchParams.get('lp'), '/blog/agents-md');
  assert.equal(u.searchParams.get('ref'), 'google.com');
  assert.equal(u.searchParams.get('utm_source'), 'hn');
});

test('parameters already on the link are not overwritten', () => {
  const out = decorateSignupHref(
    'https://app.implexa.ai/signup?utm_source=newsletter',
    { lp: '/', ref: '', utm_source: 'hn' },
    '/',
  );
  assert.equal(new URL(out!).searchParams.get('utm_source'), 'newsletter');
});

test('other links are left alone', () => {
  assert.equal(decorateSignupHref('https://app.implexa.ai/login', null, '/'), null);
  assert.equal(decorateSignupHref('https://implexa.ai/signup', null, '/'), null);
  assert.equal(decorateSignupHref('/pricing', null, '/'), null);
});
