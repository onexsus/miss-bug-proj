import { bugService } from "./services/bug.service.js";
import { loggerService } from "./services/logger.service.js";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

// App Configuration
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());


//  routing express

app.get('/nono', (req, res) => res.redirect('/'))
// List
app.get('/api/bug', (req, res) => {

  const { txt = '', minSeverity = 0, label = '', pageIdx, sortBy = '', sortDir = 1 } = req.query
  const filterBy = {
      txt,
      minSeverity,
      label,
      pageIdx
  }

  bugService.query(filterBy, sortBy, sortDir)
        .then(({ bugs, maxPage }) => {
            // console.log('maxPage', maxPage)
            res.send({ bugs, maxPage })
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

//Save
// app.get("/api/bug/save", (req, res) => {
//   const bugToSave = {
    // title: req.query.title,
    // description: req.query.description,
    // severity: +req.query.severity,
    // _id: req.query._id,
//   };

//   bugService.save(bugToSave)
//     .then((bug) => res.send(bug))
//     .catch((err) => {
//       loggerService.error("Cannot save bug", err);
//       res.status(400).send("Cannot save bug");
//     });
// });

// Add bug (CREATE)
app.post('/api/bug', (req, res) => {
  const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')

  const { title, description, severity, labels } = req.body

  const bugToSave = {
      title,
      description,
      severity, 
      labels: labels || []
  }

  bugService.save(bugToSave, loggedinUser)
      .then(bug => res.send(bug))
      .catch((err) => {
          loggerService.error('Cannot save bug obj', err)
          res.status(400).send('Cannot save bug obj')
      })
})

// Edit bug (UPDATE)
app.put('/api/bug', (req, res) => {
  const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot update bug')

  const { _id, title, description, severity, labels } = req.body
  const bugToSave = {
      _id,
      title,
      description,
      severity, //auto parse to num
      labels
  }
  bugService.save(bugToSave, loggedinUser)
      .then(bug => res.send(bug))
      .catch((err) => {
          loggerService.error('Cannot save bug', err)
          res.status(400).send('Cannot save bug')
      })
})

// Read - getById
app.get("/api/bug/:bugId", (req, res) => {
  const { bugId } = req.params;

  const { visitCountBugs = [] } = req.cookies;
  console.log("visitCountBugs", visitCountBugs);
  if (visitCountBugs.length >= 3)
    return res.status(401).send("limit 3 bugs ");
  if (!visitCountBugs.includes(bugId)) visitCountBugs.push(bugId);
  res.cookie("visitCountBugs", visitCountBugs, { maxAge: 1000 * 7 });

  bugService.getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error("Cannot get bug", err);
      res.status(400).send("Cannot get bug");
    });
});

// Remove
app.delete("/api/bug/:bugId", (req, res) => {
  const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot remove bug')

  const { bugId } = req.params;
  bugService.remove(bugId, loggedinUser)
    .then(() => res.send(bugId))
    .catch((err) => {
      loggerService.error("Cannot remove bug", err);
      res.status(400).send("Cannot remove bug");
    });
});


// AUTH API
app.get('/api/user', (req, res) => {
  userService.query()
      .then((users) => {
          res.send(users)
      })
      .catch((err) => {
          console.log('Cannot load users', err)
          res.status(400).send('Cannot load users')
      })
})

app.post('/api/auth/login', (req, res) => {
  const credentials = req.body
  userService.checkLogin(credentials)
      .then(user => {
          if (user) {
              const loginToken = userService.getLoginToken(user)
              res.cookie('loginToken', loginToken)
              res.send(user)
          } else {
              res.status(401).send('Invalid Credentials')
          }
      })
})

app.post('/api/auth/signup', (req, res) => {
  const credentials = req.body
  userService.save(credentials)
      .then(user => {
          if (user) {
              const loginToken = userService.getLoginToken(user)
              res.cookie('loginToken', loginToken)
              res.send(user)
          } else {
              res.status(400).send('Cannot signup')
          }
      })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

// Listen will always be the last line in our server!
const port = 3030;
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
);
