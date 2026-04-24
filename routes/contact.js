const express = require('express');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const { sendContactEmail } = require('../config/email');

const router = express.Router();

// POST: Submit contact form
router.post('/contact', async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const subject = req.body.subject?.trim() || 'Portfolio Inquiry';
    const message = req.body.message?.trim();

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    let contact = null;
    let emailSent = false;

    // Save to MongoDB when the connection is available
    if (mongoose.connection.readyState === 1) {
      try {
        contact = new Contact({
          name,
          email,
          subject,
          message,
        });

        await contact.save();
      } catch (saveError) {
        console.error('Contact save error:', saveError);
      }
    } else {
      console.warn('MongoDB not connected. Skipping contact save.');
    }

    // Send email
    try {
      const emailResult = await sendContactEmail({
        name,
        email,
        subject,
        message,
      });
      emailSent = Boolean(emailResult?.delivered);
    } catch (emailError) {
      console.error('Contact email error:', emailError);
    }

    if (!contact && !emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Unable to send your message right now. Please try again later.',
      });
    }

    if (!emailSent) {
      return res.status(502).json({
        success: false,
        message: 'Your message was saved, but the email could not be sent. Please check the mail settings.',
        contactId: contact?._id ?? null,
        savedToDatabase: Boolean(contact),
        emailSent: false,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      contactId: contact?._id ?? null,
      savedToDatabase: Boolean(contact),
      emailSent,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form. Please try again.',
    });
  }
});

// GET: Retrieve all contacts (optional - for admin)
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving contacts',
      error: error.message,
    });
  }
});

module.exports = router;
