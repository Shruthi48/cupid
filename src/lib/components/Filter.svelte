<script>
    import { createEventDispatcher } from 'svelte';
    import { cities } from '$lib/constants';
    import { slide } from 'svelte/transition';
    
    const dispatch = createEventDispatcher();
    
    export let showFilters = false;
    export let isFilterExpanded = true;
    export let selectedCity = '';
    export let minAge = 18;
    export let maxAge = 60;
    export let filteredUsers = [];
    export let allUsers = [];

    // Temporary filter values
    let tempCity = selectedCity;
    let tempMinAge = minAge;
    let tempMaxAge = maxAge;

    $: activeFiltersCount = [
        selectedCity !== '',
        minAge !== 18 || maxAge !== 60
    ].filter(Boolean).length;

    function toggleFilters() {
        showFilters = !showFilters;
    }

    function toggleFilter() {
        isFilterExpanded = !isFilterExpanded;
    }

    function resetFilters() {
        tempCity = '';
        tempMinAge = 18;
        tempMaxAge = 60;
        // Dispatch reset event to parent
        dispatch('resetFilter');
        showFilters = false;
    }

    function handleSubmit() {
        dispatch('submitFilter', {
            city: tempCity,
            minAge: tempMinAge,
            maxAge: tempMaxAge
        });
        showFilters = false;
    }

    $: {
        // Keep temp values in sync when parent values change
        if (showFilters) {
            tempCity = selectedCity;
            tempMinAge = minAge;
            tempMaxAge = maxAge;
        }
    }
</script>

<div class="filter-section">
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
                            {#if tempCity || tempMinAge !== 18 || tempMaxAge !== 60}
                                <span>
                                    {#if tempCity}City: {tempCity}{/if}
                                    {#if tempMinAge !== 18 || tempMaxAge !== 60}
                                        {#if tempCity} • {/if}
                                        Age: {tempMinAge}-{tempMaxAge}
                                    {/if}
                                </span>
                            {:else}
                                <span>No filters applied</span>
                            {/if}
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="reset-filters" on:click|stopPropagation={resetFilters}>
                            Reset
                        </button>
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
                                <select id="city" bind:value={tempCity}>
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
                                        bind:value={tempMinAge} 
                                        min="18" 
                                        max={tempMaxAge}
                                        placeholder="Min"
                                    />
                                </div>
                                <span>to</span>
                                <div class="age-input">
                                    <input 
                                        type="number" 
                                        bind:value={tempMaxAge} 
                                        min={tempMinAge} 
                                        max="100"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="filter-actions">
                        <div class="filter-results">
                            Found {filteredUsers.length} matches
                        </div>
                        <button class="submit-button" on:click={handleSubmit}>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .filter-section {
        position: relative;
    }

    .filter-toggle {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        position: relative;
        color: #4a5568;
    }

    .filter-toggle.active {
        color: #553c9a;
    }

    .filter-badge {
        position: absolute;
        top: 0;
        right: 0;
        background-color: #553c9a;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .filters-container {
        position: absolute;
        top: 100%;
        right: 0;
        width: 320px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        z-index: 10;
        margin-top: 8px;
    }

    .filters {
        padding: 16px;
    }

    .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        cursor: pointer;
    }

    .header-content h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
    }

    .filter-summary {
        font-size: 14px;
        color: #4a5568;
        margin-top: 4px;
    }

    .filter-summary.hidden {
        display: none;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .reset-filters {
        background: none;
        border: none;
        color: #553c9a;
        font-size: 14px;
        cursor: pointer;
        padding: 4px 8px;
    }

    .toggle-filter {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #4a5568;
    }

    .chevron-icon {
        transition: transform 0.2s ease;
    }

    .chevron-icon.rotated {
        transform: rotate(180deg);
    }

    .filter-content {
        transition: max-height 0.2s ease;
        overflow: hidden;
    }

    .filter-content.collapsed {
        max-height: 0;
    }

    .filter-grid {
        display: grid;
        gap: 16px;
        margin-bottom: 16px;
    }

    .filter-field label {
        display: block;
        font-size: 14px;
        color: #4a5568;
        margin-bottom: 4px;
    }

    .select-wrapper {
        position: relative;
    }

    select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background-color: white;
        font-size: 14px;
        color: #2d3748;
        appearance: none;
    }

    .age-range {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .age-input {
        flex: 1;
    }

    .age-input input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 14px;
        color: #2d3748;
    }

    .filter-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
    }

    .filter-results {
        font-size: 14px;
        color: #4a5568;
    }

    .submit-button {
        background-color: #553c9a;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .submit-button:hover {
        background-color: #4c3490;
    }

    @media (max-width: 640px) {
        .filters-container {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            margin: 0;
            border-radius: 12px 12px 0 0;
        }
    }
</style>
