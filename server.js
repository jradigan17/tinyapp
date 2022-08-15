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
  let id = generateRandomString();
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
  let user = findKeyByValue(userDatabase, req.body.username)
  res.cookie("userID", user)
  // res.cookie('username', req.body.username)
  // console.log(req.cookies)
  res.redirect(`/urls`);
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
  let userID = generateRandomString()
  Object.assign(userDatabase, {[userID]: {userID: userID, firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, password: req.body.password, email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode}})
  res.cookie("userID", userID)
  // res.cookie('username', req.body.username)
  console.log(userDatabase)
  res.redirect(`/urls`);
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

const findKeyByValue = function(object, value) {
  for (let item in object) {
    if (value === object[item].username) {
      return item;
    }
  }
};