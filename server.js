//----------------------------------------------------------
// README -
// TODO - add light & dark mode
//      - invalid web address
//      - forgot password
//      - change password
//      - date created
//      - date modified
//      - favourites - sorting
//      - confirm delete
//      - clipboard to copy
//      - demo page
//      - add graphic
//      - add footer
//      - clean up server side & comments
//      - delete all cookies on exit
//      - home page
//      - tab title
//      - keep logged in
//      - shut down server
//----------------------------------------------------------

//----------------------------------------------------------
// Required aspects/files
const {conColor, conLine} = require('../../formatting/globalvar');
const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
const request = require('request');
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
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  // Cookie Options
  maxAge: 60 * 1000 // (24 * 60 * 60 * 1000) // 24 hours
}))
//----------------------------------------------------------

//----------------------------------------------------------
// Starting URL Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const userDatabase = {};
//----------------------------------------------------------

//----------------------------------------------------------
// Get Actions - Register Root Path & Other Paths
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    const data = urlsForUserID(req.session.userID);
    res.json(data);
  }
});

app.get("/urls", (req, res) => {
  const data = urlsForUserID(req.session.userID);
  const templateVars = {user: userDatabase[req.session.userID], urls: data};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
    res.render("urls_show", templateVars);
  }
});

app.get("/urls/:id/edit", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
    if (!req.session.userID) {
      res.redirect("/login");
    } else if (req.session.userID !== urlDatabase[req.params.id].userID) {
      res.redirect("/restricted");
    } else {
      res.render("urls_edit", templateVars);
    }
  }
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(`${longURL}`);
  }
});

app.get("/restricted", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  res.render(`urls_restricted`, templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  if (!req.session.userID) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/failedlogin", (req, res) => {
  const user = findKeyByValue(userDatabase, req.session.username);
  const templateVars = {user: userDatabase[req.session.userID], username: userDatabase[user]};
  req.session.username = null;
  res.render("urls_loginfail", templateVars);
});

app.get("/failedregister", (req, res) => {
  const tmpuser = {
    firstname: req.session.firstname,
    lastname: req.session.lastname,
    username: req.session.username,
    password: req.session.password,
    email: req.session.email,
    address1: req.session.address1,
    address2: req.session.address2,
    city: req.session.city,
    province: req.session.province,
    postalcode: req.session.postalcode};
  const templateVars = {user: userDatabase[req.session.userID], tmpuser, newuseremail: req.session.newuseremail, newusername: req.session.newusername};
  req.session.username = null
  req.session.firstname = null
  req.session.lastname = null
  req.session.username = null
  req.session.password = null
  req.session.email = null
  req.session.address1 = null
  req.session.address2 = null
  req.session.city = null
  req.session.province = null
  req.session.postalcode = null
  req.session.newuseremail = null
  req.session.newusername = null
  res.render("urls_registerfail", templateVars);
});

app.get("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect(`/login`);
});

app.get("/register", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  if (!req.session.userID) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/profile", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_profile", templateVars);
  }
});

app.get("/profile/edit", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_editprofile", templateVars);
  }
});

app.get("/invalid", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_newinvalid", templateVars);
  }
});

app.get("/urls/:id/invalid", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_invalidurl", templateVars);
  }
});

app.get("/profile/err", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], newuseremail: req.session.newuseremail, newusername: req.session.newusername};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    req.session.newuseremail = null
    req.session.newusername = null
    res.render("urls_editprofileerr", templateVars);
  }
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
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    let longURL = req.body.longURL.includes("http:") || req.body.longURL.includes("http:") ? req.body.longURL : 'http://' + req.body.longURL;
    request(longURL, (error, response, body) => {
      // Resource URL Checking
      if (response && response.statusCode === 404) {
        return res.redirect(`/invalid`)
      } else if (error) {
        return res.redirect(`/invalid`)
      } else {
        const id = generateRandomString();
        urlDatabase[id] = {longURL: longURL, userID: req.session.userID};
        res.redirect(`/urls/${id}`);
      }
    })
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect(`/urls`);
  }
});

app.post("/login", (req, res) => {
  res.redirect(`/login`);
});

app.post("/submitlogin", (req, res) => {
  const user = findKeyByValue(userDatabase, req.body.username);
  if (!user) {
    return res.redirect(`/failedlogin`);
  } else if (!bcrypt.compareSync(req.body.password, userDatabase[user].password)) {
    req.session.username = userDatabase[user].username;
    return res.redirect(`/failedlogin`);
  } else {
    req.session.userID = user;
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  req.session.username = null;
  res.redirect(`/login`);
});

app.post("/register", (req, res) => {
  res.redirect(`/register`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    if (!req.session.userID) {
      res.redirect("/login");
    } else if (req.session.userID !== urlDatabase[req.params.id].userID) {
      res.redirect("/restricted");
    } else {
      delete urlDatabase[req.params.id];
      res.redirect(`/urls`);
    }
  }
});

app.post("/urls/:id/view", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    res.redirect(`/urls/${req.params.id}`);
  }
});

