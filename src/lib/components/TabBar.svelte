<script>
    export let activeTab = 'all';
    export let onTabChange;

    const tabs = [
        { id: 'all', icon: '🌱', label: 'All' },
        { id: 'liked', icon: '🌸', label: 'Likes' },
        { id: 'matches', icon: '🌺', label: 'Blooms' }
    ];
</script>

<div class="tabs">
    {#each tabs as tab}
        <button 
            class="tab-button" 
            class:active={activeTab === tab.id}
            on:click={() => onTabChange(tab.id)}
        >
            <span class="tab-icon">{tab.icon}</span>
            {tab.label}
        </button>
    {/each}
</div>

<style>
    .tabs {
        display: flex;
        gap: 8px;
        padding: 8px;
    }

    .tab-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        background: white;
        color: #666;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .tab-button:hover {
        background: #f0f0f0;
    }

    .tab-button.active {
        background: #e0e0e0;
        color: #333;
    }

    .tab-icon {
        font-size: 1.2rem;
    }
</style>
