const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberCount,
  getRecentMembers,
  createMember,
  webhookCreateMember,
  testWebhook,
  getMember
} = require('../controllers/memberController');
const { validateMember, validateWebhook } = require('../middleware/validation');
const { formLimiter, webhookLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', apiLimiter, getMembers);
router.get('/count', apiLimiter, getMemberCount);
router.get('/recent', apiLimiter, getRecentMembers);
router.get('/:id', apiLimiter, getMember);

// Form submission from website
router.post('/', formLimiter, validateMember, createMember);

// Webhook endpoints for GoHighLevel/Make.com/Zapier
router.post('/webhook', webhookLimiter, validateWebhook, webhookCreateMember);
router.post('/webhook/test', testWebhook);

// Alternative webhook paths (for flexibility)
router.post('/hook', webhookLimiter, validateWebhook, webhookCreateMember);
router.post('/gohighlevel', webhookLimiter, validateWebhook, webhookCreateMember);
router.post('/make', webhookLimiter, validateWebhook, webhookCreateMember);
router.post('/zapier', webhookLimiter, validateWebhook, webhookCreateMember);

module.exports = router;
