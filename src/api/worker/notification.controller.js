const express = require('express');
const router = express.Router();
const { sendwhatsappMessage } = require('../../utils/twilio');
const { Parent, PregLactWomen } = require('../beneficiaries/beneficiaries.model');

router.post('/send', async (req, res) => {
  const { anganwadiNo, fromDate, toDate, note } = req.body;

  try {
    // Fetch parents and preg/lactating women from their respective models
    const parents = await Parent.find({ anganwadiNo });
    const preglacs = await PregLactWomen.find({ anganwadiNo });

    const beneficiaries = [...parents, ...preglacs];

    // Format the dates
    const formattedFrom = new Date(fromDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const formattedTo = new Date(toDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const baseMessage = `Dear beneficiary, stock will be distributed at your Anganwadi center from ${formattedFrom} to ${formattedTo}. Please collect it within this period.`;
    const finalMessage = note ? `${baseMessage}\n\nNote: ${note}` : baseMessage;

    // const validBeneficiaries = beneficiaries.filter(b => b.phone && b.phone.startsWith('+91'));
    console.log(finalMessage)
    // Send WhatsApp messages
    const results = await Promise.all(
      beneficiaries.map(b =>
        sendwhatsappMessage({ message: finalMessage, phone: b.phone })
      )
    );

    res.status(200).json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error sending WhatsApp notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
