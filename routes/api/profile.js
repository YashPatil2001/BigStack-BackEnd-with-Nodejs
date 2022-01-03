const express = require('express');

const router = express.Router();

router.get('/profile', (req,res) => {
    res.json({
        msg:'landing in profile route successfully'
    });
});

module.exports = router;