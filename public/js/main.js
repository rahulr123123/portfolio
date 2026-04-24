// Professional Portfolio JavaScript

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80; // Account for fixed navbar
      const elementPosition = target.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Active nav link on scroll
window.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100; // Offset for navbar
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Contact form handling
function getContactApiUrl() {
  const { protocol, hostname, port, origin } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost && port && port !== '3000') {
    return `${protocol}//${hostname}:3000/api/contact`;
  }

  return `${origin}/api/contact`;
}

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const rawData = Object.fromEntries(formData);
    const data = {
      name: rawData.name?.trim() || '',
      email: rawData.email?.trim() || '',
      subject: rawData.subject?.trim() || '',
      message: rawData.message?.trim() || '',
    };

    // Simple validation
    if (!data.name || !data.email || !data.message) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    if (!data.subject || !data.subject.trim()) {
      data.subject = 'Portfolio Inquiry';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Disable submit button
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const response = await fetch(getContactApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      let result = null;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        console.error('Invalid contact form response:', parseError, responseText);
      }

      if (response.ok && result?.success) {
        showMessage(result.message || 'Your message has been sent successfully!', 'success');
        contactForm.reset();
      } else {
        showMessage(
          result?.message || `Request failed with status ${response.status}. Please try again.`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Unable to reach the server. Please make sure the backend is running.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Show message function
function showMessage(message, type) {
  const statusElement = document.getElementById('contactStatus');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `message ${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initContactForm();

  // Add fade-in animation to sections
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
});

// Typing effect for hero subtitle (optional)
function initTypingEffect() {
  const element = document.querySelector('.hero-subtitle');
  if (!element) return;

  const text = element.textContent;
  element.textContent = '';
  let i = 0;

  function typeWriter() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, 50);
    }
  }

  setTimeout(typeWriter, 1000);
}

// Initialize typing effect on home page
if (document.querySelector('.hero')) {
  initTypingEffect();
}
