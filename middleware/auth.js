module.exports = {
  isUserAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      // console.log(req);
      return next()
    } else {
      res.redirect('/')
    }
  },
    
  isGuestAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/log');
    }
  },
}