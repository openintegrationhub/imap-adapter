
function toOIHPerson(msg, data) {
  const name = (data.name) ? data.name.trim() : '';
  const nameParts = name.split(' ');

  let firstName = '';
  let lastName = '';
  if (nameParts.length > 1) {
    lastName = nameParts.pop();
    firstName = nameParts.join(' ');
  } else {
    firstName = name;
  }

  const person = {
    meta: {
      recordUid: data.recordUid,
      operation: (msg.body && msg.body.operation) ? msg.body.operation : '',
      applicationUid: (msg.body && msg.body.meta.applicationUid !== undefined && msg.body.meta.applicationUid !== null)
        ? msg.body.meta.applicationUid : 'appUid not set yet',
      iamToken: (msg.body && msg.body.meta.iamToken !== undefined && msg.body.meta.iamToken !== null) ? msg.body.meta.iamToken : undefined,
      domainId: (msg.body && msg.body.meta.domainId !== undefined && msg.body.meta.domainId !== null) ? msg.body.meta.domainId : undefined,
      schema: (msg.body && msg.body.meta.schema !== undefined && msg.body.meta.schema !== null) ? msg.body.meta.schema : undefined,
    },
    data: {
      firstName,
      lastName,
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
      contactData: [
        {
          type: 'email',
          value: data.email,
        },
      ],
      addresses: [],
    },
  };

  if (!('recordUid' in person.meta) || typeof person.meta.recordUid === 'undefined') return false;

  return person;
}

module.exports = {
  toOIHPerson,
};
