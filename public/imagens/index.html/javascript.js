// Particle Background
particlesJS('particles-js', {
  particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#6b48ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#48cfff', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
  },
  interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
  },
  retina_detect: true
});

// Smooth Scroll for Navbar Links
document.querySelectorAll('.nav-links a').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      window.scrollTo({
          top: targetElement.offsetTop - 60,
          behavior: 'smooth'
      });
  });
});

// Initialize AOS
AOS.init({
  duration: 1000,
  once: true
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
  const parallax = document.querySelector('.parallax-bg');
  let scrollPosition = window.pageYOffset;
  parallax.style.transform = `translateY(${scrollPosition * 0.5}px)`;
});

// Carrossel (Portfolio e Testimonial)
let sliders = {};

function initSlider(sliderId) {
  const slider = document.getElementById(sliderId);
  const items = slider.children;
  const dotsContainer = document.getElementById(sliderId.replace('Slider', 'Dots'));
  
  // Inicializar estado do slider
  sliders[sliderId] = {
      currentIndex: 0,
      items: items,
      totalItems: items.length
  };

  // Criar dots
  for (let i = 0; i < items.length; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
          sliders[sliderId].currentIndex = i;
          updateSlider(sliderId);
      });
      dotsContainer.appendChild(dot);
  }

  updateSlider(sliderId);
}

function moveSlide(direction, sliderId) {
  const slider = sliders[sliderId];
  slider.currentIndex = (slider.currentIndex + direction + slider.totalItems) % slider.totalItems;
  updateSlider(sliderId);
}

function updateSlider(sliderId) {
  const slider = sliders[sliderId];
  const sliderContainer = document.getElementById(sliderId);
  sliderContainer.style.transform = `translateX(-${slider.currentIndex * 100}%)`;

  // Atualizar dots
  const dots = document.getElementById(sliderId.replace('Slider', 'Dots')).children;
  for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === slider.currentIndex);
  }
}

// Inicializar sliders
initSlider('portfolioSlider');
initSlider('testimonialSlider');

// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const icon = document.querySelector('.theme-toggle i');
  icon.classList.toggle('fa-sun');
  icon.classList.toggle('fa-moon');
}

// Back to Top Button
const backToTopBtn = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Vanilla Tilt para Portfolio Items
VanillaTilt.init(document.querySelectorAll('.portfolio-item'), {
  max: 15,
  speed: 400,
  glare: true,
  'max-glare': 0.3
});

// Form Submission Handling
document.getElementById('contact-form').addEventListener('submit', (e) => {
  console.log('Formulário enviado!');
});