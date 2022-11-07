// return alphanumeric string, 6 characters long
const generateRandomString = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

// returns user object by searching email
const getUserByEmail = (users, email) => {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
};

// returns user object by searching id
const getUserByUserId = (userId, users) => {
  return users[userId];
};

// returns all short url id's owned by user
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
  getUserByUserId,
  urlsForUser
};