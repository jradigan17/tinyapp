//----------------------------------------------------------
// TO DO
//      - add light & dark mode
//      - tab title icon
//      - favourites - sorting
//      - confirm delete
//      - demo page
//      - server side responses/cookie monster
//      - delete all cookies on exit
//      - keep logged in
//      - shut down server
//      - add more mocha chai tests
//      - bar chart
//      - forgot password/password reset w/ email
//----------------------------------------------------------

//----------------------------------------------------------
// Required aspects/files
const {conColor, conLine} = require('../../formatting/globalvar');
const {myDateObject} = require('./dateobject');
const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const request = require('request');
const fs = require('fs');
const methodOverride = require('method-override');
const rfs = require("rotating-file-stream");
const { generateRandomString, findKeyByValue, findKeyByValueEmail, findKeyByValueNumE, findKeyByValueNumU, urlsForUserID, deleteUserIDurls, visitlog} = require('./helper');
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
app.use(express.urlencoded({ extended: true })); // parses body of forms into json
app.use(express.static("public")); // Enable public folder
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  // Cookie Options
  maxAge: 60 * 60 * 1000 // (24 * 60 * 60 * 1000) // 24 hours
})); // Cookies
app.use(methodOverride('_method')); // override POST having ?_method=DELETE
//----------------------------------------------------------

//----------------------------------------------------------
// Starting URL Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    visit: 0,
    datalog: [],
    dateCreated: myDateObject.dateFull(),
    dateModified: ""
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visit: 0,
    datalog: [],
    dateCreated: myDateObject.dateFull(),
    dateModified: ""
  },
};

const userDatabase = {};
//----------------------------------------------------------

//----------------------------------------------------------
// Check Server Quiet or Server Log
let quiet = false;
let log = false;
for (let x = 0; x < process.argv.length; x ++) {
  if (process.argv[x] === '-quiet') {
    quiet = true;
  }
  if (process.argv[x] === '-logfile') {
    log = true;
  }
}
//----------------------------------------------------------


//----------------------------------------------------------
// Write to Log File & Console
if (!quiet) {
  app.use(morgan(':date[web] :method :url :status :res[content-length] - :response-time ms'));
}

if (log) {
  const rfsStream = rfs.createStream("tinyapp.log", {
    size: '10M', // rotate every 10 MegaBytes written
    interval: '30m', // rotate after 2 minutes
  });

  app.use(morgan(':date[web] :method :url :status :res[content-length] - :response-time ms', { stream: rfsStream }));
}
//----------------------------------------------------------

//----------------------------------------------------------
// Get Actions - Register Root Path
app.get("/", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});
//----------------------------------------------------------

//----------------------------------------------------------
// Get Actions - URLs
app.get("/urls.json", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    const data = urlsForUserID(req.session.userID, urlDatabase);
    res.json(data);
  }
});

app.get("/urls", (req, res) => {
  const data = urlsForUserID(req.session.userID, urlDatabase);
  const templateVars = {user: userDatabase[req.session.userID], urls: data};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], invalid : false};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL, visit: urlDatabase[req.params.id].visit, dateCreated: urlDatabase[req.params.id].dateCreated, dateModified: urlDatabase[req.params.id].dateModified, datalog: visitlog(urlDatabase[req.params.id].datalog), runninglog: urlDatabase[req.params.id].datalog};
    if (urlDatabase[req.params.id].userID !== req.session.userID) {
      templateVars.access = "restricted";
    } else {
      templateVars.access = "valid";
    }

    res.render("urls_show", templateVars);
  }
});

app.get("/urls/:id/edit", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL, invalid: false};
    if (!req.session.userID) {
      res.redirect("/login");
    } else if (req.session.userID !== urlDatabase[req.params.id].userID) {
      res.render(`urls_restricted`, templateVars);
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
    urlDatabase[req.params.id].visit += 1;
    let myobject = {};
    if (!req.session.userID && !req.session.visitor) {
      myobject.userID = '*' + generateRandomString();
      req.session.visitor = myobject.userID;
    } else if (req.session.userID) {
      myobject.userID = [req.session.userID];
    } else {
      myobject.userID = [req.session.visitor];
    }
    myobject.dateCreated = myDateObject.dateFull();
    urlDatabase[req.params.id].datalog.push(myobject);
    res.redirect(`${longURL}`);
  }
});
//----------------------------------------------------------

