<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { currentUser } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    
    let colleaguesSay = '';
    let workLifeBalance = '';
    let guiltyPleasure = '';
    let idealWeekend = '';
    let perfectDate = '';
    let error = '';
    let description = '';
    let loading = false;

    async function handleSubmit() {
        try {
            loading = true;
            error = '';

            if (!$currentUser?.id) {
                error = 'Please login first';
                return;
            }

            // Get the user_details record first

            const data = {
                colleaguesSay,
                workLifeBalance,
                guiltyPleasure,
                idealWeekend,
                perfectDate,
                description
            };

            await pb.collection('users').update($currentUser.id, data);
            goto('/find');
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="about-container">
    <h1>About You</h1>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
            <label for="description">Describe yourself</label>
            <textarea
                id="description"
                bind:value={description}
                required
                placeholder="Share about you..."
                maxlength="200"
            ></textarea>
            <small class="char-count">{description.length}/200</small>
        </div>
        <div class="form-group">
            <label for="colleaguesSay">What my colleagues say about me</label>
            <textarea
                id="colleaguesSay"
                bind:value={colleaguesSay}
                required
                placeholder="Share what your colleagues think about you..."
                maxlength="200"
            ></textarea>
            <small class="char-count">{colleaguesSay.length}/200</small>
        </div>

        <div class="form-group">
            <label for="workLifeBalance">Work life balance to be is</label>
            <textarea
                id="workLifeBalance"
                bind:value={workLifeBalance}
                required
                placeholder="Describe your ideal work-life balance..."
                maxlength="200"
            ></textarea>
            <small class="char-count">{workLifeBalance.length}/200</small>
        </div>

        <div class="form-group">
            <label for="guiltyPleasure">My guilty pleasure is</label>
            <textarea
                id="guiltyPleasure"
                bind:value={guiltyPleasure}
                required
                placeholder="Share your guilty pleasures..."
                maxlength="200"
            ></textarea>
            <small class="char-count">{guiltyPleasure.length}/200</small>
        </div>

        <div class="form-group">
            <label for="idealWeekend">My ideal weekend is</label>
            <textarea
                id="idealWeekend"
                bind:value={idealWeekend}
                required
                placeholder="Describe your perfect weekend..."
                maxlength="200"
            ></textarea>
            <small class="char-count">{idealWeekend.length}/200</small>
        </div>

        <div class="form-group">
            <label for="perfectDate">My perfect date is</label>
            <textarea
                id="perfectDate"
                bind:value={perfectDate}
                required
                placeholder="Describe your idea of a perfect date..."
                maxlength="200"
            ></textarea>
            <small class="char-count">{perfectDate.length}/200</small>
        </div>

        <div class="button-group">
            <button type="button" class="back-button" on:click={() => goto('/basic-details')}>
                Back
            </button>
            <button type="submit" class="finish-button" disabled={loading}>
                {loading ? 'Saving...' : 'Finish'}
            </button>
        </div>
    </form>
</div>

<style>
    .about-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 2rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
        position: relative;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
        font-weight: 500;
    }

    textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        min-height: 100px;
        resize: vertical;
        transition: border-color 0.2s;
    }

    textarea:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }

    .char-count {
        position: absolute;
        right: 0;
        bottom: -20px;
        font-size: 0.8rem;
        color: #666;
    }

    .error {
        color: #dc3545;
        background-color: #f8d7da;
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .back-button, .finish-button {
        flex: 1;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .back-button {
        background: #f8f9fa;
        color: #333;
        border: 1px solid #ddd;
    }

    .back-button:hover {
        background: #e9ecef;
    }

    .finish-button {
        background: #4CAF50;
        color: white;
    }

    .finish-button:hover:not(:disabled) {
        background: #45a049;
    }

    .finish-button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
</style>