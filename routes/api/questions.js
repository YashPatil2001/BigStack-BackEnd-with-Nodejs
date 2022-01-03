const express = require('express');

const router = express.Router();

router.get('/question', (req,res) => {
    res.json({
        msg:'landing in question route sucessfully'
    });
});

module.exports = router;