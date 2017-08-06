
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

//Database for the Url and their input
var urlDatabase = {

 "b2xVn2": {
    address: "http://www.lighthouselabs.ca",
    shortURL: "userRandomID",
    owner: "userRandomID"
  },
 "9sm5xK": {
    address: "http://www.google.com",
    shortURL: "user2RandomID",
    owner: "user2RandomID"
  }
}
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

// Generates ShortUrl
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

const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
  maxAge: 24 * 60 * 60 * 1000
}))

app.set("view engine", "ejs");

// Updating ID
function urlsForUserID(id){

  var urlUser = {}
  for ( var url_id in urlDatabase){
    if ( urlDatabase[url_id].userID === id)
      urlUser[url_id] = urlDatabase[url_id];
    }
  return urlUser;
}


// Get response for /urls
app.get("/urls", (req, res) => {

 const userCookie = req.session['user_id'];
 if (req.session.user_id == undefined){
  res.render("urls_error")
 }
 var urls = urlsForUserID(userCookie)
 let templateVars = {
   urls: urls,
   user: users[userCookie]
 };

 console.log(urlsForUserID(req.session['user_id']))
 res.render("urls_index", templateVars);
});

// Enables addition of the url to the desired ID
app.get("/urls/new", (req, res) => {

  let templateVars = { user:users[req.session["user_id"]] } //** templateVars= variable applicable for the render page
  if (users.hasOwnProperty(req.session["user_id"])){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

//Allows redirection dependence on login state / ownership of Url
app.get("/urls/:id", (req, res) => {

 const shortURL = req.params.id;
 if (req.session.user_id === undefined) {
   res.render('urls_error');
 } else if (urlDatabase[shortURL] === undefined) {
   res.render('urls_error');
 } else if (urlDatabase[shortURL]['userID'] !== req.session.user_id) {
   res.render('urls_error');
 } else if (urlDatabase[req.params.id]) {
   let templateVars = { shortURL: req.params.id,
     urls: urlDatabase,
     user: users[req.session.user_id]};
   res.render("urls_show", templateVars);
 } else {
   res.render("urls_error");
 }
});

//Allow redirection from the root HTML
app.get("/", (req, res) => {
  if (req.session.user_id == undefined){
    res.redirect("/login")
  }
  res.redirect("/urls")
  let templateVars = {
  user:users[req.session["user_id"]],
};
  res.end("Hello!", templateVars);
});

//GET response for /urls.json
app.get("/urls.json", (req, res) => {

  let templateVars = {
  user:users[req.session["user_id"]],
};
  res.json(urlDatabase);
});

// allows registration of an account
app.get("/register", (req, res) => {

  res.render("registration")
});

app.post("/urls", (req, res) => {

  var shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {address:req.body.longURL,
                          shortURL: shortUrl,
                          userID: req.session['user_id']}
  res.redirect('/urls');
});

// enables deleting of the url from the account
app.post("/urls/:id/delete", (req, res) => {

    const shortURL = req.params.id;
    if (urlDatabase[shortURL]["user_id"]= req.session["user_id"]){
      delete urlDatabase[req.params.id];
    res.redirect("/urls")
    } else {
      res.redirect("/urls")
  }
});

// enables update of Url and redirection directed by the condition
app.post("/urls/:id", (req, res) => {

 var longURL = urlDatabase[req.params.id].address;
 const shortURL = req.params.id;
 if (urlDatabase[shortURL]['userID'] === req.session.user_id){
   urlDatabase[req.params.id].address = req.body.longURL;
   res.redirect('/urls');
 } else {
   res.redirect('/urls_error');
 }
});

// enables logout / session clear
app.post("/logout", (req, res) => {

  req.session.user_id = null;
  res.redirect("/urls")
});

// helper function which checks whether email exists or not
const checkEmail = (email) => {

  for (let userId in users) {
    if(users[userId].email === email){
      return true
    }
  }
}

// check for condition of register page ; returns desired outcome
app.post("/register", (req,res) => {

  const { email, password} = req.body;
  const randStr = generateRandomString();

  if ((email === "") || (password === "" || checkEmail() )){
      res.sendStatus(400)
  }  else {
    users[randStr] = {
      id: randStr,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
  }

  req.session.user_id = users[randStr].id
  res.redirect("/urls")

});

// Enables login
app.get('/login', (req, res) => {

 if (req.session.user_id){
   res.redirect('urls');
 } else {
   let templateVars = { urls: urlDatabase, user: users[req.session.user_id]};
   res.render('login', templateVars);
 }
});


// helper function that enables checkup of the email and password exists
const findUser = email => {

  for(let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
}

// enables login ; shoudl condition not met, return desired outcome
app.post("/login", (req, res) => {

  const { email, password } = req.body;
  const user = findUser(email, password);
  console.log('User', user);
  if (!user) {
    res.sendStatus(403).send('User does not exist')
  }
  if (user) {
    if(bcrypt.compareSync(password, user.password)) {
      res.cookie( "user_id" , user.id );
      res.redirect('/urls');
    } else {
      res.status(403).send('Password does not exist')
    }
  }
});

// allows direct access to the longUrl via shortUrl usage
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL].address
  res.redirect(longURL);
});

// GET response for /hello
app.get("/hello", (req, res) => {

  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// Port response ; allows if node functioned properly or not
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
