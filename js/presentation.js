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
        
        this.init();
    }

    init() {
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
}

// Initialize presentation
document.addEventListener('DOMContentLoaded', () => {
    new Presentation();
});
