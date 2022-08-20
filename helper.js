//----------------------------------------------------------
// Helper functions to Server.js for TinyApp
//----------------------------------------------------------

//----------------------------------------------------------
// Generate Random 6 Character Alphanumeric String - 0-9 & A-Z & a-z
const generateRandomString = () => {
  let choice = [];
  let random = "";
  for (let i = 48; i < 58; i ++) {
    choice.push(i);
  }
  for (let j = 65; j < 91; j ++) {
    choice.push(j);
  }
  for (let y = 97; y < 123; y ++) {
    choice.push(y);
  }
  for (let x = 0; x < 6; x++) {
    random += String.fromCharCode(choice[Math.floor(Math.random() * (choice.length))]);
  }
  return random;
};
//----------------------------------------------------------


//----------------------------------------------------------
// Object Key Search
const findKeyByValue = (object, value) => {
  for (let item in object) {
    if (value === object[item].username) {
      return item;
    }
  }
};

const findKeyByValueEmail = (object, value) => {
  for (let item in object) {
    if (value === object[item].email) {
      return item;
    }
  }
};

const findKeyByValueNumE = (object, value) => {
  let array = [];
  for (let item in object) {
    if (value === object[item].email) {
      array.push(item);
    }
  }
  return array;
};

const findKeyByValueNumU = (object, value) => {
  let array = [];
  for (let item in object) {
    if (value === object[item].username) {
      array.push(item);
    }
  }
  return array;
};
//----------------------------------------------------------

//----------------------------------------------------------
// Object Key Search - URLs to User
const urlsForUserID = (user, urlDatabase) => {
  let data = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === user) {
      Object.assign(data, {[id] : urlDatabase[id]});
    }
  }
  return data;
};
//----------------------------------------------------------

//----------------------------------------------------------
// Object Key Search - Delete User URLs
const deleteUserIDurls = (user, urlDatabase) => {
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === user) {
      delete urlDatabase[id];
    }
  }
};
//----------------------------------------------------------

module.exports = {
  generateRandomString,
  findKeyByValue,
  findKeyByValueEmail,
  findKeyByValueNumE,
  findKeyByValueNumU,
  urlsForUserID,
  deleteUserIDurls
};