const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
const db = require('../models');
const User = db.User;

// Import authenticateUser function from the middleware folder.
const authenticateUser = require('../middleware/authenticateUser.js');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';


// GET /api/users route: returns currently authenticated user.
router.get('/users', authenticateUser, async (req, res, next) => {
  const user = await User.findByPk(req.currentUser.dataValues.id, {
    attributes: ['id', 'firstName', 'lastName', 'emailAddress']
  });
  res.status(200).json(user);
});

// POST /api/users route: Creates a user, sets the Location header to "/", and returns no content
router.post('/users', async (req, res, next) => {
 try {
   const user = req.body;
   if (user.password) {
     user.password = bcryptjs.hashSync(user.password);
   }
   if (!user.emailAddress) {
     user.emailAddress = "";
   }

  // create the user.
  await User.findOrCreate({
     where: { emailAddress: user.emailAddress },
     defaults: user
   })
     .then(([user, created]) => {
       if (created) {
         console.log("New user successfully created");
         res.status(201).set("Location", "/").end();
       } else {
         console.log(`There is an already existing account with the following email address: ${user.emailAddress}`);
         res.status(200).set("Location", "/").end();
       }
     });
 } catch(err) {
   // If there is a Sequelize Validation Error, send 400 status code and a
   // Sequelize error message.
   if (err.name === "SequelizeValidationError" || "SequelizeUniqueConstraintError") {
     res.status(400).json({error: err.message})
   } else {
     // send it to global error handler.
     return next(err);
   }
 }
})

module.exports = router;