//----------------------------------------------------------
// Get Actions - Login/Logout
app.get("/login", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], username: true, password: true};
  if (!req.session.userID) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/logout", (req, res) => {
  if (log) {
    fs.appendFile('tinyapp.log', JSON.stringify(urlDatabase), function(err) {
      if (err) {
        console.log(err);
      }
    });
    fs.appendFile('tinyapp.log', JSON.stringify(userDatabase), function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
  if (!quiet) {
    console.log(urlDatabase);
    console.log(userDatabase);
  }
  req.session.userID = null;
  res.redirect(`/login`);
});
//----------------------------------------------------------

//----------------------------------------------------------
// Get Actions - Register
app.get("/register", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], newusername: false, newuseremail: false, tmpuser: {}};
  if (!req.session.userID) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});
//----------------------------------------------------------

//----------------------------------------------------------
// Get Actions - Profile & Password
app.get("/profile", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID]};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_profile", templateVars);
  }
});

app.get("/profile/edit", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], newuseremail: false, newusername: false};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_editprofile", templateVars);
  }
});

app.get("/profile/password", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], currentpassword: true};
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_password", templateVars);
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
// Post/Put/Delete Actions - URLs
app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect(`/urls`);
  }
});

app.post("/urls/new", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    let longURL = req.body.longURL.includes("http:") || req.body.longURL.includes("http:") ? req.body.longURL : 'http://' + req.body.longURL;
    request(longURL, (error, response, body) => {
      // Resource URL Checking
      if (response && response.statusCode === 404) {
        const templateVars = {user: userDatabase[req.session.userID], invalid: true};
        res.render("urls_new", templateVars);
      } else if (error) {
        const templateVars = {user: userDatabase[req.session.userID], invalid: true};
        res.render("urls_new", templateVars);
      } else {
        const id = generateRandomString();
        urlDatabase[id] = {longURL: longURL, userID: req.session.userID, visit: 0, datalog: [], dateCreated: myDateObject.dateFull(), dateModified: ""};
        res.redirect(`/urls/${id}`);
      }
    });
  }
});

app.delete("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    if (!req.session.userID) {
      res.redirect("/login");
    } else if (req.session.userID !== urlDatabase[req.params.id].userID) {
      const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
      res.render(`urls_restricted`, templateVars);
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
      const templateVars = {user: userDatabase[req.session.userID]};
      res.render(`urls_restricted`, templateVars);
    } else {
      res.redirect(`/urls/${req.params.id}/edit`);
    }
  }
});

app.put("/urls/:id/update", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).redirect('/PageNotFound');
  } else {
    if (!req.session.userID) {
      res.redirect("/login");
    } else if (req.session.userID !== urlDatabase[req.params.id].userID) {
      const templateVars = {user: userDatabase[req.session.userID]};
      res.render(`urls_restricted`, templateVars);
    } else {
      let longURL = req.body.longURL.includes("http:") || req.body.longURL.includes("http:") ? req.body.longURL : 'http://' + req.body.longURL;
      request(longURL, (error, response, body) => {
        // Resource URL Checking
        if (response && response.statusCode === 404) {
          const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL, invalid: true};
          return res.render("urls_edit", templateVars);
        } else if (error) {
          const templateVars = {user: userDatabase[req.session.userID], id: req.params.id, longURL: urlDatabase[req.params.id].longURL, invalid: true};
          return res.render("urls_edit", templateVars);
        } else {
          urlDatabase[req.params.id] = {longURL: longURL, userID: req.session.userID, visit: urlDatabase[req.params.id].visit, datalog: urlDatabase[req.params.id].datalog, dateCreated: urlDatabase[req.params.id].dateCreated, dateModified: myDateObject.dateFull()};
          res.redirect(`/urls/${req.params.id}`);
        }
      });
    }
  }
});
//----------------------------------------------------------

//----------------------------------------------------------
// Post Actions - Login
app.post("/login", (req, res) => {
  res.redirect(`/login`);
});

