<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { currentUser } from '$lib/pocketbase';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import UserCard from '$lib/components/UserCard.svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import { cities } from '$lib/constants';
    import { slide } from 'svelte/transition';
    
    let users = [];
    let allUsers = [];
    let loading = true;
    let error = '';
    let activeTab = 'all'; // 'all' | 'liked' | 'matches'
    let showFilters = false;
    let isFilterExpanded = true;

    // Filter states
    let selectedCity = '';
    let minAge = 18;
    let maxAge = 60;
    let filteredUsers = [];

    $: isLoggedIn = !!$currentUser;
    $: userGender = $currentUser?.gender || '';
    $: oppositeGender = userGender === 'male' ? 'female' : 'male';
    $: description = $currentUser?.description || '';
    $: dob = $currentUser?.dob || '';

    function calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function applyFilters() {
        filteredUsers = users.filter(user => {
            const age = calculateAge(user.dob);
            const cityMatch = !selectedCity || user.city === selectedCity;
            const ageMatch = age >= minAge && age <= maxAge;
            return cityMatch && ageMatch;
        });
    }

    $: {
        // Reactive statement to update filtered users when filters change
        if (users.length > 0) {
            applyFilters();
        }
    }

    $: activeFiltersCount = [
        selectedCity !== '',
        minAge !== 18 || maxAge !== 60
    ].filter(Boolean).length;

    async function fetchAllUsers() {
        try {
            loading = true;
            error = '';

            if (!isLoggedIn || !userGender) {
                users = [];
                return;
            }

            const resultList = await pb.collection('users').getList(1, 50, {
                filter: `gender = "${oppositeGender}"`,
             });


            users = resultList.items;
            allUsers = resultList.items;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }


    async function fetchLikedUsers() {
        try {
            loading = true;
            error = '';

            const likes = await pb.collection('likes').getList(1, 50, {
                    filter: `liked_user = "${$currentUser.id}"`,
                    expand: 'user',
                });
                users = likes.items
                    .map(like => like.expand.user)
                    .filter(user => user.gender === oppositeGender);
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }


    async function fetchMatches() {
        try {
            loading = true;
            error = '';

            const myLikes = await pb.collection('likes').getList(1, 50, {
                filter: `user = "${$currentUser.id}"`
            });
            const likedMeList = await pb.collection('likes').getList(1, 50, {
                filter: `liked_user = "${$currentUser.id}"`,
                expand: 'user'
            });

            const myLikedUsers = new Set(myLikes.items.map(like => like.liked_user));
            users = likedMeList.items
                .filter(like => myLikedUsers.has(like.user))
                .map(like => like.expand.user)
                .filter(user => user.gender === oppositeGender);
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

  
    $: if (activeTab === 'liked') {
        fetchLikedUsers();
    }

    $: if (activeTab === 'all') {
        users = allUsers;
    }

    $: if (activeTab === 'matches') {
        fetchMatches();
    }

    async function toggleLike(user) {
        try {
            const existingLike = await pb.collection('likes').getFirstListItem(
                `user = "${$currentUser.id}" && liked_user = "${user.id}"`
            ).catch(() => null);

            if (existingLike) {
                await pb.collection('likes').delete(existingLike.id);
            } else {
                await pb.collection('likes').create({
                    user: $currentUser.id,
                    liked_user: user.id
                });
            }
        } catch (err) {
            console.error('Error toggling like:', err);
        }
    }

    function startChat(user) {
        goto(`/chat/${user.id}`);
    }

    function handleLogout() {
        pb.authStore.clear();
        goto('/login');
    }

    function toggleFilters() {
        showFilters = !showFilters;
    }

    function toggleFilter() {
        isFilterExpanded = !isFilterExpanded;
    }

    function handleTabChange(tab) {
        activeTab = tab;
    }

    onMount(() => {
        if (!isLoggedIn) {
            goto('/login');
            return;
        }

        if(!dob) {
            goto('/basic-details');
        }
        fetchAllUsers();
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<Navbar />
<div class="page-container">
    <div class="top-bar">
        <div class="tabs">
            <button 
                class="tab-button" 
                class:active={activeTab === 'all'}
                on:click={() => handleTabChange('all')}
            >
                <span class="tab-icon">🌱</span>
                All
            </button>
            <button 
                class="tab-button" 
                class:active={activeTab === 'liked'}
                on:click={() => handleTabChange('liked')}
            >
                <span class="tab-icon">🌸</span>
                Likes
            </button>
            <button 
                class="tab-button" 
                class:active={activeTab === 'matches'}
                on:click={() => handleTabChange('matches')}
            >
                <span class="tab-icon">🌺</span>
                Blooms
            </button>
        </div>
        <button 
            class="filter-toggle" 
            class:active={showFilters}
            on:click={toggleFilters}
            aria-label="Toggle filters"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            {#if activeFiltersCount > 0}
                <span class="filter-badge">{activeFiltersCount}</span>
            {/if}
        </button>
    </div>

    {#if showFilters}
        <div class="filters-container" 
             transition:slide={{duration: 200}}
             on:outroend={() => {
                 if (!showFilters) isFilterExpanded = true;
             }}>
            <div class="filters">
                <div class="filter-header" on:click={toggleFilter}>
                    <div class="header-content">
                        <h2>Filters</h2>
                        <div class="filter-summary" class:hidden={isFilterExpanded}>
                            {#if selectedCity || minAge !== 18 || maxAge !== 60}
                                <span>
                                    {#if selectedCity}City: {selectedCity}{/if}
                                    {#if minAge !== 18 || maxAge !== 60}
                                        {#if selectedCity} • {/if}
                                        Age: {minAge}-{maxAge}
                                    {/if}
                                </span>
                            {:else}
                                <span>No filters applied</span>
                            {/if}
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="reset-filters" on:click|stopPropagation={() => {
                            selectedCity = '';
                            minAge = 18;
                            maxAge = 60;
                        }}>Reset</button>
                        <button class="toggle-filter" on:click|stopPropagation={toggleFilter}>
                            <svg class="chevron-icon" class:rotated={!isFilterExpanded} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="filter-content" class:collapsed={!isFilterExpanded}>
                    <div class="filter-grid">
                        <div class="filter-field">
                            <label for="city">City</label>
                            <div class="select-wrapper">
                                <select id="city" bind:value={selectedCity}>
                                    <option value="">All Cities</option>
                                    {#each cities as city}
                                        <option value={city}>{city}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                        <div class="filter-field">
                            <label>Age Range</label>
                            <div class="age-range">
                                <div class="age-input">
                                    <input 
                                        type="number" 
                                        bind:value={minAge} 
                                        min="18" 
                                        max={maxAge}
                                        placeholder="Min"
                                    />
                                </div>
                                <span>to</span>
                                <div class="age-input">
                                    <input 
                                        type="number" 
                                        bind:value={maxAge} 
                                        min={minAge} 
                                        max="100"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {#if filteredUsers.length > 0}
                        <div class="filter-results">
                            Found {filteredUsers.length} matches
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    <!-- {#if isLoggedIn}
        <button class="logout-button" on:click={handleLogout}>
            <span class="logout-icon">x</span>
        </button>
    {/if} -->
    <div class="content">
        {#if error}
            <div class="error">{error}</div>
        {/if}

        {#if loading}
            <div class="loading">Loading users...</div>
        {:else if !isLoggedIn}
            <div class="message">Please log in to view matches</div>
        {:else if !userGender}
            <div class="message">Please update your gender to view matches</div>
        {:else if filteredUsers.length === 0}
            <div class="message">
                {#if activeTab === 'all'}
                    No users found at the moment
                {:else if activeTab === 'liked'}
                    No one has liked you yet
                {:else}
                    No matches yet
                {/if}
            </div>
        {:else}
            <div class="users-grid">
                {#each filteredUsers as user}
                    <UserCard 
                        {user}
                        showLikeButton={activeTab !== 'matches'}
                        showChatButton={activeTab === 'matches'}
                        onLike={() => toggleLike(user)}
                        onChat={() => startChat(user)}
                    />
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
    }

    .page-container {
        min-height: 100vh;
        background: linear-gradient(185deg, #F8F7FF 0%, #725EA0 100%);
        padding: 2rem 1rem;
    }

    .content {
        max-width: 800px;
        margin: 10px auto 0 auto;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        animation: fadeIn 0.5s ease forwards;
    }

    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        margin-bottom: 24px;
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin-top: 50px;
    }

    .filter-toggle {
        background: none;
        border: none;
        padding: 10px;
        cursor: pointer;
        color: #4a5568;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border-radius: 8px;
        width: 40px;
        height: 40px;
    }

    .filter-toggle:hover {
        background-color: #f7fafc;
        color: #64267C;
    }

    .filter-toggle.active {
        background-color: rgba(100, 38, 124, 0.1);
        color: #64267C;
    }

    .filter-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        background-color: #64267C;
        color: white;
        font-size: 12px;
        font-weight: 500;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tabs {
        display: flex;
        gap: 4px;
        background-color: #f7fafc;
        padding: 4px;
        border-radius: 12px;
    }

    .tab-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 24px;
        border: none;
        background: none;
        color: #4a5568;
        font-size: 15px;
        font-weight: 500;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        min-width: 120px;
        justify-content: center;
    }

    .tab-button:hover {
        background-color: rgba(100, 38, 124, 0.05);
        color: #64267C;
    }

    .tab-button.active {
        background-color: #64267C;
        color: white;
    }

    .tab-icon {
        font-size: 18px;
    }

    .filters {
        background-color: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
        cursor: pointer;
        user-select: none;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .filter-summary {
        font-size: 14px;
        color: #718096;
    }

    .filter-summary.hidden {
        display: none;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .toggle-filter {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        color: #4a5568;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .toggle-filter:hover {
        color: #2d3748;
    }

    .chevron-icon {
        transition: transform 0.3s ease;
    }

    .chevron-icon.rotated {
        transform: rotate(180deg);
    }

    .filter-content {
        max-height: 500px;
        opacity: 1;
        overflow: hidden;
        transition: all 0.3s ease-in-out;
    }

    .filter-content.collapsed {
        max-height: 0;
        opacity: 0;
        margin-top: -20px;
    }

    .reset-filters {
        padding: 8px 16px;
        font-size: 14px;
        color: #667eea;
        background-color: #ebf4ff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .reset-filters:hover {
        background-color: #c3dafe;
        color: #5a67d8;
    }

    .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        margin-bottom: 16px;
    }

    .filter-field {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .filter-field label {
        font-size: 14px;
        font-weight: 500;
        color: #4a5568;
    }

    .select-wrapper {
        position: relative;
    }

    .select-wrapper::after {
        content: '';
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #4a5568;
        pointer-events: none;
    }

    .filter-field select,
    .age-input input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 14px;
        background-color: white;
        transition: all 0.2s ease;
        color: #2d3748;
    }

    .filter-field select {
        cursor: pointer;
        appearance: none;
        padding-right: 40px;
    }

    .age-range {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .age-input {
        flex: 1;
        position: relative;
    }

    .age-range span {
        color: #718096;
        font-size: 14px;
        font-weight: 500;
    }

    select:focus,
    input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }

    select:hover,
    input:hover {
        border-color: #cbd5e0;
    }

    .filter-results {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
        color: #4a5568;
        font-size: 14px;
        font-weight: 500;
    }

    /* Remove number input arrows */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    @keyframes slideDown {
        from {
            transform: translateY(-10px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .filters-container {
        animation: slideDown 0.3s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .users-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .error {
        color: #dc3545;
        background-color: rgba(220, 53, 69, 0.1);
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 0.75rem;
        font-size: 0.9375rem;
    }

    .loading, .message {
        text-align: center;
        padding: 2rem;
        color: #666;
        font-size: 1rem;
        background: rgba(100, 38, 124, 0.05);
        border-radius: 0.75rem;
        margin: 1rem 0;
    }

    @media (max-width: 640px) {
        .top-bar {
            padding: 12px;
            margin-bottom: 16px;
        }

        .tab-button {
            padding: 8px 16px;
            font-size: 14px;
            min-width: auto;
        }

        .tab-icon {
            font-size: 16px;
        }

        .filter-toggle {
            width: 36px;
            height: 36px;
        }
    }
</style>