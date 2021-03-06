/* global Promise */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const supportedVersion = require('@instana/core').tracing.supportedVersion;

const config = require('./config');
const utils = require('./utils');

describe('setLogger', function() {
  if (!supportedVersion(process.versions.node)) {
    return;
  }

  const agentStubControls = require('./apps/agentStubControls');
  const expressControls = require('./apps/expressControls');

  this.timeout(config.getTestTimeout());

  agentStubControls.registerTestHooks();
  expressControls.registerTestHooks();

  const dummyLogFile = path.join(os.tmpdir(), 'instana-nodejs-dummy-test.log');

  afterEach(() => {
    fs.unlinkSync(dummyLogFile);
  });

  it('must reinitialize all loggers on setLogger', () => {
    expressControls.setLogger(false, dummyLogFile);
    return utils.retry(
      () =>
        new Promise((resolve, reject) => {
          fs.readFile(dummyLogFile, 'utf-8', (err, data) => {
            if (err) {
              return reject(err);
            }
            // wait for arbitrary number of characters to be written
            if (data.length > 50) {
              resolve(data);
            } else {
              reject(new Error(`Did not log enough: ${data}`));
            }
          });
        })
    );
  });
});
