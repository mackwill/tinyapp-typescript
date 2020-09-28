const bcrypt = require("bcrypt");

interface IDatabaseObject {
  longURL: string;
  userID: string | null;
  dateCreated: string;
  visits: number;
}

interface IDatabase {
  [key: string]: IDatabaseObject;
}

interface IUsersObject {
  id: string;
  email: string;
  password: string;
}

interface IUsers {
  [key: string]: IUsersObject;
}

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
  users: IUsers
): string | undefined => {
  for (let user in users) {
    if (users[user].email === providedEmail) {
      return user;
    }
  }
  return undefined;
};

interface IFilteredURL {
  longURL: string | "";
  created: string | "";
  numVisits: number | null;
}

const urlsForUser = (id: string, database: IDatabase): IFilteredURL => {
  let filteredURLs: IFilteredURL = {
    longURL: "",
    created: "",
    numVisits: null,
  };

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

const checkForExistingShortURL = (
  shortURL: string,
  database: object,
  users: IUsers,
  id: string
): object => {
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

const authenticateUser = (
  email: string,
  database: IUsers,
  plainPass: string
): string | true => {
  const selectedUser = findUserByEmail(email, database);
  if (selectedUser === undefined) {
    return "You do not seem to have an account with us.";
  } else if (!bcrypt.compareSync(plainPass, database[selectedUser].password)) {
    return `The provided details do not match our records.`;
  }
  return true;
};

const registerUser = (
  email: string,
  plainPass: string,
  database: IUsers
): string | true => {
  if (email === "" || plainPass === "") {
    return "Please fill in all fields.";
  } else if (findUserByEmail(email, database)) {
    return `This user already has an account.`;
  }
  return true;
};

const isValidShortUrl = (
  user: IUsersObject,
  database: IDatabase,
  shortURL: string
): string | true => {
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
