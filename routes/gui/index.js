const router = require('express').Router();
var expressLayouts = require('express-ejs-layouts');

router.use(expressLayouts);

router.get("/", function(req, res) {

	res.render('index.html');
})


module.exports = router;
