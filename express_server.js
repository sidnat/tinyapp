const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "abc123": {
    id: "abc123",
    email: "abc@gmail.com",
    password: "password"
  }
};

const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

const getUserByEmail = (users, email) => {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return false;
};

const userExists = (userId) => {
  return users[userId];
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = userExists(userId);
  if (!loggedIn) {
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = userExists(userId);
  if (!loggedIn) {
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = {
    user,
    userId
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = userExists(userId);
  if (!loggedIn) {
    return res.redirect("/login");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("No url exists for this short url id.");
  }
  const user = users[userId];
  const templateVars = {
    user,
    userId,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const loggedIn = userExists(req.cookies['user_id']);
  if (!loggedIn) {
    return res.send("Please register an account to shortify urls.");
  }
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id]);
  } else {
    res.send('short url id does not exist');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = userExists(userId);
  if (!loggedIn) {
    return res.redirect("/login");
  }
  urlDatabase[req.params.id] = req.body.urlId;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const loggedIn = userExists(req.cookies['user_id']);
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
    return res.status(403).send('User with that e-mail cannot be found,');
  } else if (!bcrypt.compareSync(password, authorizedUser.password)) {
    return res.status(403).send('Password does not match');
  } else {
    res.cookie("user_id", authorizedUser.id).redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = userExists(userId);
  if (loggedIn) {
    return res.redirect("/urls");
  }
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Email or password field left blank');
  } else if (getUserByEmail(users, email)) {
    return res.status(400).send('Email already in use');
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id:  newUserId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  res.cookie('user_id', newUserId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});