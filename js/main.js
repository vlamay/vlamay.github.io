// Main JavaScript functionality for DevOps Portfolio

// Initialize AOS (Animate on Scroll)
AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 100
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// Animate progress bars when in viewport
const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px'
};

const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const progressBar = entry.target;
      const progress = progressBar.getAttribute('data-progress');
      progressBar.style.setProperty('--progress', `${progress}%`);
      progressBar.classList.add('animated');
    }
  });
}, observerOptions);

document.querySelectorAll('.level-fill').forEach(bar => {
  progressObserver.observe(bar);
});

// Tech stack hover effects
document.querySelectorAll('.tech-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.transform = 'scale(1.1)';
    item.style.transition = 'transform 0.3s ease';
  });
  
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'scale(1)';
  });
});

// Form submission handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const button = contactForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    
    button.textContent = 'Sending...';
    button.disabled = true;
    
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        button.textContent = '✓ Sent!';
        button.style.background = 'var(--success)';
        contactForm.reset();
        
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          button.style.background = '';
        }, 3000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      button.textContent = '✗ Error - Try email';
      button.style.background = 'var(--error)';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.background = '';
      }, 3000);
    }
  });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  if (hero) {
    const rate = scrolled * -0.5;
    hero.style.transform = `translateY(${rate}px)`;
  }
});

// Typing effect for hero title (optional)
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Initialize typing effect if element exists
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  const originalText = heroTitle.textContent;
  // Uncomment to enable typing effect
  // typeWriter(heroTitle, originalText, 50);
}

// Lazy loading for images
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});

// Smooth reveal animations
const revealElements = document.querySelectorAll('.animate-on-scroll');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(element => {
  revealObserver.observe(element);
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(() => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close mobile menu if open
    if (navLinks && navLinks.classList.contains('active')) {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('active');
    }
  }
});

// Focus management for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// Console welcome message
console.log('%c🚀 DevOps Portfolio by Vladyslav Maidaniuk', 'color: #00d9ff; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with modern web technologies', 'color: #ff006e; font-size: 12px;');

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
