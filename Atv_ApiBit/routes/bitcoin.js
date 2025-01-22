var express = require('express');
var router = express.Router();
var axios = require('axios'); 

/* GET home page. */
router.get('/:country', async function (req, res, next) {

    const bitcoin = await axios.get("https://api.coindesk.com/v1/bpi/currentprice.json");

    if (req.params.country === "usd") {

        res.render('components/main', {
            title: 'Crypto Data',
            content: '../bitcoin',
            b: bitcoin.data,
            locate: 'USD'
        });
        
    }else if (req.params.country === "pound") {

        res.render('components/main', {
            title: 'Crypto Data',
            content: '../bitcoin',
            b: bitcoin.data,
            locate: 'GBP'
        });
        
    }else if (req.params.country === "euro") {
        
        res.render('components/main', {
            title: 'Crypto Data',
            content: '../bitcoin',
            b: bitcoin.data,
            locate: 'EUR'
        });

    }else{
        res.json({err: 'Invalid Endpoint'})
    }

    
});

router.get('/*', function(req, res, next) {
    res.json({err: 'Invalid Endpoint'})
  });

module.exports = router;
