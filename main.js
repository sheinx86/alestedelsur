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

    // Carousel logic
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    
    // Get width of a slide + gap
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 32; // 2rem = ~32px
    const moveAmount = slideWidth + gap;

    let currentIndex = 0;

    const updateCarousel = () => {
        track.style.transform = `translateX(-${currentIndex * moveAmount}px)`;
        
        // Update button states
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevButton.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        
        // Visible slides calculation approx
        const visibleSlides = Math.floor(track.parentElement.clientWidth / moveAmount);
        const maxIndex = slides.length - visibleSlides;
        
        nextButton.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
        nextButton.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
    };

    nextButton.addEventListener('click', () => {
        const visibleSlides = Math.floor(track.parentElement.clientWidth / moveAmount);
        const maxIndex = slides.length - visibleSlides;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Initialize carousel state
    updateCarousel();

    // Resize handling for carousel
    window.addEventListener('resize', () => {
        updateCarousel();
    });

    // Simple drag for carousel (touch/mouse)
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;

    track.addEventListener('mousedown', dragStart);
    track.addEventListener('touchstart', dragStart, {passive: true});
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);
    track.addEventListener('touchend', dragEnd);
    track.addEventListener('mousemove', drag);
    track.addEventListener('touchmove', drag, {passive: true});

    function dragStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none'; // remove transition during drag
    }

    function drag(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function dragEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const movedBy = currentTranslate - prevTranslate;
        
        // Threshold to change slide
        if (movedBy < -100) currentIndex++;
        if (movedBy > 100) currentIndex--;
        
        // Bounds check
        const visibleSlides = Math.floor(track.parentElement.clientWidth / moveAmount);
        const maxIndex = slides.length - visibleSlides;
        
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        
        updateCarousel();
        prevTranslate = -currentIndex * moveAmount;
    }

    function animation() {
        if (isDragging) {
            setSliderPosition();
            requestAnimationFrame(animation);
        }
    }

    function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
    }
});
