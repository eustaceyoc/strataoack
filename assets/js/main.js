// Mobile nav toggle
(function () {
	const toggle = document.querySelector('.nav-toggle');
	const nav = document.querySelector('.site-nav');
	if (!toggle || !nav) return;
	
	const closeNav = () => { 
		nav.classList.remove('open'); 
		toggle.setAttribute('aria-expanded', 'false');
	};
	
	const openNav = () => {
		nav.classList.add('open');
		toggle.setAttribute('aria-expanded', 'true');
	};
	
	toggle.addEventListener('click', (e) => {
		e.stopPropagation();
		if (nav.classList.contains('open')) {
			closeNav();
		} else {
			openNav();
		}
	});
	
	// Close when clicking outside
	document.addEventListener('click', (e) => {
		if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== toggle) {
			closeNav();
		}
	});
	
	// Close when clicking on a nav link
	nav.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => {
			closeNav();
		});
	});
	
	// Close on escape key
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && nav.classList.contains('open')) {
			closeNav();
		}
	});
})();

// Active link
(function () {
	const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
	document.querySelectorAll('.site-nav a').forEach((a) => {
		const href = a.getAttribute('href');
		if (!href) return;
		if (href.toLowerCase() === path) a.classList.add('active');
	});
})();

// Year
(function () {
	const el = document.getElementById('year');
	if (el) el.textContent = String(new Date().getFullYear());
})();

// Lightbox for gallery
(function () {
	const images = document.querySelectorAll('.gallery-grid img');
	if (!images.length) return;
	const lb = document.createElement('div');
	lb.className = 'lightbox';
	const img = document.createElement('img');
	lb.appendChild(img);
	document.body.appendChild(lb);

	const close = () => lb.classList.remove('open');
	lb.addEventListener('click', close);
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

	images.forEach((i) => {
		i.addEventListener('click', () => {
			img.src = i.src;
			img.alt = i.alt || '';
			lb.classList.add('open');
		});
	});
})();

// Contact form validation
(function () {
	const form = document.querySelector('form[data-contact]');
	if (!form) return;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	function setError(input, message) {
		let err = input.parentElement.querySelector('.error-text');
		if (!err) {
			err = document.createElement('div');
			err.className = 'error-text';
			input.parentElement.appendChild(err);
		}
		input.classList.add('input-error');
		err.textContent = message;
	}
	function clearError(input) {
		input.classList.remove('input-error');
		const err = input.parentElement.querySelector('.error-text');
		if (err) err.textContent = '';
	}
	['input', 'blur'].forEach((ev) => {
		form.addEventListener(ev, (e) => {
			const t = e.target;
			if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)) return;
			clearError(t);
		});
	});
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		let valid = true;
		const name = form.querySelector('input[name="name"]');
		const email = form.querySelector('input[name="email"]');
		const message = form.querySelector('textarea[name="message"]');
		if (name && !name.value.trim()) { setError(name, 'Your name is required'); valid = false; }
		if (email) {
			if (!email.value.trim()) { setError(email, 'Email is required'); valid = false; }
			else if (!emailRegex.test(email.value.trim())) { setError(email, 'Enter a valid email'); valid = false; }
		}
		if (message && message.value.trim().length < 10) { setError(message, 'Please provide more details (≥ 10 characters)'); valid = false; }
		if (valid) {
			alert('Thanks! Your message has been sent.');
			form.reset();
		}
	});
})();

// Simple carousel for clients
/*(function () {
	const carousel = document.getElementById('clientsCarousel');
	if (!carousel) return;
	const track = carousel.querySelector('.carousel-track');
	const prev = carousel.querySelector('.prev');
	const next = carousel.querySelector('.next');
	if (!track || !prev || !next) return;

	function scrollByItems(count) {
		const item = track.querySelector('.carousel-item');
		if (!item) return;
		const style = window.getComputedStyle(item);
		const itemWidth = item.getBoundingClientRect().width + parseFloat(style.marginRight || '0') + parseFloat(style.marginLeft || '0');
		track.scrollBy({ left: itemWidth * count, behavior: 'smooth' });
	}

	prev.addEventListener('click', () => scrollByItems(-2));
	next.addEventListener('click', () => scrollByItems(2));

	let auto = setInterval(() => scrollByItems(1), 2500);
	carousel.addEventListener('mouseenter', () => clearInterval(auto));
	carousel.addEventListener('mouseleave', () => { auto = setInterval(() => scrollByItems(1), 2500); });
})();*/

