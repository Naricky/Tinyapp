var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

var urlDatabase = {
 "b2xVn2": "http://www.lighthouselabs.ca",
 "9sm5xK": "http://www.google.com"
};

const users ={
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {

  var text = "";

  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++ ) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return text;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");


app.get("/urls", (req, res) => {
  console.log('req.cookies', req.cookies);
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user:users[req.cookies["user_id"]]
};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var itemToLookup = req.params.id;
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[itemToLookup], user:users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  let templateVars = {
  user:users[req.cookies["user_id"]],
};
  res.end("Hello!", templateVars);
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
  user:users[req.cookies["user_id"]],
};
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {

  res.render("registration")
});

app.post("/urls", (req, res) => {

  var shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect('/urls');

});

app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];

  res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL

  res.redirect("/urls")
});

app.post("/logout", (req, res) => {

  res.clearCookie("user_id")

  res.redirect("/login")

});

const checkEmail = (email) => {
  for (let userId in users) {
    if(users[userId].email === email){
      return true
    }
  }
}

app.post("/register", (req,res) => {
  const { email, password} = req.body;
  const randStr = generateRandomString();

  if ((email === "") || (password === "" || checkEmail() )){
      res.sendStatus(400)
  } else {
    users[randStr] = {
      id: randStr,
      email: req.body.email,
      password: req.body.password
    }
  }
  res.cookie("user_id" , users[randStr].id);

  res.redirect("/urls")

});

app.get("/login", (req, res) => {

  res.render("login")
});

const findUser = email => {
  for(let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
}

// const checkPassword = (actualPassword, formPassword) => {

// }

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email, password);
  console.log('User', user);
  if (!user) {
    res.sendStatus(403)
  }
  // check if the found user's password is correct
  if (user) {
    if(user.password === password) {
      res.cookie( "user_id" , user.id );
      res.redirect('/urls');
    } else {
      res.status(403).send('Password')
    }
  }

});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
  user:users[req.cookies["user_id"]],

};

  let longURL = urlDatabase[req.params.shortURL]

  res.redirect(longURL, templateVars);
});


app.get("/hello", (req, res) => {
  let templateVars = {

};
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);
});

