const Subscriber = require('../models/Subscriber');

/**
 * @desc    Subscribe to newsletter (Whispers from the Wild)
 * @route   POST /api/subscribers
 * @access  Public
 */
const createSubscriber = async (req, res) => {
  try {
    const { firstName, email } = req.body;

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      // If they unsubscribed before, reactivate
      if (existingSubscriber.status === 'unsubscribed') {
        existingSubscriber.status = 'active';
        existingSubscriber.firstName = firstName;
        await existingSubscriber.save();
        
        return res.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          isReactivated: true
        });
      }
      
      return res.json({
        success: true,
        message: 'You\'re already subscribed! Check your inbox for Whispers.',
        isExisting: true
      });
    }

    // Create new subscriber
    const subscriber = await Subscriber.create({
      firstName,
      email: email.toLowerCase(),
      source: 'website',
      preferences: {
        whispers: true,
        updates: true
      }
    });

    console.log(`✅ New subscriber: ${firstName} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Your first Whisper is on its way...',
      data: {
        id: subscriber._id,
        firstName: subscriber.firstName
      }
    });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.json({
        success: true,
        message: 'You\'re already subscribed!',
        isExisting: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error subscribing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get subscriber count
 * @route   GET /api/subscribers/count
 * @access  Public
 */
const getSubscriberCount = async (req, res) => {
  try {
    const count = await Subscriber.getActiveCount();
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting subscriber count'
    });
  }
};

/**
 * @desc    Unsubscribe
 * @route   POST /api/subscribers/unsubscribe
 * @access  Public
 */
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our records'
      });
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    res.json({
      success: true,
      message: 'You have been unsubscribed. We\'ll miss you.'
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing unsubscribe request'
    });
  }
};

module.exports = {
  createSubscriber,
  getSubscriberCount,
  unsubscribe
};
