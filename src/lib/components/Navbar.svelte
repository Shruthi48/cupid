<script lang="ts">
    import { goto } from '$app/navigation';
    import { pb } from '$lib/pocketbase';

    let showDropdown = false;
    let showMenu = false;

    function toggleDropdown() {
        showDropdown = !showDropdown;
        showMenu = false;
    }

    function toggleMenu() {
        showMenu = !showMenu;
        showDropdown = false;
    }

    function logout() {
        pb.authStore.clear();
        goto('/login');
    }

    function goToProfile() {
        goto('/profile');
    }
</script>

<nav class="navbar">
    <div class="nav-content">
        <button class="menu-button" on:click={toggleMenu}>
            <div class="hamburger {showMenu ? 'active' : ''}">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </button>
        <a href="/find" class="logo">Wallflower</a>
        <div class="nav-right">
            <button class="profile-button" on:click={toggleDropdown}>
                <span class="avatar">
                    {#if pb.authStore.model?.nickname}
                        {pb.authStore.model.nickname[0].toUpperCase()}
                    {:else}
                        U
                    {/if}
                </span>
                {#if showDropdown}
                    <div class="dropdown">
                        <button on:click={goToProfile}>Profile</button>
                        <button on:click={logout}>Logout</button>
                    </div>
                {/if}
            </button>
        </div>
    </div>
    {#if showMenu}
        <div class="mobile-menu">
            <button on:click={goToProfile}>Profile</button>
            <button on:click={logout}>Logout</button>
        </div>
    {/if}
</nav>

<style>
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(114, 94, 160, 0.1);
        z-index: 1000;
    }

    .nav-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .menu-button {
        display: none;
        background: none;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
    }

    .hamburger {
        width: 24px;
        height: 20px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .hamburger span {
        display: block;
        width: 100%;
        height: 2px;
        background: #64267C;
        border-radius: 2px;
        transition: all 0.3s ease;
    }

    .hamburger.active span:nth-child(1) {
        transform: translateY(9px) rotate(45deg);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: translateY(-9px) rotate(-45deg);
    }

    .logo {
        font-family: Inter;
        font-size: 1.5rem;
        font-weight: 700;
        color: #64267C;
        text-decoration: none;
        letter-spacing: -0.02em;
    }

    .nav-right {
        position: relative;
    }

    .profile-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        position: relative;
    }

    .avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: #64267C;
        color: white;
        border-radius: 50%;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .profile-button:hover .avatar {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(100, 38, 124, 0.2);
    }

    .dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        min-width: 150px;
    }

    .dropdown button {
        display: block;
        width: 100%;
        padding: 0.75rem 1.25rem;
        text-align: left;
        background: none;
        border: none;
        font-size: 0.9375rem;
        color: #333;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .dropdown button:hover {
        background: rgba(114, 94, 160, 0.1);
        color: #64267C;
    }

    .mobile-menu {
        display: none;
        background: white;
        padding: 1rem;
        border-top: 1px solid rgba(114, 94, 160, 0.1);
    }

    .mobile-menu button {
        display: block;
        width: 100%;
        padding: 0.75rem 1rem;
        text-align: left;
        background: none;
        border: none;
        font-size: 1rem;
        color: #333;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .mobile-menu button:hover {
        background: rgba(114, 94, 160, 0.1);
        color: #64267C;
    }

    @media (max-width: 640px) {
        .nav-content {
            padding: 1rem;
        }

        .logo {
            font-size: 1.25rem;
        }

        .menu-button {
            display: block;
        }

        .profile-button {
            display: none;
        }

        .mobile-menu {
            display: block;
        }
    }
</style>
