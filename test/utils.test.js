/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { toOIHPerson } = require('../lib/utils/transformer');


describe('Utils - transformer toOIHPerson', () => {
  before(async () => {
  });

  it('should correctly transform a email header to the OIH Person format', async () => {
    const data = {
      date: ['Mon, 07 Sep 2020 09:37:45 GMT'],
      subject: ['Question about xy'],
      from: ['John Doe <johndoe@examplemail.com>'],
      to: ['thisaccount@examplemail.com'],
      name: 'John Doe',
      email: 'Google',
      recordUid: 36,
    };

    const msg = {
      recordUid: data.recordUid,
      operation: '',
      applicationUid: 'appUid not set yet',
      body: {
        meta: {
          iamToken: 'someToken',
          domainId: 'domainId',
          schema: 'someSchema',
        },
      },
    };

    const person = await toOIHPerson(msg, data);
    // console.log(JSON.stringify(person));
    expect(person).to.be.an('object');

    expect(person).to.deep.equal({
      meta: {
        recordUid: 36,
        applicationUid: 'appUid not set yet',
        iamToken: 'someToken',
        operation: '',
        domainId: 'domainId',
        schema: 'someSchema',
      },
      data: {
        firstName: 'John',
        lastName: 'Doe',
        position: '',
        title: '',
        photo: '',
        jobTitle: '',
        salutation: '',
        gender: '',
        birthday: '',
        displayName: '',
        middleName: '',
        nickname: '',
        contactData: [{
          type: 'email',
          value: 'Google',
        }],
        addresses: [],
      },
    });
  });

  it('should not crash if transform is missing data', async () => {
    const msg = {};
    const data = {};
    const person = await toOIHPerson(msg, data);
    expect(person).to.equal(false);
  });
});
