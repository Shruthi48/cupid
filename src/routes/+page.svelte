<script lang="ts">
    import { goto } from '$app/navigation';
    import Logo from '$lib/components/Logo.svelte';
    import Illustration from '$lib/assets/homepage.png';
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="landing-container">
    <div class="content">
        <div class="logo-section">
            <h1>Welcome to</h1>
            <div class="logo">
                <!-- <Logo size={40} /> -->
                <span class="text">Wallflower</span>
            </div>
            <p class="tagline">Let your connection bloom</p>
        </div>

        <img src={Illustration} alt="Illustration" width="100%" height="auto" class="main-illustration"/>

        <div class="buttons">
            <button class="primary" on:click={() => goto('/signup')}>
                Create a free account
            </button>
            <button class="secondary" on:click={() => goto('/login')}>
                Already have one? Sign in
            </button>
        </div>

        <p class="terms">
            By proceeding, you agree to the<br>
            <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
        </p>
    </div>
</div>

<style>
    :global(body) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
    }

    .landing-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(185deg, #F8F7FF 0%, #725EA0 100%);
        padding: 1rem;
    }

    .content {
        width: 100%;
        max-width: 400px;
        text-align: center;
        padding: 2rem;
    }

    .logo-section {
        margin-bottom: 3rem;
    }

    h1 {
        font-family: Inter;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: white;
        opacity: 0;
        line-height: 1;
        margin-bottom: 0.25rem;
        animation: fadeInDown 1s ease forwards;
    }

    .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 0.75rem;
    }

    .text {
        font-family: Inter;
        font-size: 2.5rem;
        font-weight: 700;
        color: #64267C;
        line-height: 0.8;
        margin-top: 0.25rem;
        opacity: 0;
        animation: fadeInDown 1s ease forwards 0.3s;
    }

    .tagline {
        font-family: Inter;
        font-size: 1.2rem;
        color: #64267C;
        margin-top: 1rem;
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s ease forwards 0.8s;
    }

    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .main-illustration {
        opacity: 0;
        transform: scale(0.95);
        animation: fadeInScale 1s ease forwards 1.2s;
    }

    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 2rem;
    }

    button {
        width: 100%;
        padding: 0.875rem;
        border-radius: 2rem;
        border: none;
        font-size: 0.9375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    button:hover {
        transform: translateY(-1px);
    }

    button:active {
        transform: translateY(0);
    }

    .primary {
        background: #333;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .primary:hover {
        background: #404040;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .secondary {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        backdrop-filter: blur(10px);
    }

    .secondary:hover {
        background: rgba(255, 255, 255, 1);
    }

    .terms {
        font-size: 0.8125rem;
        color: #333;
        line-height: 1.5;
        margin: 0;
    }

    a {
        color: #333;
        text-decoration: none;
        font-weight: 500;
    }

    a:hover {
        text-decoration: underline;
    }
</style>