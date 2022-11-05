/* eslint-disable camelcase */
const express = require("express");
const cookieSession = require("cookie-session");
const { generateRandomString, getUserByEmail, userExists, urlsForUser } = require("./helpers");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["fdj3i42o2k3ggdger644212"],
  maxAge: 24 * 60 * 60 * 1000
}));

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "abc@gmail.com",
    password: bcrypt.hashSync("password", 10)
  }
};

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = userExists(userID, users);
  if (loggedIn) {
    return res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = userExists(userID, users);
  if (!loggedIn) {
    return res.send("<p>Please log in to view your short urls.</p>");
  }
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlsForUser(userID, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const loggedIn = userExists(req.session.user_id, users);
  if (!loggedIn) {
    return res.send("<p>Please register an account to tiny-ify urls.</p>");
  }
  const newId = generateRandomString();
  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${newId}`);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = userExists(userID, users);
  if (!loggedIn) {
    return res.redirect("/login");
  }
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = userExists(userID, users);
  if (!loggedIn) {
    return res.send("<p>Please login to view shortened URL.</p>");
  }
  if (!urlDatabase[req.params.id] || !urlDatabase[req.params.id].longURL) {
    return res.send("<p>No URL exists for this shortened URL id.</p>");
  }
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.send("<p>You do not own this shortened URL id.</p>");
  }
  const user = users[userID];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = userExists(userID, users);
  if (!urlDatabase[req.params.id] || !urlDatabase[req.params.id].longURL) {
    return res.send("<p>Short URL id does not exist.</p>");
  } else if (!loggedIn) {
    return res.send("<p>Please login to edit URL.</p>");
  } else if (userID === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {
      longURL: req.body.urlId,
      userID: userID
    };
    return res.redirect("/urls");
  } else {
    return res.send("<p>You are not the owner of this shortened URL.</p>");
  }
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id].longURL) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    res.send("<p>short url id does not exist</p>");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = userExists(userID, users);
  if (!urlDatabase[req.params.id]) {
    return res.send("<p>Short URL id does not exist and will not be deleted</p>");
  } else if (!loggedIn) {
    return res.send("<p>Please login to delete URL</p>");
  } else if (userID === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  } else {
    return res.send("<p>You are not the owner of this URL, it cannot be deleted.</p>");
  }
});

app.get("/login", (req, res) => {
  const loggedIn = userExists(req.session.user_id, users);
  if (loggedIn) {
    return res.redirect("/urls");
  }
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const authorizedUser = getUserByEmail(users, email);
  if (!authorizedUser) {
    return res.status(403).send("<p>User with that e-mail cannot be found.</p>");
  } else if (!bcrypt.compareSync(password, authorizedUser.password)) {
    return res.status(403).send("<p>Password does not match.</p>");
  } else {
    req.session.user_id = authorizedUser.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = undefined;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = userExists(userID, users);
  if (loggedIn) {
    return res.redirect("/urls");
  }
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("<p>Email or password field left blank</p>");
  } else if (getUserByEmail(users, email)) {
    return res.status(400).send("<p>Email already in use</p>");
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id:  newUserId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = newUserId;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});