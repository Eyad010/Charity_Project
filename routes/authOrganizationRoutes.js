const express = require('express');
const Organization = require('../controllers/authOrganizationController');

const router = express.Router();

router.post('/signup',
Organization.protect,
Organization.restrictTo('admin'),
Organization.signUp);

router.post('/login', Organization.login);

router.delete('/deleteEmp/:id',
Organization.protect,
Organization.restrictTo('admin'),  // restrict this route to admins only
Organization.deleteEmployee);



module.exports = router;
