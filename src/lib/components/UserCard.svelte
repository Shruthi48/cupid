<script lang="ts">
    import Carousel from './Carousel.svelte';

    export let user: {
        nickname: string;
        description?: string;
        gender?: string;
        dob?: string;
        location?: string;
        interests?: string[];
        designation?: string;
        colleaguesSay?: string;
        workLifeBalance?: string;
        guiltyPleasure?: string;
        idealWeekend?: string;
        hobbies?: string;
        favoriteBooks?: string;
        travelDreams?: string;
        lifeGoals?: string;
        idealDate?: string;
        dealBreakers?: string;
        personalValues?: string;
    };
    export let showLikeButton = true;
    export let showChatButton = false;
    export let onLike: () => void;
    export let onChat: () => void;

    let isLiked = false;
    let lastTap = 0;
    let likeAnimation = false;

    function handleDoubleTap() {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300; // ms

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            if (!isLiked) {
                isLiked = true;
                likeAnimation = true;
                onLike();
                setTimeout(() => {
                    likeAnimation = false;
                }, 1000);
            }
        }
        lastTap = now;
    }

    $: slides = [
        {
            icon: '👋',
            title: 'About Me',
            content: user.description || 'No description provided'
        },
        {
            icon: '🎂',
            title: 'Age',
            content: age ? `${age} years old (Born ${new Date(user.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})` : 'Age not shared'
        },
        {
            icon: '💼',
            title: 'Work',
            content: user.designation || 'Career not shared'
        },
        {
            icon: '📍',
            title: 'Location',
            content: `${user.city || ''}, ${user.country || ''}` || 'Location not shared'
        },
        {
            icon: '🎨',
            title: 'Hobbies',
            content: user.hobbies || 'Hobbies not shared'
        },
        {
            icon: '🎯',
            title: 'Life Goals',
            content: user.lifeGoals || 'Life goals not shared'
        },
        {
            icon: '📚',
            title: 'Favorite Books',
            content: user.favoriteBooks || 'Books not shared'
        },
        {
            icon: '✈️',
            title: 'Travel Dreams',
            content: user.travelDreams || 'Travel dreams not shared'
        },
        {
            icon: '🌟',
            title: 'Values',
            content: user.personalValues || 'Values not shared'
        },
        {
            icon: '🌅',
            title: 'Ideal Weekend',
            content: user.idealWeekend || 'Ideal weekend not shared'
        },
        {
            icon: '💝',
            title: 'Ideal Date',
            content: user.idealDate || 'Ideal date not shared'
        },
        {
            icon: '⛔',
            title: 'Deal Breakers',
            content: user.dealBreakers || 'Deal breakers not shared'
        }
    ];

    $: age = user.dob ? calculateAge(user.dob) : null;
    
    function calculateAge(dob: string) {
        const birthDate = new Date(dob);
        const today = new Date('2025-02-18'); // Using the provided current time
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        
        // If birthday hasn't occurred this year, subtract one year
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
</script>

<div class="user-card" on:touchend={handleDoubleTap}>
    <div class="user-header">
        <h3>{user.nickname}</h3>
        {#if showLikeButton}
            <div class="heart-container">
                <div class="heart {isLiked ? 'liked' : ''} {likeAnimation ? 'animate' : ''}">
                    {#if isLiked}
                        ❤️
                    {:else}
                        🤍
                    {/if}
                </div>
            </div>
        {/if}
        {#if showChatButton}
            <button 
                class="action-button chat-button"
                on:click={onChat}
            >
                💬
            </button>
        {/if}
    </div>

    <div class="carousel-container">
        <Carousel {slides} />
    </div>
</div>

<style>
    .user-card {
        background: white;
        border-radius: 1.5rem;
        box-shadow: 0 8px 24px rgba(100, 38, 124, 0.12);
        padding: 1.5rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 2px solid rgba(114, 94, 160, 0.1);
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(8px);
        background: rgba(255, 255, 255, 0.95);
    }

    .user-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(100, 38, 124, 0.18);
        border-color: rgba(114, 94, 160, 0.2);
    }

    .user-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
    }

    h3 {
        color: #64267C;
        font-family: 'Inter', sans-serif;
        font-size: 1.25rem;
        margin: 0;
        font-weight: 600;
        letter-spacing: -0.01em;
    }

    .heart-container {
        position: relative;
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
    }

    .heart-container:hover {
        transform: scale(1.1);
    }

    .heart {
        font-size: 1.75rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        user-select: none;
        filter: drop-shadow(0 2px 4px rgba(100, 38, 124, 0.2));
    }

    .heart.animate {
        animation: heartPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes heartPop {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.5) rotate(8deg);
        }
        100% {
            transform: scale(1);
        }
    }

    .action-button {
        background: none;
        border: none;
        font-size: 1.75rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        line-height: 1;
        filter: drop-shadow(0 2px 4px rgba(100, 38, 124, 0.2));
    }

    .action-button:hover {
        transform: scale(1.1) rotate(4deg);
    }

    .carousel-container {
        border-top: 2px solid rgba(114, 94, 160, 0.08);
        margin-top: 0.75rem;
        padding-top: 1rem;
    }
</style>
