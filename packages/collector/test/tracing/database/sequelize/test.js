'use strict';

const expect = require('chai').expect;

const constants = require('@instana/core').tracing.constants;
const supportedVersion = require('@instana/core').tracing.supportedVersion;
const config = require('../../../config');
const utils = require('../../../utils');

describe('tracing/sequelize', function() {
  if (!supportedVersion(process.versions.node)) {
    return;
  }

  const expressPgControls = require('./controls');
  const agentStubControls = require('../../../apps/agentStubControls');

  this.timeout(config.getTestTimeout());

  agentStubControls.registerTestHooks();
  expressPgControls.registerTestHooks();

  beforeEach(() => agentStubControls.waitUntilAppIsCompletelyInitialized(expressPgControls.getPid()));

  it('must fetch', () =>
    expressPgControls
      .sendRequest({
        method: 'GET',
        path: '/regents'
      })
      .then(response => {
        expect(response).to.exist;
        expect(Array.isArray(response)).to.be.true;
        expect(response.length).to.be.gte(1);
        expect(response[0].firstName).to.equal('Irene');
        expect(response[0].lastName).to.equal('Sarantapechaina');

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
            expect(pgSpan.data.pg.stmt).to.contain('FROM "regents"');
          })
        );
      }));

  it('must write', () =>
    expressPgControls
      .sendRequest({
        method: 'POST',
        path: '/regents',
        body: {
          firstName: 'Martina',
          lastName: '-'
        }
      })
      .then(() =>
        expressPgControls.sendRequest({
          method: 'GET',
          path: '/regents?firstName=Martina'
        })
      )
      .then(response => {
        expect(response).to.exist;
        expect(Array.isArray(response)).to.be.true;
        expect(response.length).to.be.gte(1);
        expect(response[0].firstName).to.equal('Martina');
        expect(response[0].lastName).to.equal('-');
        return utils.retry(() =>
          agentStubControls.getSpans().then(spans => {
            const entrySpans = utils.getSpansByName(spans, 'node.http.server');
            const pgSpans = utils.getSpansByName(spans, 'postgres');

            expect(entrySpans).to.have.lengthOf(2);
            expect(pgSpans.length).to.be.gte(2);

            const entrySpan = entrySpans[0];
            const pgSpan = pgSpans[0];

            for (let i = 0; i < pgSpans.length - 1; i++) {
              expect(entrySpan.data.http.method).to.equal('POST');
              expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
              expect(pgSpan.f.h).to.equal('agent-stub-uuid');
              expect(pgSpan.t).to.equal(entrySpan.t);
              // The last pgSpan should be the read span triggered by HTTP GET, all others are triggered by HTTP POST
              // when writing the value.
              expect(pgSpan.p).to.equal(entrySpan.s);
              expect(pgSpan.n).to.equal('postgres');
              expect(pgSpan.k).to.equal(constants.EXIT);
              expect(pgSpan.f.e).to.equal(String(expressPgControls.getPid()));
              expect(pgSpan.f.h).to.equal('agent-stub-uuid');
              expect(pgSpan.async).to.equal(false);
              expect(pgSpan.error).to.equal(false);
              expect(pgSpan.ec).to.equal(0);
            }
          })
        );
      }));
});
