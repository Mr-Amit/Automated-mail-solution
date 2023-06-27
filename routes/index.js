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
  console.log('---->', req.query.code);
  await myCache.set(req.user.email, "true");
  // res.send('<h1> Checking your unatteneded emails... </h1>')
  res.redirect('/log')
})

router.get('/auth/google/failure', async (req, res) => {
  res.send('<h1> Sorry, an issue with your login, try again later. </h1>')
})

router.get('/auth/logout', async (req, res) => {
  // let session = req.session;
  let connectSid = req.cookies['connect.sid']
  let sessionId = connectSid?.slice(2, connectSid.indexOf('.'))
  // console.log({ session, cookies: req.cookies });
  if (sessionId) {
    let result = await deleteUserSession(req.user, sessionId);
    // console.log(result);
    if (result) {
      return res.status(200).send('Logged Out')
    }
    res.status(200).send('Issue in logging out')

  }

})

module.exports = router;