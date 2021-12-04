const { assert } = require("chai");

const { urlsForUserID } = require('../helpers');

const testDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: '100' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '200' },
  'aY83nj': { longURL: 'http://http.cat', userID: '100' }
};


describe('urlsForUserID', () => {
  it('should return 2 urls that belong userID 100', () => {
    const userURL = urlsForUserID('100', testDatabase);
    const expectedOutput = {
      b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: '100' },
      aY83nj: { longURL: 'http://http.cat', userID: '100' }
    };
    assert.deepEqual(userURL, expectedOutput);
  });

  it('should return 1 url that belong userID 200', () => {
    const userURL = urlsForUserID('200', testDatabase);
    const expectedOutput = { '9sm5xK': { longURL: 'http://www.google.com', userID: '200' }};
    assert.deepEqual(userURL, expectedOutput);
  });
});