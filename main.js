document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Reveal on scroll
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    reveals.forEach(reveal => revealObserver.observe(reveal));

    // Carousel logic
    const track = document.querySelector('.carousel-track');
    if (!track) return;
    
    const originalSlides = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    
    // Clonamos los slides para crear el efecto infinito (Set 1 - Set 2 - Set 3)
    originalSlides.forEach(slide => track.appendChild(slide.cloneNode(true)));
    originalSlides.forEach(slide => track.appendChild(slide.cloneNode(true)));

    const allSlides = Array.from(track.children);
    let currentIndex = originalSlides.length; // Empezamos en el medio
    
    const getMoveAmount = () => {
        const slideWidth = allSlides[0].getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 32;
        return slideWidth + gap;
    };

    const updateCarousel = (instant = false) => {
        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s ease-in-out';
        }
        track.style.transform = `translateX(-${currentIndex * getMoveAmount()}px)`;
    };

    // Inicializar sin transición
    updateCarousel(true);

    const checkIndex = () => {
        track.style.transition = 'none';
        if (currentIndex < originalSlides.length) {
            currentIndex += originalSlides.length;
            updateCarousel(true);
        } else if (currentIndex >= originalSlides.length * 2) {
            currentIndex -= originalSlides.length;
            updateCarousel(true);
        }
    };

    track.addEventListener('transitionend', checkIndex);

    const moveNext = () => {
        // Wrap prevention si se clica muy rápido
        if (currentIndex >= originalSlides.length * 2) {
            currentIndex -= originalSlides.length;
            updateCarousel(true);
            track.offsetHeight;
        }
        currentIndex++;
        updateCarousel();
    };

    const movePrev = () => {
        if (currentIndex <= 0) {
            currentIndex += originalSlides.length;
            updateCarousel(true);
            track.offsetHeight;
        }
        currentIndex--;
        updateCarousel();
    };

    if (nextButton) nextButton.addEventListener('click', moveNext);
    if (prevButton) prevButton.addEventListener('click', movePrev);

    // Autoplay
    let autoplayInterval = setInterval(moveNext, 2000);

    const pauseAutoplay = () => clearInterval(autoplayInterval);
    const resumeAutoplay = () => {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(moveNext, 2000);
    };

    track.addEventListener('mouseenter', pauseAutoplay);
    track.addEventListener('mouseleave', resumeAutoplay);
    track.addEventListener('touchstart', pauseAutoplay, {passive: true});
    track.addEventListener('touchend', resumeAutoplay);

    // Dragging
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    track.addEventListener('mousedown', dragStart);
    track.addEventListener('touchstart', dragStart, {passive: true});
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, {passive: true});

    function dragStart(event) {
        if (event.target.closest('.carousel-btn')) return;
        isDragging = true;
        pauseAutoplay();
        startPos = getPositionX(event);
        track.style.transition = 'none';
        prevTranslate = -(currentIndex * getMoveAmount());
    }

    function drag(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
            track.style.transform = `translateX(${currentTranslate}px)`;
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -50) moveNext();
        else if (movedBy > 50) movePrev();
        else updateCarousel();
        
        resumeAutoplay();
    }
    
    window.addEventListener('resize', () => {
        updateCarousel(true);
    });
});
