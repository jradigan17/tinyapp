//----------------------------------------------------------
// README -
// TODO - add light & dark mode
//      - required fields need to be filled in
//      - invalid web address
//      - check if username already exists
//      - forgot password
//      - change password
//      - date created
//      - date modified
//      - favourites - sorting
//      - confirm delete
//      - clipboard to copy
//      - demo page
//      - add grphic
//      - add footer
//----------------------------------------------------------

//----------------------------------------------------------
// Required aspects/files
const {conColor, conLine} = require('../../formatting/globalvar');
const express = require("express");
const cookieParser = require('cookie-parser');
const readline = require('readline');
const fs = require('fs');
//----------------------------------------------------------

//----------------------------------------------------------
// console.clear();
console.log(`${conLine.fullLineDash(conColor.orange)}`);
//----------------------------------------------------------

//----------------------------------------------------------
// Define our app as an instance of express & Define Port
const app = express();
const PORT = 1052; // default port 8080 // Define our base URL as http:\\localhost:1052
app.set("view engine", "ejs"); // Use EJs as view engine
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//----------------------------------------------------------

//----------------------------------------------------------
// Starting URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {};
//----------------------------------------------------------

//----------------------------------------------------------
// Get Actions - Register Root Path & Other Paths
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID], urls: urlDatabase};
  res.render("urls_index", templateVars);
  // console.log(req.cookies)
  // console.log(templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID]};
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID], id: req.params.id, longURL: urlDatabase[req.params.id]/* What goes here? */ };
  // console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.get("/urls/:id/edit", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID], id: req.params.id, longURL: urlDatabase[req.params.id]/* What goes here? */ };
  // console.log(templateVars)
  res.render("urls_edit", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // console.log(longURL);
  res.redirect(`${longURL}`);
});

app.get("/login", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID]}
  res.render("urls_login", templateVars);
});

app.get("/failedlogin", (req, res) => {
  const user = findKeyByValue(userDatabase, req.cookies.username)
  console.log(user)
    const templateVars = {user: userDatabase[req.cookies.userID], username: userDatabase[user]}
    res.clearCookie('username')
    res.render("urls_loginfail", templateVars);
});

app.get("/failedregister", (req, res) => {
  const tmpuser = {
    firstname: req.cookies.firstname, 
    lastname: req.cookies.lastname, 
    username: req.cookies.username, 
    password: req.cookies.password, 
    email: req.cookies.email, 
    address1: req.cookies.address1, 
    address2: req.cookies.address2, 
    city: req.cookies.city, 
    province: req.cookies.province, 
    postalcode: req.cookies.postalcode}
  const templateVars = {user: userDatabase[req.cookies.userID], tmpuser, newuseremail: req.cookies.newuseremail, newusername: req.cookies.newusername}
    res.clearCookie('username')
    res.clearCookie('firstname') 
    res.clearCookie('lastname')
    res.clearCookie('username') 
    res.clearCookie('password') 
    res.clearCookie('email')
    res.clearCookie('address1') 
    res.clearCookie('address2') 
    res.clearCookie('city')
    res.clearCookie('province') 
    res.clearCookie('postalcode') 
    res.clearCookie('newuseremail')
    res.clearCookie('newusername')
    res.render("urls_registerfail", templateVars);
});

app.get("/logout", (req, res) => {
  res.clearCookie('userID')
  // console.log(req.cookies)
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID]}
  res.render("urls_register", templateVars);
});

app.get("/profile", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID]}
  res.render("urls_profile", templateVars);
});

app.get("/profile/edit", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID]}
  res.render("urls_editprofile", templateVars);
});

app.get("/profile/err", (req, res) => {
  const templateVars = {user: userDatabase[req.cookies.userID], newuseremail: req.cookies.newuseremail, newusername: req.cookies.newusername}
  res.clearCookie('newuseremail')
  res.clearCookie('newusername')
  res.render("urls_editprofileerr", templateVars);
});
//----------------------------------------------------------

//----------------------------------------------------------
// Server Listening on PORT
app.listen(PORT, () => {
  console.log(`${conColor.blue}Example app listening on port ${PORT}!${conColor.reset}`);
});
//----------------------------------------------------------

