/* Requires */
var router = require('express').Router();

/* Index route */
router.get('/', function(req, res) {
    res.render('pages/index');
});

/* Pages routes export */
module.exports = router;
