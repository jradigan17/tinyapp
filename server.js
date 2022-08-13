//----------------------------------------------------------
// README - 
//----------------------------------------------------------

//----------------------------------------------------------
// Required aspects/files
const {conColor, conLine} = require('../../formatting/globalvar');
const express = require("express");
const readline = require('readline');
const fs = require('fs');
//----------------------------------------------------------

//----------------------------------------------------------
console.clear();
console.log(`${conLine.fullLineDash(conColor.orange)}`);
//----------------------------------------------------------

//----------------------------------------------------------
// Define our app as an instance of express & Define Port
const app = express();
const PORT = 1052; // default port 8080 // Define our base URL as http:\\localhost:1052
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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//----------------------------------------------------------

//----------------------------------------------------------
// Server Listening on PORT
app.listen(PORT, () => {
  console.log(`${conColor.blue}Example app listening on port ${PORT}!${conColor.reset}`);
});
//----------------------------------------------------------
