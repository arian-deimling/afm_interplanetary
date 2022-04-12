const twoHours = 2 * (
  /* ms per second */
  1000 *
  /* seconds per minute */
  60 *
  /* minutes per hour */
  60
);

export default {
  secret: `${process.env.SESSION_SECRET}`,
  saveUninitialized: true,
  cookie: { maxAge: twoHours, },
  resave: false,
};
