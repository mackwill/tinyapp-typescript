const bcrypt = require("bcrypt");

// Generate a random string to assign to the shortened URL
const generateRandomString = (length: number): string => {
  return Math.random().toString(36).substr(2, length);
};

// Get current date and return in MM/DD/YYYY format
const createCurrentDate = (): string => {
  let currentDate: Date = new Date();
  return `${currentDate.getMonth()}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
};

// Check if user with provided email is in the database
const findUserByEmail = (
  providedEmail: string,
  database: object
): string | undefined => {
  for (let user in database) {
    if (database[user].email === providedEmail) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let filteredURLs = {};

  Object.keys(database).forEach((url) => {
    if (database[url].userID === id) {
      filteredURLs[url] = {
        longURL: database[url].longURL,
        created: database[url].dateCreated,
        numVisits: database[url].visits,
      };
    }
  });

  return filteredURLs;
};

const checkForExistingShortURL = (shortURL, database, users, id) => {
  let templateVars = {};

  if (database[shortURL] === undefined) {
    templateVars = { user: undefined, error: `Please enter a valid shortURL` };
  } else {
    templateVars = {
      shortURL: shortURL,
      longURL: database[shortURL].longURL,
      user: users[id],
      created: database[shortURL].dateCreated,
      error: null,
      numVisits: database[shortURL].visits,
    };
  }

  return templateVars;
};

const authenticateUser = (email, database, plainPass) => {
  const selectedUser = findUserByEmail(email, database);
  if (selectedUser === undefined) {
    let msg = "You do not seem to have an account with us.";
    return msg;
  } else if (!bcrypt.compareSync(plainPass, database[selectedUser].password)) {
    let msg = `The provided details do not match our records.`;
    return msg;
  }
  return true;
};

const registerUser = (email, plainPass, database) => {
  if (email === "" || plainPass === "") {
    return "Please fill in all fields.";
  } else if (findUserByEmail(email, database)) {
    return `This user already has an account.`;
  }
  return true;
};

const isValidShortUrl = (user, database, shortURL) => {
  if (user === undefined) {
    return `Please log in to view your shortURLs`;
  }
  let urls = urlsForUser(user.id, database);
  if (!Object.keys(urls).includes(shortURL)) {
    return "Please enter a valid shortURL.";
  }
  return true;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  createCurrentDate,
  checkForExistingShortURL,
  authenticateUser,
  registerUser,
  isValidShortUrl,
};
