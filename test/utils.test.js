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

    const person = await toOIHPerson(data);
    // console.log(JSON.stringify(person));
    expect(person).to.be.an('object');

    expect(person).to.deep.equal({
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
    });
  });

  it('should not crash if transform is missing data', async () => {
    const data = {};
    const person = await toOIHPerson(data);
    expect(person).to.equal(false);
  });
});