//----------------------------------------------------------
// Post Actions
app.post("/urls/new", (req, res) => {
  let longURL = req.body.longURL.includes("http:") || req.body.longURL.includes("http:") ? req.body.longURL : 'http://' + req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.post("/urls", (req, res) => {
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.redirect(`/login`);
});

app.post("/submitlogin", (req, res) => {
  const user = findKeyByValue(userDatabase, req.body.username)
  console.log("submitlogin", user)
  if (!user) {
    return res.redirect(`/failedlogin`)
  } else if (req.body.password !== userDatabase[user].password) {
    res.cookie("username", userDatabase[user].username)
    console.log(userDatabase[user])
    return res.redirect(`/failedlogin`)
  } else {
  res.cookie("userID", user)
  res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  // console.log(req.cookies)
  console.log(userDatabase)
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  console.log(userDatabase)
  res.redirect(`/register`);
});

app.post("/urls/:id/delete", (req, res) => {
  // console.log(req.params.id);
  delete urlDatabase[req.params.id];
  // console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post("/urls/:id/view", (req, res) => {
  // console.log(req.params.id);
  // console.log(urlDatabase);
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/urls/:id/edit", (req, res) => {
  res.redirect(`/urls/${req.params.id}/edit`);
});

app.post("/urls/:id/update", (req, res) => {
  let longURL = req.body.longURL.includes("http:") || req.body.longURL.includes("http:") ? req.body.longURL : 'http://' + req.body.longURL;
  // console.log(req.params.id);
  urlDatabase[req.params.id] = longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/submitregister", (req, res) => {
  const newusername = findKeyByValue(userDatabase, req.body.username)
  const newuseremail =  findKeyByValueEmail(userDatabase, req.body.email)

  console.log(newusername, newuseremail)
  if (!newusername && !newuseremail) {
    const userID = generateRandomString()
    Object.assign(userDatabase, {[userID]: {userID: userID, firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, password: req.body.password, email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode}})
    res.cookie("userID", userID)
    res.redirect(`/urls`);
  } else if (newuseremail) {
    res.cookie("firstname", req.body.firstname)
    res.cookie("lastname", req.body.lastname)
    res.cookie("username", req.body.username)
    res.cookie("password", req.body.password)
    res.cookie("email", req.body.email)
    res.cookie("address1", req.body.address1) 
    res.cookie("address2", req.body.address2) 
    res.cookie("city", req.body.city)
    res.cookie("province", req.body.province)
    res.cookie("postalcode", req.body.postalcode)
    res.cookie("newuseremail", newuseremail)
    return res.redirect(`/failedregister`)
  } else if (newusername) {
    res.cookie("firstname", req.body.firstname)
    res.cookie("lastname", req.body.lastname)
    res.cookie("username", req.body.username)
    res.cookie("password", req.body.password)
    res.cookie("email", req.body.email)
    res.cookie("address1", req.body.address1) 
    res.cookie("address2", req.body.address2) 
    res.cookie("city", req.body.city)
    res.cookie("province", req.body.province)
    res.cookie("postalcode", req.body.postalcode)
    res.cookie("newusername", newusername)
    return res.redirect(`/failedregister`)
  } 
});

app.post("/editprofile", (req, res) => {
  res.redirect(`/profile/edit`);
});

app.post("/profileupdate", (req, res) => {
  const email = findKeyByValueNumE(userDatabase, req.body.email);
  const username = findKeyByValueNumU(userDatabase, req.body.username);
  console.log(email);
  console.log(username);
  if ((email.length === 0 || (email.length === 1 && email[0] === req.cookies.userID)) && (username.length === 0 || (username.length === 1 && username[0] === req.cookies.userID))) {
    Object.assign(userDatabase[req.cookies.userID], {firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, username: req.body.username, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode})
    console.log(userDatabase)
    res.redirect(`/profile`);
    
  } else if ((username.length > 1 || username[0] !== req.cookies.userID) && (email.length > 1 || email[0] !== req.cookies.userID)) {
    Object.assign(userDatabase[req.cookies.userID], {firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode})
    res.cookie("newusername", req.body.username)
    res.cookie("newuseremail", req.body.email)
    res.redirect(`/profile/err`);

  } else if (email.length > 1 || email[0] !== req.cookies.userID) {
    Object.assign(userDatabase[req.cookies.userID], {firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode})
    res.cookie("newuseremail", req.body.email)
    res.redirect(`/profile/err`);

  } else if (username.length > 1 || username[0] !== req.cookies.userID) {
    Object.assign(userDatabase[req.cookies.userID], {firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode})
    res.cookie("newusername", req.body.username)
    res.redirect(`/profile/err`);
  }
});


app.post("/deleteprofile", (req, res) => {
  console.log("info", req.body)
  delete userDatabase[req.cookies.userID]
  console.log(userDatabase);
  res.clearCookie("userID")
  res.redirect(`/urls`);
});

app.post("/userprofile", (req, res) => {
  res.redirect(`/profile`);
});
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
const findKeyByValue = function(object, value) {
  for (let item in object) {
    if (value === object[item].username) {
      return item;
    }
  }
};

const findKeyByValueEmail = function(object, value) {
  for (let item in object) {
    if (value === object[item].email) {
      return item;
    }
  }
};

const findKeyByValueNumE = function(object, value) {
  let array = [];
  for (let item in object) {
    if (value === object[item].email) {
      array.push(item);
    }
  }
  return array;
};

const findKeyByValueNumU = function(object, value) {
  let array = [];
  for (let item in object) {
    if (value === object[item].username) {
      array.push(item);
    }
  }
  return array;
};
//----------------------------------------------------------