app.post("/submitlogin", (req, res) => {
  const user = findKeyByValue(userDatabase, req.body.username);
  if (!user) {
    const templateVars = {user: userDatabase[req.session.userID], username: false, password: false};
    return res.render("urls_login", templateVars);
  } else if (!bcrypt.compareSync(req.body.password, userDatabase[user].password)) {
    const templateVars = {user: userDatabase[req.session.userID], username: req.body.username, password: false};
    return res.render("urls_login", templateVars);
  } else {
    req.session.userID = user;
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  req.session.username = null;
  res.redirect(`/login`);
});
//----------------------------------------------------------

//----------------------------------------------------------
// Post Actions - Register
app.post("/register", (req, res) => {
  res.redirect(`/register`);
});

app.post("/submitregister", (req, res) => {
  const newusername = findKeyByValue(userDatabase, req.body.username);
  const newuseremail =  findKeyByValueEmail(userDatabase, req.body.email);

  if (!newusername && !newuseremail) {
    const userID = generateRandomString();
    Object.assign(userDatabase, {[userID]: {userID: userID, firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, password: bcrypt.hashSync(req.body.password, 10), email: req.body.email, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode}});
    req.session.userID = userID;
    res.redirect(`/profile`);
  } else {
    const tmpuser = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      province: req.body.province,
      postalcode: req.body.postalcode};
    const templateVars = {user: userDatabase[req.session.userID], newusername: newusername, newuseremail: newuseremail, tmpuser: tmpuser};
    return res.render("urls_register", templateVars);
  }
});
//----------------------------------------------------------

//----------------------------------------------------------
// Post/Put/Delete Actions - User Profile
app.post("/userprofile", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect(`/profile`);
  }
});

app.post("/editprofile", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect(`/profile/edit`);
  }
});

app.put("/profileupdate", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    const email = findKeyByValueNumE(userDatabase, req.body.email);
    const username = findKeyByValueNumU(userDatabase, req.body.username);
    const tmpuser = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      province: req.body.province,
      postalcode: req.body.postalcode};
    if ((email.length === 0 || (email.length === 1 && email[0] === req.session.userID)) && (username.length === 0 || (username.length === 1 && username[0] === req.session.userID))) {
      Object.assign(userDatabase[req.session.userID], {firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, username: req.body.username, address1: req.body.address1, address2: req.body.address2, city: req.body.city, province: req.body.province, postalcode: req.body.postalcode});
      res.redirect(`/profile`);

    } else if ((username.length > 1 || username[0] !== req.session.userID) && (email.length > 1 || email[0] !== req.session.userID)) {
      const templateVars = {user: userDatabase[req.session.userID], newusername: req.body.username, newuseremail: req.body.email, tmpuser: tmpuser};
      return res.render("urls_editprofile", templateVars);

    } else if (email.length > 1 || email[0] !== req.session.userID) {
      const templateVars = {user: userDatabase[req.session.userID], newusername: false, newuseremail: req.body.email, tmpuser: tmpuser};
      return res.render("urls_editprofile", templateVars);

    } else if (username.length > 1 || username[0] !== req.session.userID) {
      const templateVars = {user: userDatabase[req.session.userID], newusername: req.body.username, newuseremail: false, tmpuser: tmpuser};
      return res.render("urls_editprofile", templateVars);
    }
  }
});

app.put("/passwordreset", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else if (!bcrypt.compareSync(req.body.currentpassword, userDatabase[req.session.userID].password)) {
    const templateVars = {user: userDatabase[req.session.userID], currentpassword: false};
    return res.render("urls_password", templateVars);
  } else {
    userDatabase[req.session.userID].password = bcrypt.hashSync(req.body.newpassword, 10)
    res.redirect(`/urls`);
  }
});

app.delete("/deleteprofile", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    deleteUserIDurls(req.session.userID, urlDatabase);
    delete userDatabase[req.session.userID];
    req.session.userID = null;
    res.redirect(`/urls`);
  }
});
//----------------------------------------------------------


//----------------------------------------------------------
// Handling non matching request from the client
app.get("/PageNotFound", (req, res) => {
  const templateVars = {user: userDatabase[req.session.userID], urls: urlDatabase};
  res.render("pageNotFound", templateVars);
});

app.use((req, res, next) => {
  return res.status(404).redirect('/PageNotFound');
});
//----------------------------------------------------------


