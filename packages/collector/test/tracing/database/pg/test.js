'use strict';

const expect = require('chai').expect;

const constants = require('@instana/core').tracing.constants;
const supportedVersion = require('@instana/core').tracing.supportedVersion;
const config = require('../../../config');
const utils = require('../../../utils');

describe('tracing/pg', function() {
  if (!supportedVersion(process.versions.node)) {
    return;
  }

  const expressPgControls = require('./controls');
  const agentStubControls = require('../../../apps/agentStubControls');

  this.timeout(config.getTestTimeout());

  agentStubControls.registerTestHooks();
  expressPgControls.registerTestHooks();

  beforeEach(() => agentStubControls.waitUntilAppIsCompletelyInitialized(expressPgControls.getPid()));

  it('must trace pooled select now', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/select-now-pool',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('SELECT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].now).to.be.a('string');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('SELECT NOW()');
          })
        );
      }));

  it('must trace non-pooled query with callback', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/select-now-no-pool-callback',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('SELECT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].now).to.be.a('string');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('SELECT NOW()');
          })
        );
      }));

  it('must trace non-pooled query with promise', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/select-now-no-pool-promise',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('SELECT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].now).to.be.a('string');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('SELECT NOW()');
          })
        );
      }));

  it('must trace string based pool insert', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/pool-string-insert',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('INSERT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].name).to.equal('beaker');
        expect(response.rows[0].email).to.equal('beaker@muppets.com');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('INSERT INTO users(name, email) VALUES($1, $2) RETURNING *');
          })
        );
      }));

  it('must trace config object based pool select', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/pool-config-select',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('SELECT');
        expect(response.rowCount).to.be.a('number');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('SELECT name, email FROM users');
          })
        );
      }));

  it('must trace promise based pool select', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/pool-config-select-promise',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('INSERT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].name).to.equal('beaker');
        expect(response.rows[0].email).to.equal('beaker@muppets.com');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('INSERT INTO users(name, email) VALUES($1, $2) RETURNING *');
          })
        );
      }));

  it('must trace string based client insert', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/client-string-insert',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('INSERT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].name).to.equal('beaker');
        expect(response.rows[0].email).to.equal('beaker@muppets.com');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('INSERT INTO users(name, email) VALUES($1, $2) RETURNING *');
          })
        );
      }));

  it('must trace config object based client select', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/client-config-select',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('SELECT');
        expect(response.rowCount).to.be.a('number');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(false);
            expect(pgSpan.ec).to.equal(0);
            expect(pgSpan.data.pg.stmt).to.equal('SELECT name, email FROM users');
          })
        );
      }));

  it('must capture errors', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/table-doesnt-exist',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.name).to.equal('StatusCodeError');
        expect(response.statusCode).to.equal(500);
        // 42P01 -> PostgreSQL's code for "relation does not exist"
        expect(response.message).to.include('42P01');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(1);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.t).to.equal(entrySpan.t);
            expect(pgSpan.p).to.equal(entrySpan.s);
            expect(pgSpan.n).to.equal('postgres');
            expect(pgSpan.k).to.equal(constants.EXIT);
            expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan.async).to.equal(false);
            expect(pgSpan.error).to.equal(true);
            // expect(pgSpan.data.pg.error).to.equal('blah');
            expect(pgSpan.ec).to.equal(1);
            expect(pgSpan.data.pg.stmt).to.equal('SELECT name, email FROM nonexistanttable');
          })
        );
      }));

  it('must not break vanilla postgres (not tracing)', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/pool-string-insert',
        suppressTracing: true
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('INSERT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].name).to.equal('beaker');
        expect(response.rows[0].email).to.equal('beaker@muppets.com');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(0);
            expect(pgSpans).to.have.lengthOf(0);

            expect(response.rows).to.lengthOf(1);
            expect(response.rows[0].name).to.equal('beaker');
            expect(response.rows[0].email).to.equal('beaker@muppets.com');
          })
        );
      }));

  it('must trace transactions', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/transaction',
        body: {}
      })
      .then(response => {
        expect(response).to.exist;
        expect(response.command).to.equal('INSERT');
        expect(response.rowCount).to.equal(1);
        expect(response.rows.length).to.equal(1);
        expect(response.rows[0].name).to.equal('trans2');
        expect(response.rows[0].email).to.equal('nodejstests@blah');

        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(1);
            expect(pgSpans).to.have.lengthOf(4);

            const entrySpan = entrySpans[0];
            const pgSpan1 = pgSpans[0];
            const pgSpan2 = pgSpans[1];
            const pgSpan3 = pgSpans[2];
            const pgSpan4 = pgSpans[3];

            expect(pgSpan1.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan1.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan1.t).to.equal(entrySpan.t);
            expect(pgSpan1.p).to.equal(entrySpan.s);
            expect(pgSpan1.n).to.equal('postgres');
            expect(pgSpan1.k).to.equal(constants.EXIT);
            expect(pgSpan1.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan1.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan1.async).to.equal(false);
            expect(pgSpan1.error).to.equal(false);
            expect(pgSpan1.ec).to.equal(0);
            expect(pgSpan1.data.pg.stmt).to.equal('BEGIN');

            expect(pgSpan2.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan2.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan2.t).to.equal(entrySpan.t);
            expect(pgSpan2.p).to.equal(entrySpan.s);
            expect(pgSpan2.n).to.equal('postgres');
            expect(pgSpan2.k).to.equal(constants.EXIT);
            expect(pgSpan2.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan2.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan2.async).to.equal(false);
            expect(pgSpan2.error).to.equal(false);
            expect(pgSpan2.ec).to.equal(0);
            expect(pgSpan2.data.pg.stmt).to.equal('INSERT INTO users(name, email) VALUES($1, $2) RETURNING *');

            expect(pgSpan3.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan3.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan3.t).to.equal(entrySpan.t);
            expect(pgSpan3.p).to.equal(entrySpan.s);
            expect(pgSpan3.n).to.equal('postgres');
            expect(pgSpan3.k).to.equal(constants.EXIT);
            expect(pgSpan3.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan3.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan3.async).to.equal(false);
            expect(pgSpan3.error).to.equal(false);
            expect(pgSpan3.ec).to.equal(0);
            expect(pgSpan3.data.pg.stmt).to.equal('INSERT INTO users(name, email) VALUES($1, $2) RETURNING *');

            expect(pgSpan4.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan4.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan4.t).to.equal(entrySpan.t);
            expect(pgSpan4.p).to.equal(entrySpan.s);
            expect(pgSpan4.n).to.equal('postgres');
            expect(pgSpan4.k).to.equal(constants.EXIT);
            expect(pgSpan4.f.e).to.equal(String(expressPgControls.getPid()));
            expect(pgSpan4.f.h).to.equal('agent-stub-uuid');
            expect(pgSpan4.async).to.equal(false);
            expect(pgSpan4.error).to.equal(false);
            expect(pgSpan4.ec).to.equal(0);
            expect(pgSpan4.data.pg.stmt).to.equal('COMMIT');
          })
        );
      }));
});
