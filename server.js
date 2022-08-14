//----------------------------------------------------------
// README - 
// TODO - add light & dark mode
//----------------------------------------------------------

//----------------------------------------------------------
// Required aspects/files
const {conColor, conLine} = require('../../formatting/globalvar');
const express = require("express");
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
//----------------------------------------------------------

//----------------------------------------------------------
// Starting URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//----------------------------------------------------------

//----------------------------------------------------------
// Register Root Path & Other Paths
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]/* What goes here? */ };
  // console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  console.log(longURL)
  res.redirect(`${longURL}`);
});
//----------------------------------------------------------

//----------------------------------------------------------
// Server Listening on PORT
app.listen(PORT, () => {
  console.log(`${conColor.blue}Example app listening on port ${PORT}!${conColor.reset}`);
});
//----------------------------------------------------------

//----------------------------------------------------------
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL.includes("http:") || req.body.longURL.includes("http:") ? req.body.longURL : 'http://' + req.body.longURL;
  let id = generateRandomString()
  urlDatabase[id] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`)
});
//----------------------------------------------------------

//----------------------------------------------------------
// Generate Random 6 Character Alphanumeric String - 0-9 & A-Z & a-z
function generateRandomString() {
  let choice = []
  let random = ""
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
}