const { assert } = require('chai');

const { findUserByEmail } = require('../helpers');

const testUsers = {
  '100': {
    id: '100',
    email: 'a@email.com',
    password: '123'
  },
  '200': {
    id: '200',
    email: 'b@email.com',
    password: '234'
  }
};

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail('a@email.com', testUsers);
    const expectedOutput = '100';
    assert.strictEqual(user.id, expectedOutput);
  });

  it('should return undefined when email is not exist in the databse', () => {
    const user = findUserByEmail('c@email.com', testUsers);
    assert.strictEqual(user, undefined);
  });
});