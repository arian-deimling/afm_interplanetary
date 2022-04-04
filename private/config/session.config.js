const oneMinute = 1000 /* ms per second */ * 60 /* seconds per minute */;

module.exports = {
  secret: "1234567890",
  saveUninitialized: true,
  cookie: { maxAge: oneMinute, },
  resave: false,
};
