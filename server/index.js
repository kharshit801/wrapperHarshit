const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const accountSid = 'ACc9acaacd4aaf6176d500b25c77ebad96';
const authToken = 'd455e88ecd6df6a988e1ac06fe34a9ca';
const client = new twilio(accountSid, authToken);

app.post('/send-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;

  client.messages
    .create({
      from: '+12513334882', // Your Twilio SMS number
      body: `Your OTP is: ${otp}`,
      to: `+${phoneNumber}`, // Sending via SMS, no whatsapp: prefix
    })
    .then((message) => {
      res.status(200).send({ message: 'OTP sent successfully' });
    })
    .catch((error) => {
      console.error('Error sending OTP:', error);
      res.status(500).send({ error: 'Failed to send OTP' });
    });
});

app.listen(8000, () => console.log('Server running on port 8000'));
