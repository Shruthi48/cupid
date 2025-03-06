<script>
    export let size = 32;
</script>

<svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Flower petals - more flowing and elegant -->
    <path d="M16 8C16 8 12 10 10 14C8 18 10 22 14 22C18 22 20 18 16 8Z" fill="#333333"/>
    <path d="M16 8C16 8 20 10 22 14C24 18 22 22 18 22C14 22 12 18 16 8Z" fill="#333333"/>
    <path d="M8 16C8 16 10 12 14 10C18 8 22 10 22 14C22 18 18 20 8 16Z" fill="#333333"/>
    <path d="M8 16C8 16 10 20 14 22C18 24 22 22 22 18C22 14 18 12 8 16Z" fill="#333333"/>
    
    <!-- Center with subtle gradient -->
    <circle cx="16" cy="16" r="3" fill="#333333">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    <!-- Decorative swirls -->
    <path d="M16 24C16 24 14 26 12 27C10 28 8 28 7 26" stroke="#333333" stroke-width="1" stroke-linecap="round"/>
    <path d="M16 24C16 24 18 26 20 27C22 28 24 28 25 26" stroke="#333333" stroke-width="1" stroke-linecap="round"/>
</svg>

<style>
    svg {
        display: block;
    }
    
    svg path {
        transition: all 0.3s ease;
    }
    
    svg:hover path {
        transform-origin: center;
        transform: scale(1.05);
    }
</style>