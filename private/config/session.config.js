const twoHours = 2 * (1000 /* ms per second */ * 60 /* seconds per minute */ * 60 /* minutes per hour */);

// TODO(AD) - use better secret
module.exports = {
  secret: '1234567890',
  saveUninitialized: true,
  cookie: { maxAge: twoHours, },
  resave: false,
};
