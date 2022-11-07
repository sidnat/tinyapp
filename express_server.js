/* eslint-disable camelcase */
const express = require("express");
const cookieSession = require("cookie-session");
const {
  generateRandomString,
  getUserByEmail,
  getUserByUserId,
  urlsForUser
} = require("./helpers");
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

// short url id with corresponding long url and userID
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

// login status check redirects to 'my urls' or login page
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = getUserByUserId(userID, users);

  if (loggedIn) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

// renders users "my urls", all short url id's owned by the logged in user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserByUserId(userID, users);

  // if user does not exist, return error message
  if (!user) {
    return res.send("<p>Please log in to view your Short URL ID's.</p>");
  }

  const templateVars = {
    user,
    urls: urlsForUser(userID, urlDatabase)
  };

  return res.render("urls_index", templateVars);
});

// creates new short url id and redirects to short url id page
app.post("/urls", (req, res) => {
  const loggedIn = getUserByUserId(req.session.user_id, users);

  if (!loggedIn) {
    return res.send("<p>Please register an account to create Short URL ID's.</p>");
  }

  const newId = generateRandomString();
  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  return res.redirect(`/urls/${newId}`);
});

// renders the page where you can create new tinyurl link
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserByUserId(userID, users);

  // if no user found, redirect to login page
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = { user };
  return res.render("urls_new", templateVars);
});

// renders short url id, edit page
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserByUserId(userID, users);

  // if no user found, redirect to login page
  if (!user) {
    return res.send("<p>Please login to view Short URL ID.</p>");
  }

  // if short id or long url does not exist, return error message
  if (!urlDatabase[req.params.id] || !urlDatabase[req.params.id].longURL) {
    return res.send("<p>No URL exists for this Short URL ID.</p>");
  }

  // if session user doesn't match user id stored in short url id, return error
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.send("<p>You do not own this Short URL ID.</p>");
  }

  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  return res.render("urls_show", templateVars);
});

// new url entered by user is updated for short url id
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = getUserByUserId(userID, users);

  // if short url or long url does not exist, return error message
  if (!urlDatabase[req.params.id] || !urlDatabase[req.params.id].longURL) {
    return res.send("<p>Short URL ID does not exist.</p>");
  }

  if (!loggedIn) {
    return res.send("<p>Please login to edit the Long URL.</p>");
  }
 
  // if session user is owner of short url id, update long url
  if (userID === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {
      longURL: req.body.urlId,
      userID: userID
    };
    return res.redirect("/urls");
  } else {
    return res.send("<p>You are not the owner of this Short URL ID.</p>");
  }
});

// redirects to long url corresponding to short url id
app.get("/u/:id", (req, res) => {

  // if short url id exists, redirect to long url
  if (urlDatabase[req.params.id]) {
    return res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    return res.send("<p>Short URL ID does not exist.</p>");
  }
});

// deletes short url id
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = getUserByUserId(userID, users);

  // if short id doesn't exist, return error message
  if (!urlDatabase[req.params.id]) {
    return res.send("<p>Short URL ID does not exist.</p>");
  }
  
  if (!loggedIn) {
    return res.send("<p>Please login to delete Short URL ID</p>");
  }

  // if session user is owner of short url id, delete short url id
  if (userID === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  } else {
    return res.send("<p>You are not the owner of this Short URL ID.</p>");
  }
});

// renders login page
app.get("/login", (req, res) => {
  const loggedIn = getUserByUserId(req.session.user_id, users);

  // if logged in, redirect to "my urls"
  if (loggedIn) {
    return res.redirect("/urls");
  }
  return res.render("urls_login");
});

// user enters information and logs in
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const authorizedUser = getUserByEmail(users, email);

  if (!authorizedUser) {
    return res.status(403).send("<p>User with that e-mail cannot be found.</p>");
  }

  // if password does not match with stored value, return error message
  if (!bcrypt.compareSync(password, authorizedUser.password)) {
    return res.status(403).send("<p>Password does not match.</p>");
  } else {
    req.session.user_id = authorizedUser.id;
    return res.redirect("/urls");
  }
});

// logs user out, clears session cookies, redirect to login page
app.post("/logout", (req, res) => {
  req.session = undefined;
  return res.redirect("/login");
});

// renders user registration page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = getUserByUserId(userID, users);
  
  if (loggedIn) {
    return res.redirect("/urls");
  }
  
  return res.render("urls_register");
});

// user submits data for registration, account is created
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // if either text field is empty, return error message
  if (!email || !password) {
    return res.status(400).send("<p>Email or Password field was left blank.</p>");
  }
  
  // if email exists in database, return error message
  if (getUserByEmail(users, email)) {
    return res.status(400).send("<p>Email is already in use.</p>");
  }
  
  const newUserId = generateRandomString();
  users[newUserId] = {
    id:  newUserId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = newUserId;
  
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});