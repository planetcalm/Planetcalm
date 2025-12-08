const express = require('express');
const router = express.Router();
const {
  createSubscriber,
  getSubscriberCount,
  unsubscribe
} = require('../controllers/subscriberController');
const { validateSubscriber } = require('../middleware/validation');
const { formLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Get subscriber count
router.get('/count', apiLimiter, getSubscriberCount);

// Subscribe to newsletter
router.post('/', formLimiter, validateSubscriber, createSubscriber);

// Unsubscribe
router.post('/unsubscribe', formLimiter, unsubscribe);

module.exports = router;
