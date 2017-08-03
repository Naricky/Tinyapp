var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

var urlDatabase = {
 "b2xVn2": "http://www.lighthouselabs.ca",
 "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase, username:req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"]
};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var itemToLookup = req.params.id;
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[itemToLookup], username:req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  let templateVars = {
  username: req.cookies["username"],
};
  res.end("Hello!", templateVars);
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
  username: req.cookies["username"],
};
  res.json(urlDatabase, templateVars);
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

  res.clearCookie("username")

res.redirect("/urls")

});

app.post("/login", (req, res) => {

res.cookie( "username" , req.body.username );

res.redirect("/urls")

});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
  username: req.cookies["username"],
  // ... any other vars
};

  let longURL = urlDatabase[req.params.shortURL]

  res.redirect(longURL, templateVars);
});


app.get("/hello", (req, res) => {
  let templateVars = {
  username: req.cookies["username"],
  // ... any other vars
};
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);
});

