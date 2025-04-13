const express = require('express');
const router = express.Router();
const Message = require('./message.model');

const sendMessage = async (req, res) => {
  const { sender, receiver, text } = req.body;

  

  if (!sender || !receiver || !text) {
    return res.status(400).json({ success: false, message: 'Missing sender, receiver, or text' });
  }


  try {
    let conversation = await Message.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (conversation) {
      conversation.messages.push({ text, timestamp: new Date() });
      await conversation.save();
    } else {
      conversation = new Message({
        sender,
        receiver,
        messages: [{ text }],
      });
      await conversation.save();
    }

    res.status(200).json({ success: true, message: 'Message sent', data: conversation });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const getConversation = async (req, res) => {
    const { user1, user2 } = req.params;
  
    try {
      const conversation = await Message.findOne({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      });
  
      if (!conversation) {
        return res.status(200).json({ success: true, data: [] }); // no messages yet
      }
  
      res.status(200).json({ success: true, data: conversation.messages });
    } catch (err) {
      console.error('Error fetching conversation:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  
  
// Use it in the route
router.get('/conversation/:user1/:user2', getConversation);
router.post('/send', sendMessage);

module.exports = router;
