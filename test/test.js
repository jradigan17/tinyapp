const { assert } = require('chai');

const { findKeyByValueEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findKeyByValueEmail', function() {
  it('should return a user with valid email', function() {
    const user = findKeyByValueEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(expectedUserID, user);
  });

  it('should return a user with valid email', function() {
    const user = findKeyByValueEmail(testUsers, "guinnessID")
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.equal(expectedUserID, user);
  });

});