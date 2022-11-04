const generateRandomString = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

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
  return undefined;
};

const userExists = (userId, users) => {
  return users[userId];
};

const urlsForUser = (id, urlDatabase) => {
  const usersURLs = {};

  for (let urlID in urlDatabase) {
    if (id === urlDatabase[urlID].userID) {
      usersURLs[urlID] = urlDatabase[urlID];
    }
  }
  return usersURLs;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  userExists,
  urlsForUser
};