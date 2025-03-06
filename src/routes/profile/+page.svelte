<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { onMount } from 'svelte';
    import {
        countries,
        cities,
        designations,
        personalValueOptions,
        hobbyOptions,
        lifeGoalOptions,
        firstDateOptions,
        dealBreakerOptions,
        weekendActivityOptions
    } from '$lib/constants';

    let userData = {
        nickname: '',
        gender: '',
        phoneNumber: '',
        dob: '',
        country: '',
        city: '',
        designation: '',
        description: '',
        colleaguesSay: '',
        workLifeBalance: '',
        guiltyPleasure: '',
        idealWeekend: '',
        hobbies: '',
        favoriteBooks: '',
        travelDreams: '',
        lifeGoals: '',
        idealDate: '',
        dealBreakers: '',
        personalValues: ''
    };

    let isEditing = false;
    let loading = false;
    let error = '';
    let success = '';
    let editedValues = [];
    let customValue = '';
    let editedHobbies = [];
    let customHobby = '';
    let editedLifeGoals = [];
    let customLifeGoal = '';
    let editedFirstDates = [];
    let customFirstDate = '';
    let editedDealBreakers = [];
    let customDealBreaker = '';
    let editedWeekendActivities = [];
    let customWeekendActivity = '';

    onMount(async () => {
        if (!pb.authStore.model?.id) {
            return;
        }
        try {
            const user = await pb.collection('users').getOne(pb.authStore.model.id);
            userData = {
                nickname: user.nickname || '',
                gender: user.gender || '',
                phoneNumber: user.phoneNumber || '',
                dob: user.dob || '',
                country: user.country || '',
                city: user.city || '',
                designation: user.designation || '',
                description: user.description || '',
                colleaguesSay: user.colleaguesSay || '',
                workLifeBalance: user.workLifeBalance || '',
                guiltyPleasure: user.guiltyPleasure || '',
                idealWeekend: user.idealWeekend || '',
                hobbies: user.hobbies || '',
                favoriteBooks: user.favoriteBooks || '',
                travelDreams: user.travelDreams || '',
                lifeGoals: user.lifeGoals || '',
                idealDate: user.idealDate || '',
                dealBreakers: user.dealBreakers || '',
                personalValues: user.personalValues || ''
            };
            if (userData.personalValues) {
                editedValues = userData.personalValues.split(', ');
            }
            if (userData.hobbies) {
                editedHobbies = userData.hobbies.split(', ');
            }
            if (userData.lifeGoals) {
                editedLifeGoals = userData.lifeGoals.split(', ');
            }
            if (userData.idealDate) {
                editedFirstDates = userData.idealDate.split(', ');
            }
            if (userData.dealBreakers) {
                editedDealBreakers = userData.dealBreakers.split(', ');
            }
            if (userData.idealWeekend) {
                editedWeekendActivities = userData.idealWeekend.split(', ');
            }
        } catch (err) {
            error = 'Failed to load profile data';
            console.error(err);
        }
    });

    async function saveChanges() {
        if (!pb.authStore.model?.id) {
            error = 'You must be logged in to save changes';
            return;
        }

        try {
            loading = true;
            await pb.collection('users').update(pb.authStore.model.id, userData);
            success = 'Profile updated successfully!';
            isEditing = false;
            setTimeout(() => success = '', 3000);
        } catch (err) {
            error = 'Failed to update profile';
            console.error(err);
        } finally {
            loading = false;
        }
    }

    function toggleEdit() {
        isEditing = !isEditing;
        error = '';
        success = '';
    }

    function toggleValue(value) {
        if (editedValues.includes(value)) {
            editedValues = editedValues.filter(v => v !== value);
        } else {
            editedValues = [...editedValues, value];
        }
        userData.personalValues = editedValues.join(', ');
    }

    function addCustomValue() {
        if (customValue.trim() && !editedValues.includes(customValue.trim())) {
            editedValues = [...editedValues, customValue.trim()];
            userData.personalValues = editedValues.join(', ');
            customValue = '';
        }
    }

    function removeValue(value) {
        editedValues = editedValues.filter(v => v !== value);
        userData.personalValues = editedValues.join(', ');
    }

    function toggleHobby(hobby) {
        if (editedHobbies.includes(hobby)) {
            editedHobbies = editedHobbies.filter(h => h !== hobby);
        } else {
            editedHobbies = [...editedHobbies, hobby];
        }
        userData.hobbies = editedHobbies.join(', ');
    }

    function addCustomHobby() {
        if (customHobby.trim() && !editedHobbies.includes(customHobby.trim())) {
            editedHobbies = [...editedHobbies, customHobby.trim()];
            userData.hobbies = editedHobbies.join(', ');
            customHobby = '';
        }
    }

    function removeHobby(hobby) {
        editedHobbies = editedHobbies.filter(h => h !== hobby);
        userData.hobbies = editedHobbies.join(', ');
    }

    function toggleLifeGoal(goal) {
        if (editedLifeGoals.includes(goal)) {
            editedLifeGoals = editedLifeGoals.filter(g => g !== goal);
        } else {
            editedLifeGoals = [...editedLifeGoals, goal];
        }
        userData.lifeGoals = editedLifeGoals.join(', ');
    }

    function addCustomLifeGoal() {
        if (customLifeGoal.trim() && !editedLifeGoals.includes(customLifeGoal.trim())) {
            editedLifeGoals = [...editedLifeGoals, customLifeGoal.trim()];
            userData.lifeGoals = editedLifeGoals.join(', ');
            customLifeGoal = '';
        }
    }

    function removeLifeGoal(goal) {
        editedLifeGoals = editedLifeGoals.filter(g => g !== goal);
        userData.lifeGoals = editedLifeGoals.join(', ');
    }

    function toggleFirstDate(date) {
        if (editedFirstDates.includes(date)) {
            editedFirstDates = editedFirstDates.filter(d => d !== date);
        } else {
            editedFirstDates = [...editedFirstDates, date];
        }
        userData.idealDate = editedFirstDates.join(', ');
    }

    function addCustomFirstDate() {
        if (customFirstDate.trim() && !editedFirstDates.includes(customFirstDate.trim())) {
            editedFirstDates = [...editedFirstDates, customFirstDate.trim()];
            userData.idealDate = editedFirstDates.join(', ');
            customFirstDate = '';
        }
    }

    function removeFirstDate(date) {
        editedFirstDates = editedFirstDates.filter(d => d !== date);
        userData.idealDate = editedFirstDates.join(', ');
    }

    function toggleDealBreaker(dealBreaker) {
        if (editedDealBreakers.includes(dealBreaker)) {
            editedDealBreakers = editedDealBreakers.filter(d => d !== dealBreaker);
        } else {
            editedDealBreakers = [...editedDealBreakers, dealBreaker];
        }
        userData.dealBreakers = editedDealBreakers.join(', ');
    }

    function addCustomDealBreaker() {
        if (customDealBreaker.trim() && !editedDealBreakers.includes(customDealBreaker.trim())) {
            editedDealBreakers = [...editedDealBreakers, customDealBreaker.trim()];
            userData.dealBreakers = editedDealBreakers.join(', ');
            customDealBreaker = '';
        }
    }

    function removeDealBreaker(dealBreaker) {
        editedDealBreakers = editedDealBreakers.filter(d => d !== dealBreaker);
        userData.dealBreakers = editedDealBreakers.join(', ');
    }

    function toggleWeekendActivity(activity) {
        if (editedWeekendActivities.includes(activity)) {
            editedWeekendActivities = editedWeekendActivities.filter(a => a !== activity);
        } else {
            editedWeekendActivities = [...editedWeekendActivities, activity];
        }
        userData.idealWeekend = editedWeekendActivities.join(', ');
    }

    function addCustomWeekendActivity() {
        if (customWeekendActivity.trim() && !editedWeekendActivities.includes(customWeekendActivity.trim())) {
            editedWeekendActivities = [...editedWeekendActivities, customWeekendActivity.trim()];
            userData.idealWeekend = editedWeekendActivities.join(', ');
            customWeekendActivity = '';
        }
    }

    function removeWeekendActivity(activity) {
        editedWeekendActivities = editedWeekendActivities.filter(a => a !== activity);
        userData.idealWeekend = editedWeekendActivities.join(', ');
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="page-wrapper">
    <div class="profile-container">
        <div class="profile-header">
            {#if isEditing}
                <div class="edit-fields">
                    <div class="field">
                        <label for="nickname">Nickname</label>
                        <input type="text" id="nickname" bind:value={userData.nickname} />
                    </div>
                    <div class="field">
                        <label for="country">Country</label>
                        <select id="country" bind:value={userData.country}>
                            <option value="">Select Country</option>
                            {#each countries as country}
                                <option value={country}>{country}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="field">
                        <label for="city">City</label>
                        <select id="city" bind:value={userData.city}>
                            <option value="">Select City</option>
                            {#each cities as city}
                                <option value={city}>{city}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="field">
                        <label for="designation">Designation</label>
                        <select id="designation" bind:value={userData.designation}>
                            <option value="">Select Designation</option>
                            {#each designations as designation}
                                <option value={designation}>{designation}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            {:else}
                <h1>{userData.nickname || 'Profile'}</h1>
                <p class="location">{userData.city}, {userData.country}</p>
                <p class="designation">{userData.designation}</p>
            {/if}
        </div>

        <div class="profile-section">
            <h2>About Me</h2>
            {#if isEditing}
                <textarea 
                    bind:value={userData.description} 
                    placeholder="Tell us about yourself..."
                    maxlength="500"
                ></textarea>
            {:else}
                <p>{userData.description || 'No description provided'}</p>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Hobbies</h2>
            {#if isEditing}
                <div class="hobby-selector">
                    <div class="selected-hobbies">
                        {#each editedHobbies as hobby}
                            <span class="tag">
                                {hobby}
                                <button class="remove-tag" on:click={() => removeHobby(hobby)}>×</button>
                            </span>
                        {/each}
                    </div>
                    <div class="hobby-options">
                        {#each hobbyOptions as hobby}
                            <button
                                class="hobby-option"
                                class:selected={editedHobbies.includes(hobby)}
                                on:click={() => toggleHobby(hobby)}
                            >
                                {hobby}
                            </button>
                        {/each}
                    </div>
                    <div class="custom-hobby">
                        <input
                            type="text"
                            bind:value={customHobby}
                            placeholder="Add a custom hobby..."
                            on:keydown={(e) => e.key === 'Enter' && addCustomHobby()}
                        />
                        <button class="add-hobby" on:click={addCustomHobby}>Add</button>
                    </div>
                </div>
            {:else if userData.hobbies}
                <div class="tags">
                    {#each userData.hobbies.split(', ') as hobby}
                        <span class="tag">{hobby}</span>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Favorite Books</h2>
            {#if isEditing}
                <textarea 
                    bind:value={userData.favoriteBooks} 
                    placeholder="Share your favorite books..."
                    maxlength="200"
                ></textarea>
            {:else}
                <p>{userData.favoriteBooks || 'Not specified'}</p>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Travel Dreams</h2>
            {#if isEditing}
                <textarea 
                    bind:value={userData.travelDreams} 
                    placeholder="Share your travel dreams..."
                    maxlength="200"
                ></textarea>
            {:else}
                <p>{userData.travelDreams || 'Not specified'}</p>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Life Goals</h2>
            {#if isEditing}
                <div class="life-goal-selector">
                    <div class="selected-life-goals">
                        {#each editedLifeGoals as goal}
                            <span class="tag">
                                {goal}
                                <button class="remove-tag" on:click={() => removeLifeGoal(goal)}>×</button>
                            </span>
                        {/each}
                    </div>
                    <div class="life-goal-options">
                        {#each lifeGoalOptions as goal}
                            <button
                                class="life-goal-option"
                                class:selected={editedLifeGoals.includes(goal)}
                                on:click={() => toggleLifeGoal(goal)}
                            >
                                {goal}
                            </button>
                        {/each}
                    </div>
                    <div class="custom-life-goal">
                        <input
                            type="text"
                            bind:value={customLifeGoal}
                            placeholder="Add a custom life goal..."
                            on:keydown={(e) => e.key === 'Enter' && addCustomLifeGoal()}
                        />
                        <button class="add-life-goal" on:click={addCustomLifeGoal}>Add</button>
                    </div>
                </div>
            {:else if userData.lifeGoals}
                <div class="tags">
                    {#each userData.lifeGoals.split(', ') as goal}
                        <span class="tag">{goal}</span>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Ideal  Date</h2>
            {#if isEditing}
                <div class="first-date-selector">
                    <div class="selected-first-dates">
                        {#each editedFirstDates as date}
                            <span class="tag">
                                {date}
                                <button class="remove-tag" on:click={() => removeFirstDate(date)}>×</button>
                            </span>
                        {/each}
                    </div>
                    <div class="first-date-options">
                        {#each firstDateOptions as date}
                            <button
                                class="first-date-option"
                                class:selected={editedFirstDates.includes(date)}
                                on:click={() => toggleFirstDate(date)}
                            >
                                {date}
                            </button>
                        {/each}
                    </div>
                    <div class="custom-first-date">
                        <input
                            type="text"
                            bind:value={customFirstDate}
                            placeholder="Add a custom first date idea..."
                            on:keydown={(e) => e.key === 'Enter' && addCustomFirstDate()}
                        />
                        <button class="add-first-date" on:click={addCustomFirstDate}>Add</button>
                    </div>
                </div>
            {:else if userData.idealDate}
                <div class="tags">
                    {#each userData.idealDate.split(', ') as date}
                        <span class="tag">{date}</span>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Deal Breakers</h2>
            {#if isEditing}
                <div class="deal-breaker-selector">
                    <div class="selected-deal-breakers">
                        {#each editedDealBreakers as dealBreaker}
                            <span class="tag">
                                {dealBreaker}
                                <button class="remove-tag" on:click={() => removeDealBreaker(dealBreaker)}>×</button>
                            </span>
                        {/each}
                    </div>
                    <div class="deal-breaker-options">
                        {#each dealBreakerOptions as dealBreaker}
                            <button
                                class="deal-breaker-option"
                                class:selected={editedDealBreakers.includes(dealBreaker)}
                                on:click={() => toggleDealBreaker(dealBreaker)}
                            >
                                {dealBreaker}
                            </button>
                        {/each}
                    </div>
                    <div class="custom-deal-breaker">
                        <input
                            type="text"
                            bind:value={customDealBreaker}
                            placeholder="Add a custom deal breaker..."
                            on:keydown={(e) => e.key === 'Enter' && addCustomDealBreaker()}
                        />
                        <button class="add-deal-breaker" on:click={addCustomDealBreaker}>Add</button>
                    </div>
                </div>
            {:else if userData.dealBreakers}
                <div class="tags">
                    {#each userData.dealBreakers.split(', ') as dealBreaker}
                        <span class="tag">{dealBreaker}</span>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Personal Values</h2>
            {#if isEditing}
                <div class="value-selector">
                    <div class="selected-values">
                        {#each editedValues as value}
                            <span class="tag">
                                {value}
                                <button class="remove-tag" on:click={() => removeValue(value)}>×</button>
                            </span>
                        {/each}
                    </div>
                    <div class="value-options">
                        {#each personalValueOptions as value}
                            <button
                                class="value-option"
                                class:selected={editedValues.includes(value)}
                                on:click={() => toggleValue(value)}
                            >
                                {value}
                            </button>
                        {/each}
                    </div>
                    <div class="custom-value">
                        <input
                            type="text"
                            bind:value={customValue}
                            placeholder="Add a custom value..."
                            on:keydown={(e) => e.key === 'Enter' && addCustomValue()}
                        />
                        <button class="add-value" on:click={addCustomValue}>Add</button>
                    </div>
                </div>
            {:else if userData.personalValues}
                <div class="tags">
                    {#each userData.personalValues.split(', ') as value}
                        <span class="tag">{value}</span>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="profile-section">
            <h2>Ideal Weekend</h2>
            {#if isEditing}
                <div class="weekend-activity-selector">
                    <div class="selected-weekend-activities">
                        {#each editedWeekendActivities as activity}
                            <span class="tag">
                                {activity}
                                <button class="remove-tag" on:click={() => removeWeekendActivity(activity)}>×</button>
                            </span>
                        {/each}
                    </div>
                    <div class="weekend-activity-options">
                        {#each weekendActivityOptions as activity}
                            <button
                                class="weekend-activity-option"
                                class:selected={editedWeekendActivities.includes(activity)}
                                on:click={() => toggleWeekendActivity(activity)}
                            >
                                {activity}
                            </button>
                        {/each}
                    </div>
                    <div class="custom-weekend-activity">
                        <input
                            type="text"
                            bind:value={customWeekendActivity}
                            placeholder="Add a custom weekend activity..."
                            on:keydown={(e) => e.key === 'Enter' && addCustomWeekendActivity()}
                        />
                        <button class="add-weekend-activity" on:click={addCustomWeekendActivity}>Add</button>
                    </div>
                </div>
            {:else if userData.idealWeekend}
                <div class="tags">
                    {#each userData.idealWeekend.split(', ') as activity}
                        <span class="tag">{activity}</span>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="button-container">
            <button class="edit-button" on:click={toggleEdit}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            {#if isEditing}
                <button class="save-button" on:click={saveChanges} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            {/if}
        </div>

        {#if error}
            <div class="error-message">{error}</div>
        {/if}

        {#if success}
            <div class="success-message">{success}</div>
        {/if}
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
        background: #f8f7ff;
    }

    .page-wrapper {
        min-height: 100vh;
        background: linear-gradient(185deg, #F8F7FF 0%, #725EA0 100%);
        padding: 32px 16px;
    }

    .profile-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 24px;
        /* background: white; */
        border-radius: 16px;
        /* box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); */
        font-family: 'Inter', sans-serif;
    }

    .profile-header {
        margin-bottom: 30px;
    }

    .edit-fields {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 30px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .field label {
        font-size: 14px;
        font-weight: 500;
        color: #4a5568;
    }

    .field input,
    .field select {
        padding: 10px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        background-color: white;
        transition: all 0.2s ease;
    }

    .field input:focus,
    .field select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .field input:hover,
    .field select:hover {
        border-color: #cbd5e0;
    }

    .field select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5568'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
        padding-right: 40px;
    }

    @media (max-width: 640px) {
        .edit-fields {
            grid-template-columns: 1fr;
        }
    }

    .profile-section {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .profile-section h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #333;
    }

    .profile-section p {
        color: #555;
        line-height: 1.6;
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .tag {
        background: #f0f0f0;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        color: #555;
    }

    input, select, textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }

    textarea {
        min-height: 100px;
        resize: vertical;
    }

    .button-container {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }

    .edit-button, .save-button {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .edit-button {
        background: #64267C;
        color: white;
    }

    .save-button {
        background: #64267C;
        color: white;
    }

    .edit-button:hover {
        background: #e0e0e0;
    }

    .save-button:hover {
        background: #64267C;
    }

    .error-message {
        background: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
    }

    .success-message {
        background: #e8f5e9;
        color: #2e7d32;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
    }

    .value-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-values {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .value-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .value-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .value-option:hover {
        background: #f0f0f0;
    }

    .value-option.selected {
        background: #64267C;
        color: white;
        border-color: #64267C;
    }

    .custom-value {
        display: flex;
        gap: 0.5rem;
    }

    .custom-value input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        margin: 0;
    }

    .add-value {
        padding: 0.5rem 1rem;
        background: #64267C;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-value:hover {
        background: #0056b3;
    }

    .remove-tag {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 0 0.2rem;
        margin-left: 0.3rem;
        font-size: 1.2rem;
        line-height: 1;
    }

    .remove-tag:hover {
        color: #ff4444;
    }

    .hobby-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-hobbies {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .hobby-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .hobby-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .hobby-option:hover {
        background: #f0f0f0;
    }

    .hobby-option.selected {
        background: #64267C;
        color: white;
        border-color: #64267C;
    }

    .custom-hobby {
        display: flex;
        gap: 0.5rem;
    }

    .custom-hobby input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        margin: 0;
    }

    .add-hobby {
        padding: 0.5rem 1rem;
        background: #64267C;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-hobby:hover {
        background: #0056b3;
    }

    .life-goal-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-life-goals {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .life-goal-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .life-goal-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .life-goal-option:hover {
        background: #f0f0f0;
    }

    .life-goal-option.selected {
        background: #64267C;
        color: white;
        border-color: #64267C;
    }

    .custom-life-goal {
        display: flex;
        gap: 0.5rem;
    }

    .custom-life-goal input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        margin: 0;
    }

    .add-life-goal {
        padding: 0.5rem 1rem;
        background: #64267C;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-life-goal:hover {
        background: #0056b3;
    }

    .first-date-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-first-dates {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .first-date-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .first-date-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .first-date-option:hover {
        background: #f0f0f0;
    }

    .first-date-option.selected {
        background: #64267C;
        color: white;
        border-color: #64267C;
    }

    .custom-first-date {
        display: flex;
        gap: 0.5rem;
    }

    .custom-first-date input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        margin: 0;
    }

    .add-first-date {
        padding: 0.5rem 1rem;
        background: #64267C;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-first-date:hover {
        background: #64267C;
    }

    .deal-breaker-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-deal-breakers {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .deal-breaker-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .deal-breaker-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .deal-breaker-option:hover {
        background: #f0f0f0;
    }

    .deal-breaker-option.selected {
        background: #64267C;
        color: white;
        border-color: #64267C;
    }

    .custom-deal-breaker {
        display: flex;
        gap: 0.5rem;
    }

    .custom-deal-breaker input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        margin: 0;
    }

    .add-deal-breaker {
        padding: 0.5rem 1rem;
        background: #64267C;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-deal-breaker:hover {
        background: #0056b3;
    }

    .weekend-activity-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-weekend-activities {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .weekend-activity-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .weekend-activity-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .weekend-activity-option:hover {
        background: #f0f0f0;
    }

    .weekend-activity-option.selected {
        background: #64267C;
        color: white;
        border-color: #64267C;
    }

    .custom-weekend-activity {
        display: flex;
        gap: 0.5rem;
    }

    .custom-weekend-activity input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        margin: 0;
    }

    .add-weekend-activity {
        padding: 0.5rem 1rem;
        background: #64267C;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-weekend-activity:hover {
        background: #0056b3;
    }

    @media (max-width: 640px) {
        .profile-container {
            padding: 1rem;
        }

        .profile-section {
            padding: 1rem;
        }

        .location-edit {
            flex-direction: column;
        }

        .button-container {
            flex-direction: column;
        }

        .edit-button, .save-button {
            width: 100%;
        }
    }
</style>
