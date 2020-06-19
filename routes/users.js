var express = require('express');
var router = express.Router();

const {
  getUninames
} = require("../controllers/name.controller")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/uninames', getUninames)

module.exports = router;
