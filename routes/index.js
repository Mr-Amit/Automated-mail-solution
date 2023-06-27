const router = require('express').Router()
const { isUserAuthenticated, isGuestAuthenticated } = require('../middleware/auth');
const { deleteUserSession, initateEmailProcessing } = require('../services/UserService');
const myCache = require('../lib/cache-store')
router.get('/', isGuestAuthenticated, (req, res) => {
  res.render('login')
})

router.get("/log", isUserAuthenticated, async (req, res) => {
  // console.log('this here.');
  await myCache.set(req.user.email, "true");
  initateEmailProcessing(req.user)
  res.render('index', { userinfo: req.user })
})

router.get('/auth/google/success', async (req, res) => {
  await myCache.set(req.user.email, "true");
  // res.send('<h1> Checking your unatteneded emails... </h1>')
  res.redirect('/log')
})

router.get('/auth/google/failure', async (req, res) => {
  res.send('<h1> Sorry, an issue with your login, try again later. </h1>')
})

router.get('/auth/logout', async (req, res) => {
  let email = req.user.email;
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
  await myCache.del(email)

})

module.exports = router;