// Function to look up users's email in the database
const findUserByEmail = (email, database) => {
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Function to generate random string for short URL
const generateRandomString = function() {
  const randomNumber = Math.random().toString(36).substr(2, 6);
  return randomNumber;
};

// Function to generate random user ID number
const generateRandomUserID = function(length) {
  let randomID = Math.floor(Math.random() * 1000);
  while (randomID.toString().length < length) {
    randomID = '0' + randomID;
  }
  return randomID;
};

// Function to look for urls that belong to a certain user ID
const urlsForUserID = (id, urlDatabase) => {
  const userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
};

module.exports = { findUserByEmail, generateRandomString, generateRandomUserID, urlsForUserID };