(function () {
	const carousel = document.getElementById('clientsCarousel');
	if (!carousel) return;
  
	const track = carousel.querySelector('.carousel-track');
	const prev = carousel.querySelector('.prev');
	const next = carousel.querySelector('.next');
	if (!track || !prev || !next) return;
  
	// Clone items for infinite loop
	const items = Array.from(track.children);
	items.forEach(item => {
	  const clone = item.cloneNode(true);
	  clone.classList.add('clone');
	  track.appendChild(clone);
	});
  
	let scrollSpeed;
	let autoScroll;
	let isScrolling = false;
	let touchStartX = 0;
	let touchEndX = 0;
	let isPaused = false;
  
	function getScrollSpeed() {
	  const width = window.innerWidth;
	  if (width <= 480) return 0.3;   // small phones
	  if (width <= 768) return 0.4;   // phones
	  if (width <= 1024) return 0.5;  // tablets
	  return 0.6;                     // desktop
	}
  
	function getItemWidth() {
	  const item = track.querySelector('.carousel-item');
	  if (!item) return 200;
	  const style = window.getComputedStyle(item);
	  return item.getBoundingClientRect().width + parseFloat(style.marginRight || '0') + parseFloat(style.marginLeft || '0') + parseFloat(style.gap || '0') || 16;
	}
  
	function scrollByItems(count) {
	  const itemWidth = getItemWidth();
	  track.scrollBy({ left: itemWidth * count, behavior: 'smooth' });
	}
  
	function startAutoScroll() {
	  if (isPaused) return;
	  stopAutoScroll();
	  scrollSpeed = getScrollSpeed();
  
	  autoScroll = setInterval(() => {
		if (!isScrolling && !isPaused) {
		  track.scrollLeft += scrollSpeed;
  
		  // seamless loop when reaching cloned section
		  if (track.scrollLeft >= track.scrollWidth / 2) {
			track.scrollLeft = 0;
		  }
		}
	  }, 16); // ~60fps
	}
  
	function stopAutoScroll() {
	  clearInterval(autoScroll);
	}
  
	function pauseAutoScroll() {
	  isPaused = true;
	  stopAutoScroll();
	}
  
	function resumeAutoScroll() {
	  isPaused = false;
	  startAutoScroll();
	}
  
	// Manual buttons
	prev.addEventListener('click', () => {
	  pauseAutoScroll();
	  scrollByItems(-1);
	  setTimeout(resumeAutoScroll, 2000);
	});
	
	next.addEventListener('click', () => {
	  pauseAutoScroll();
	  scrollByItems(1);
	  setTimeout(resumeAutoScroll, 2000);
	});
  
	// Touch/swipe support for mobile
	track.addEventListener('touchstart', (e) => {
	  touchStartX = e.touches[0].clientX;
	  isScrolling = true;
	  pauseAutoScroll();
	}, { passive: true });
  
	track.addEventListener('touchmove', () => {
	  isScrolling = true;
	}, { passive: true });
  
	track.addEventListener('touchend', (e) => {
	  touchEndX = e.changedTouches[0].clientX;
	  const swipeDistance = touchStartX - touchEndX;
	  const minSwipeDistance = 50;
  
	  if (Math.abs(swipeDistance) > minSwipeDistance) {
		if (swipeDistance > 0) {
		  // Swiped left - next
		  scrollByItems(1);
		} else {
		  // Swiped right - previous
		  scrollByItems(-1);
		}
	  }
  
	  isScrolling = false;
	  setTimeout(() => {
		isScrolling = false;
		resumeAutoScroll();
	  }, 500);
	}, { passive: true });
  
	// Mouse drag support (for desktop touchpads)
	let isDragging = false;
	let startX = 0;
	let scrollLeft = 0;
  
	track.addEventListener('mousedown', (e) => {
	  isDragging = true;
	  startX = e.pageX - track.offsetLeft;
	  scrollLeft = track.scrollLeft;
	  pauseAutoScroll();
	});
  
	track.addEventListener('mouseleave', () => {
	  isDragging = false;
	  resumeAutoScroll();
	});
  
	track.addEventListener('mouseup', () => {
	  isDragging = false;
	  resumeAutoScroll();
	});
  
	track.addEventListener('mousemove', (e) => {
	  if (!isDragging) return;
	  e.preventDefault();
	  const x = e.pageX - track.offsetLeft;
	  const walk = (x - startX) * 2;
	  track.scrollLeft = scrollLeft - walk;
	});
  
	// Pause on hover (desktop only)
	if (window.matchMedia('(hover: hover)').matches) {
	  carousel.addEventListener('mouseenter', pauseAutoScroll);
	  carousel.addEventListener('mouseleave', resumeAutoScroll);
	}
  
	// Restart on window resize to adjust speed
	window.addEventListener('resize', () => {
	  resumeAutoScroll();
	});
  
	// Prevent auto-scroll when user is interacting
	track.addEventListener('scroll', () => {
	  isScrolling = true;
	  clearTimeout(track.scrollTimeout);
	  track.scrollTimeout = setTimeout(() => {
		isScrolling = false;
		if (!isPaused) resumeAutoScroll();
	  }, 150);
	}, { passive: true });
  
	startAutoScroll();
  })();
  