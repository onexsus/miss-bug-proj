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
// List
app.get("/api/bug", (req, res) => {
  bugService.query()
    .then((bugs) => {
      res.send(bugs);
    })
    .catch((err) => {
      loggerService.error("Cannot get bugs", err);
      res.status(400).send("Cannot get bugs");
    });
});

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
  const { title, description, severity, labels } = req.body

  const bugToSave = {
      title,
      description,
      severity, //auto parse to num
      labels: labels || []
  }

  bugService.save(bugToSave)
      .then(bug => res.send(bug))
      .catch((err) => {
          loggerService.error('Cannot save bug obj', err)
          res.status(400).send('Cannot save bug obj')
      })
})

// Edit bug (UPDATE)
app.put('/api/bug', (req, res) => {
  const { _id, title, description, severity, labels } = req.body
  const bugToSave = {
      _id,
      title,
      description,
      severity, //auto parse to num
      labels
  }
  bugService.save(bugToSave)
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
  const { bugId } = req.params;
  bugService
    .remove(bugId)
    .then(() => res.send(bugId))
    .catch((err) => {
      loggerService.error("Cannot remove bug", err);
      res.status(400).send("Cannot remove bug");
    });
});

// Listen will always be the last line in our server!
const port = 3030;
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
);
