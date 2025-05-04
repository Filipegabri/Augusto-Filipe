// Inicializar AOS (Animate on Scroll)
AOS.init({
  duration: 800,
  once: true,
});

// Inicializar Particles.js
particlesJS('particles-js', {
  particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
  },
  interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
  },
  retina_detect: true,
});

// Inicializar Vanilla Tilt nos cartões de serviço
VanillaTilt.init(document.querySelectorAll('.service-cards .card'), {
  max: 25,
  speed: 400,
  glare: true,
  'max-glare': 0.5,
});

// Função para alternar tema claro/escuro
function toggleTheme() {
  const body = document.body;
  const themeToggleIcon = document.querySelector('.theme-toggle i');
  body.classList.toggle('light-theme');
  if (body.classList.contains('light-theme')) {
      themeToggleIcon.classList.remove('fa-sun');
      themeToggleIcon.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
  } else {
      themeToggleIcon.classList.remove('fa-moon');
      themeToggleIcon.classList.add('fa-sun');
      localStorage.setItem('theme', 'dark');
  }
}

// Carregar tema salvo no localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      document.querySelector('.theme-toggle i').classList.remove('fa-sun');
      document.querySelector('.theme-toggle i').classList.add('fa-moon');
  }
});

// Função para controlar sliders (portfólio e depoimentos)
function moveSlide(direction, sliderId) {
  const slider = document.getElementById(sliderId);
  const items = slider.querySelectorAll('.portfolio-item, .testimonial-item');
  const dotsContainer = document.getElementById(sliderId.replace('Slider', 'Dots'));
  let currentIndex = parseInt(slider.dataset.currentIndex || 0);

  // Atualizar índice
  currentIndex = (currentIndex + direction + items.length) % items.length;
  slider.dataset.currentIndex = currentIndex;

  // Mover slider
  const itemWidth = items[0].offsetWidth;
  slider.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

  // Atualizar dots
  const dots = dotsContainer.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
  });
}

// Inicializar sliders
function initSliders() {
  ['portfolioSlider', 'testimonialSlider'].forEach(sliderId => {
      const slider = document.getElementById(sliderId);
      const items = slider.querySelectorAll('.portfolio-item, .testimonial-item');
      const dotsContainer = document.getElementById(sliderId.replace('Slider', 'Dots'));

      // Criar dots
      items.forEach((_, index) => {
          const dot = document.createElement('span');
          dot.classList.add('dot');
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', () => {
              slider.dataset.currentIndex = index;
              moveSlide(0, sliderId);
          });
          dotsContainer.appendChild(dot);
      });
  });
}

// Função para voltar ao topo
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar/esconder botão de voltar ao topo
window.addEventListener('scroll', () => {
  const backToTopButton = document.querySelector('.back-to-top');
  backToTopButton.style.display = window.scrollY > 300 ? 'block' : 'none';
});

// Efeito de digitação no Hero
document.addEventListener('DOMContentLoaded', () => {
  const text = "Olá, Eu Sou ";
  const h1 = document.querySelector('.hero-content h1');
  let index = 0;
  function type() {
      if (index < text.length) {
          h1.innerHTML = text.substring(0, index + 1) + '<span>Augusto Filipe</span>';
          index++;
          setTimeout(type, 100);
      }
  }
  type();
});

// Lazy loading para imagens
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('.lazy');
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src || img.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
          }
      });
  });
  lazyImages.forEach(img => observer.observe(img));
});

// Inicializar tudo ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  initSliders();
});