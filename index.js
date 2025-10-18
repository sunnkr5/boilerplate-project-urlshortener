require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const urlParser = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// In-memory database
const urlDatabase = {};
let id = 1;

// POST route to shorten the URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  try {
    const hostname = urlParser.parse(originalUrl).hostname;

    dns.lookup(hostname, (err, address) => {
      if (err || !address) {
        return res.json({ error: "invalid url" });
      }

      const shortUrl = id++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    });
  } catch (e) {
    res.json({ error: "invalid url" });
  }
});

// GET route to redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
