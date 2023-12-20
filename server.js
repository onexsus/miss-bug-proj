import { bugService } from "./services/bug.service.js";
import { loggerService } from "./services/logger.service.js";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

// App Configuration
app.use(express.static("public"));
app.use(cookieParser());


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
app.get("/api/bug/save", (req, res) => {
  const bugToSave = {
    title: req.query.title,
    severity: +req.query.severity,
    _id: req.query._id,
  };

  bugService.save(bugToSave)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error("Cannot save bug", err);
      res.status(400).send("Cannot save bug");
    });
});

// Read - getById
app.get("/api/bug/:bugId", (req, res) => {
  const { bugId } = req.params;

  const { visitCountMap = [] } = req.cookies;
  console.log("visitCountMap", visitCountMap);
  if (visitCountMap.length >= 3)
    return res.status(401).send("limit 3 bugs ");
  if (!visitCountMap.includes(bugId)) visitCountMap.push(bugId);
  res.cookie("visitCountMap", visitCountMap, { maxAge: 1000 * 7 });

  bugService.getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error("Cannot get bug", err);
      res.status(400).send("Cannot get bug");
    });
});

// Remove
app.get("/api/bug/:bugId/remove", (req, res) => {
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