app.post("/urls/:id/edit", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    if (!req.session.userID) {
      res.redirect("/login");
    } else if (req.session.userID !== urlDatabase[req.params.id].userID) {
      res.redirect("/restricted");
    } else {
      res.redirect(`/urls/${req.params.id}/edit`);
    }
  }
});

app.post("/urls/:id/update", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    if (!req.session.userID) {
      res.redirect("/login");
    } else if (req.session.userID !== urlDatabase[req.params.id].userID) {
      res.redirect("/restricted");
    } else {
      let longURL = req.body.longURL.includes("http:") || req.body.longURL.includes("http:") ? req.body.longURL : 'http://' + req.body.longURL;
      request(longURL, (error, response, body) => {
        // Resource URL Checking
        if (response && response.statusCode === 404) {
          return res.redirect(`/urls/${req.params.id}/invalid`)
        } else if (error) {
          return res.redirect(`/urls/${req.params.id}/invalid`)
        } else {
          urlDatabase[req.params.id] = {longURL: longURL, userID: req.session.userID};
          res.redirect(`/urls/${req.params.id}`);
        }
      })
    }
  }
});

app.post("/submitregister", (req, res) => {
  const newusername = findKeyByValue(userDatabase, req.body.username);
  const newuseremail =  findKeyByValueEmail(userDatabase, req.body.email);

  if (!newusername && !newuseremail) {
    const userID = generateRandomString();
    Object.assign(userDatabase, {[userID]: {userID: userID, firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, password: bcrypt.hashSync(req.body.password, 10), email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode}});
    req.session.userID = userID;
    res.redirect(`/profile`);
  } else if (newuseremail) {
    req.session.firstname = req.body.firstname
    req.session.lastname = req.body.lastname
    req.session.username = req.body.username
    req.session.password = req.body.password
    req.session.email = req.body.email
    req.session.address1 = req.body.address1
    req.session.address2 = req.body.address2
    req.session.city = req.body.city
    req.session.province = req.body.province
    req.session.postalcode = req.body.postalcode
    req.session.newuseremail = newuseremail
    return res.redirect(`/failedregister`);
  } else if (newusername) {
    req.session.firstname = req.body.firstname
    req.session.lastname = req.body.lastname
    req.session.username = req.body.username
    req.session.password = req.body.password
    req.session.email = req.body.email
    req.session.address1 = req.body.address1
    req.session.address2 = req.body.address2
    req.session.city = req.body.city
    req.session.province = req.body.province
    req.session.postalcode = req.body.postalcode
    req.session.newusername = newusername
    return res.redirect(`/failedregister`);
  }
});

app.post("/editprofile", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect(`/profile/edit`);
  }
});

app.post("/profileupdate", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    const email = findKeyByValueNumE(userDatabase, req.body.email);
    const username = findKeyByValueNumU(userDatabase, req.body.username);
    if ((email.length === 0 || (email.length === 1 && email[0] === req.session.userID)) && (username.length === 0 || (username.length === 1 && username[0] === req.session.userID))) {
      Object.assign(userDatabase[req.session.userID], {firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, username: req.body.username, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode});
      res.redirect(`/profile`);

    } else if ((username.length > 1 || username[0] !== req.session.userID) && (email.length > 1 || email[0] !== req.session.userID)) {
      Object.assign(userDatabase[req.session.userID], {firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode});
      req.session.newusername = req.body.username;
      req.session.newuseremail = req.body.email;
      res.redirect(`/profile/err`);

    } else if (email.length > 1 || email[0] !== req.session.userID) {
      Object.assign(userDatabase[req.session.userID], {firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode});
      req.session.newuseremail = req.body.email;
      res.redirect(`/profile/err`);

    } else if (username.length > 1 || username[0] !== req.session.userID) {
      Object.assign(userDatabase[req.session.userID], {firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode});
      req.session.newusername = req.body.username;
      res.redirect(`/profile/err`);
    }
  }
});

app.post("/deleteprofile", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    deleteUserIDurls(req.session.userID)
    delete userDatabase[req.session.userID];
    req.session.userID = null;
    res.redirect(`/urls`);
  }
});

app.post("/userprofile", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect(`/profile`);
  }
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
// Handling non matching request from the client
app.get("/PageNotFound", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], urls: urlDatabase};
  res.render("pageNotFound", templateVars);
});

app.use((req, res, next) => {
  res.status(404).redirect('/PageNotFound');
});
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
const urlsForUserID = (user) => {
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
const deleteUserIDurls = (user) => {
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === user) {
      delete urlDatabase[id];
    }
  }
};
//----------------------------------------------------------