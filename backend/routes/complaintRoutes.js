const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const auth = require('../middleware/auth');

router.post('/', auth, complaintController.addComplaint);
router.get('/', auth, complaintController.getAllComplaints);
router.put('/:id', auth, complaintController.updateComplaintStatus);
router.get('/search', auth, complaintController.searchComplaintByLocation);

module.exports = router;
