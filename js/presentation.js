class Presentation {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.progressContainer = document.getElementById('progress-dots');
        this.currentSlideEl = document.getElementById('current-slide');
        this.totalSlidesEl = document.getElementById('total-slides');
        
        this.typingTimeouts = [];
        this.init();
    }

    init() {
        // Ensure only the first slide is active on initialization
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev');
            if (i === 0) {
                slide.classList.add('active');
            }
        });
        
        // Update total slides count
        this.totalSlidesEl.textContent = this.totalSlides;
        
        // Create progress dots
        this.createProgressDots();
        
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
        
        // Initial state
        this.updateUI();
        
        // Trigger initial animation
        this.animateCurrentSlide();
    }

    createProgressDots() {
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('progress-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.progressContainer.appendChild(dot);
        }
    }

    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;
        
        const previousIndex = this.currentIndex;
        this.currentIndex = index;
        
        // Update slide classes
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev');
            if (i === this.currentIndex) {
                slide.classList.add('active');
            } else if (i < this.currentIndex) {
                slide.classList.add('prev');
            }
        });
        
        this.updateUI();
        this.animateCurrentSlide();
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    nextSlide() {
        if (this.currentIndex < this.totalSlides - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    updateUI() {
        // Update counter
        this.currentSlideEl.textContent = this.currentIndex + 1;
        
        // Update navigation buttons
        this.prevBtn.classList.toggle('disabled', this.currentIndex === 0);
        this.nextBtn.classList.toggle('disabled', this.currentIndex === this.totalSlides - 1);
        
        // Update progress dots
        const dots = this.progressContainer.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }

    animateCurrentSlide() {
        // Clear any ongoing animations
        this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
        this.typingTimeouts = [];

        const currentSlide = this.slides[this.currentIndex];
        
        // Get ALL direct children and their descendants in DOM order
        const allElements = this.getAnimatableElements(currentSlide);
        
        // Prepare all elements (hide text, prepare bubble elements)
        allElements.forEach(item => {
            if (item.type === 'text') {
                if (!item.el.dataset.originalText) {
                    item.el.dataset.originalText = item.el.textContent;
                }
                // Store original height before clearing to prevent layout shift
                const originalHeight = item.el.offsetHeight;
                item.el.style.minHeight = originalHeight + 'px';
                item.el.textContent = '';
                item.el.style.visibility = 'hidden'; // Hide completely until typing starts
            } else {
                // Hide bubble elements initially
                item.el.style.opacity = '0';
                item.el.classList.remove('bubble-up');
            }
        });

        // Animate all elements sequentially
        this.animateSequentially(allElements, 0);
    }

    getAnimatableElements(slide) {
        // Get all elements we want to animate
        const textSelectors = 'h1, h2, h3, .subtitle, .tagline, .description, p';
        const bubbleSelectors = '.intro-hero, .hero-image, .title-row, .highlights-grid, .highlight-card, .tech-stack, .tech-group, .creator-card, .creator-details, .detail-item, .options-container, .option-card, .price-hero, .free-benefits, .benefit-item, .callout-box, ul, li, img';
        
        const allAnimatable = slide.querySelectorAll(`${textSelectors}, ${bubbleSelectors}`);
        
        // Convert to array with type info, sorted by DOM position (natural order)
        const elements = [];
        const textSelectorList = textSelectors.split(', ');
        
        allAnimatable.forEach(el => {
            const isText = textSelectorList.some(sel => el.matches(sel.trim()));
            
            // Containers where text should NOT be typed separately (animate as part of bubble)
            const noTypeInsideSelectors = '.creator-card, .detail-item, .highlight-card, .option-card, .benefit-item, .tech-group, li';
            
            // Check if element is inside a container that should animate as a unit
            let parent = el.parentElement;
            let isInsideNoTypeContainer = false;
            let isInsideBubbleContainer = false;
            
            while (parent && parent !== slide) {
                if (parent.matches && parent.matches(noTypeInsideSelectors)) {
                    isInsideNoTypeContainer = true;
                }
                if (parent.matches && parent.matches(bubbleSelectors)) {
                    isInsideBubbleContainer = true;
                }
                parent = parent.parentElement;
            }
            
            // Skip text elements inside no-type containers (let them animate with their parent bubble)
            if (isText && isInsideNoTypeContainer) {
                return;
            }
            
            // Skip bubble elements inside other bubbles (avoid duplicates)
            if (!isText && isInsideBubbleContainer) {
                return;
            }
            
            elements.push({
                el: el,
                type: isText ? 'text' : 'bubble'
            });
        });
        
        return elements;
    }

    animateSequentially(elements, index) {
        if (index >= elements.length) return;
        
        const item = elements[index];
        
        if (item.type === 'text') {
            this.typeElement(item.el, () => {
                this.animateSequentially(elements, index + 1);
            });
        } else {
            this.bubbleElement(item.el, () => {
                this.animateSequentially(elements, index + 1);
            });
        }
    }

    typeElement(el, onComplete) {
        const text = el.dataset.originalText || '';
        el.textContent = '';
        el.style.visibility = 'visible'; // Make visible when typing starts
        el.classList.add('typing-cursor');
        
        let charIndex = 0;
        const speed = 15; // ms per character
        
        const typeNext = () => {
            if (charIndex < text.length) {
                el.textContent += text.charAt(charIndex);
                charIndex++;
                const timeout = setTimeout(typeNext, speed);
                this.typingTimeouts.push(timeout);
            } else {
                el.classList.remove('typing-cursor');
                // Small pause then continue
                const pauseTimeout = setTimeout(onComplete, 50);
                this.typingTimeouts.push(pauseTimeout);
            }
        };
        
        typeNext();
    }

    bubbleElement(el, onComplete) {
        el.style.opacity = '';
        el.classList.add('bubble-up');
        
        // Wait for animation to complete (600ms) then continue
        const timeout = setTimeout(onComplete, 300);
        this.typingTimeouts.push(timeout);
    }
}

// Initialize presentation
document.addEventListener('DOMContentLoaded', () => {
    new Presentation();
});
