
function toOIHPerson(data) {
  if (!data.email || data.email.trim() === '') return false;

  const name = (data.name) ? data.name.trim() : data.email.split('@')[0].replace(/[.\-_]+/g, ' ');
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
  };

  return person;
}

module.exports = {
  toOIHPerson,
};
