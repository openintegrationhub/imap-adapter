/* eslint no-param-reassign: "off" */

/**
 * Copyright 2019 Wice GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// const Q = require('q');
const { transform } = require('@openintegrationhub/ferryman');

const { newMessage } = require('../helpers');
const { imapFetch } = require('./../utils/imap');
const { toOIHPerson } = require('./../utils/transformer');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  const { applicationUid } = cfg; // , domainId, schema

  const self = this;

  // Set the snapshot if it is not provided
  snapshot.lastUpdated = snapshot.lastUpdated || 1;

  async function handleResult(data, last) {
    try {
      if (data === false) {
        if (cfg.devMode) console.log('Skipping empty entry');
      } else if (data === true) {
        // All done let's make a snapshot
        snapshot.lastUpdated = parseInt(last.sequenceNumber, 10) + 1;
        snapshot.date = last.date;
        if (cfg.devMode) console.log(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
        self.emit('snapshot', snapshot);
      } else {
        if (cfg.devMode) console.log('data', data);
        // Prepare and emit entry

        // Transform raw data to OIH person format
        // const person = toOIHPerson(data);
        const transformedData = transform(data, cfg, toOIHPerson);

        /** Create an OIH meta object which is required
        * to make the Hub and Spoke architecture work properly
        */
        const oihMeta = {
          applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : undefined,
          // schema: (schema !== undefined && schema !== null) ? schema : undefined,
          // domainId: (domainId !== undefined && domainId !== null) ? domainId : undefined,
        };

        oihMeta.recordUid = data.email;

        const newElement = {};
        newElement.metadata = oihMeta;
        newElement.data = transformedData; // person;

        if (cfg.devMode) console.log('newElement', newElement);

        // Emit the object with meta and data properties
        self.emit('data', newMessage(newElement));
      }
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  async function emitData() {
    await imapFetch(cfg, snapshot.lastUpdated, handleResult);
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  async function emitError(e) {
    console.log(`ERROR: ${JSON.stringify(e)}`);
    self.emit('error', e);
  }

  /**
   * This method will be called from OIH platform
   * when the execution is finished successfully
   *
   */
  async function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  // Q()
  //   .then(emitData)
  //   .fail(emitError)
  //   .done(emitEnd);

  try {
    await emitData();
    await emitEnd();
  } catch (e) {
    console.error(JSON.stringify(e));
    emitError(e);
  }
}

module.exports = {
  process: processTrigger,
};
