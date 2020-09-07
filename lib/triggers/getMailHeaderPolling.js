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
  const { applicationUid, domainId, schema } = cfg;

  const self = this;

  // Set the snapshot if it is not provided
  snapshot.lastUpdated = snapshot.lastUpdated || 1;

  async function handleResult(data, last) {
    if (data === false) {
      console.log('Skipping empty entry');
    } else if (data === true) {
      // All done let's make a snapshot
      snapshot.lastUpdated = parseInt(last.sequenceNumber, 10) + 1;
      snapshot.date = last.date;
      console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
      self.emit('snapshot', snapshot);
    } else {
      // Prepare and emit entry

      // Transform raw data to OIH person format
      const person = toOIHPerson(data);

      /** Create an OIH meta object which is required
      * to make the Hub and Spoke architecture work properly
      */
      const oihMeta = {
        applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : undefined,
        schema: (schema !== undefined && schema !== null) ? schema : undefined,
        domainId: (domainId !== undefined && domainId !== null) ? domainId : undefined,
      };

      oihMeta.recordUid = data.recordUid;

      const newElement = {};
      newElement.meta = oihMeta;
      newElement.data = person;

      console.log('newElement', newElement);

      // Emit the object with meta and data properties
      self.emit('data', newMessage(newElement));
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
    console.log(`ERROR: ${e}`);
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
    console.error(e);
    emitError(e);
  }
}

module.exports = {
  process: processTrigger,
};
