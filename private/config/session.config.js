'use strict';

const twoHours = 2 * (1000 /* ms per second */ * 60 /* seconds per minute */ * 60 /* minutes per hour */);

export default {
  secret: `${process.env.SESSION_SECRET}`,
  saveUninitialized: true,
  cookie: { maxAge: twoHours, },
  resave: false,
};
