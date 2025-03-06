<script lang="ts">
    export let slides: { content: string; icon: string; title: string }[];
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function next() {
        currentIndex = (currentIndex + 1) % slides.length;
    }

    function prev() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    }

    function handleTouchStart(event: TouchEvent) {
        touchStartX = event.touches[0].clientX;
    }

    function handleTouchEnd(event: TouchEvent) {
        touchEndX = event.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
            if (swipeDistance > 0) {
                prev();
            } else {
                next();
            }
        }
    }
</script>

<div 
    class="carousel" 
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
>
    <div class="slide">
        <span class="slide-icon">{slides[currentIndex].icon}</span>
        <h4 class="slide-title">{slides[currentIndex].title}</h4>
        <p class="slide-content">{slides[currentIndex].content}</p>
    </div>

    <div class="dots">
        {#each slides as _, i}
            <button 
                class="dot" 
                class:active={i === currentIndex}
                on:click={() => currentIndex = i}
            />
        {/each}
    </div>
</div>

<style>
    .carousel {
        position: relative;
        width: 100%;
        padding: 1rem 0;
        touch-action: pan-y pinch-zoom;
    }

    .slide {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        min-height: 120px;
        text-align: center;
        animation: fadeIn 0.3s ease;
        user-select: none;
        padding: 0 1rem;
    }

    .slide-icon {
        font-size: 1.75rem;
        filter: drop-shadow(0 2px 4px rgba(100, 38, 124, 0.2));
    }

    .slide-title {
        margin: 0;
        font-size: 1rem;
        color: #64267C;
        font-weight: 600;
    }

    .slide-content {
        margin: 0;
        font-size: 0.9375rem;
        color: #666;
        line-height: 1.4;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
        max-width: 100%;
    }

    .dots {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ddd;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .dot:hover {
        background: #64267C;
        opacity: 0.6;
    }

    .dot.active {
        background: #64267C;
        transform: scale(1.2);
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
