<script lang="ts">
    import { goto } from '$app/navigation';
    import { pb } from '$lib/pocketbase';
    import details from '$lib/assets/details.png';
    import {
        countries,
        cities,
        designations,
        hobbyOptions,
        lifeGoalOptions,
        firstDateOptions,
        dealBreakerOptions,
        personalValueOptions,
        weekendActivityOptions
    } from '$lib/constants';

    let currentStep = 0;
    const totalSteps = 16;

    let gender = '';
    let phoneNumber = '';
    let dob = '';
    let country = '';
    let city = '';
    let designation = '';
    let description = '';
    let selectedHobbies = [];
    let customHobby = '';
    let favoriteBooks = '';
    let travelDreams = '';
    let selectedLifeGoals = [];
    let selectedIdealDates = [];
    let selectedDealBreakers = [];
    let selectedPersonalValues = [];
    let selectedWeekendActivities = [];
    let customWeekendActivity = '';
    let loading = false;
    let error = '';
    let canProceed = false;
    let showSuccessMessage = false;
    let customIdealDate = [];
    let customDealBreaker = [];
    let customPersonalValue = [];
    

    const questions = [
        {
            id: 'gender',
            title: 'What is your gender?',
            subtitle: 'Help others understand how to refer to you',
            component: 'select',
            options: ['Male', 'Female']
        },
        {
            id: 'phoneNumber',
            title: 'What is your phone number?',
            subtitle: 'We\'ll use this to verify your account',
            component: 'phone'
        },
        {
            id: 'dob',
            title: 'When were you born?',
            subtitle: 'Must be at least 18 years old',
            component: 'date'
        },
        {
            id: 'country',
            title: 'Which country are you from?',
            subtitle: 'Help others understand your cultural background',
            component: 'country'
        },
        {
            id: 'city',
            title: 'Which city do you live in?',
            subtitle: 'Help others find you more easily',
            component: 'city'
        },
        {
            id: 'designation',
            title: 'What do you do?',
            subtitle: 'Share your professional role',
            component: 'designation'
        },
        {
            id: 'description',
            title: 'Tell us about yourself',
            subtitle: 'Help others get to know you better',
            component: 'textarea',
            maxLength: 500,
            placeholder: 'Share something interesting about yourself...'
        },
        {
            id: 'hobbies',
            title: 'What are your hobbies?',
            subtitle: 'Share what you love to do',
            component: 'hobbies'
        },
        {
            id: 'favoriteBooks',
            title: 'What are your favorite books?',
            subtitle: 'Share your literary interests',
            component: 'textarea',
            maxLength: 200,
            placeholder: 'List some books you love...'
        },
        {
            id: 'travelDreams',
            title: 'What are your travel dreams?',
            subtitle: 'Share where you\'d love to go',
            component: 'textarea',
            maxLength: 200,
            placeholder: 'Share your dream destinations...'
        },
        {
            id: 'lifeGoals',
            title: 'What are your life goals?',
            subtitle: 'Share your aspirations and dreams',
            component: 'lifeGoals'
        },
        {
            id: 'idealDate',
            title: 'Describe your ideal first date',
            subtitle: 'Help others understand your romantic side',
            component: 'idealDate'
        },
        {
            id: 'dealBreakers',
            title: 'What are your relationship deal-breakers?',
            subtitle: 'Be honest about what matters to you',
            component: 'dealBreakers'
        },
        {
            id: 'personalValues',
            title: 'What are your core personal values?',
            subtitle: 'Share what matters most to you',
            component: 'personalValues'
        },
        {
            id: 'idealWeekend',
            title: 'What\'s your ideal weekend like?',
            subtitle: 'Choose activities you enjoy during your free time',
            component: 'idealWeekend'
        },
    ];

    let customLifeGoal = '';

    function addCustomLifeGoal() {
        if (customLifeGoal.trim() && !selectedLifeGoals.includes(customLifeGoal.trim())) {
            selectedLifeGoals = [...selectedLifeGoals, customLifeGoal.trim()];
            customLifeGoal = '';
        }
    }

    function toggleLifeGoal(goal) {
        if (selectedLifeGoals.includes(goal)) {
            selectedLifeGoals = selectedLifeGoals.filter(g => g !== goal);
        } else {
            selectedLifeGoals = [...selectedLifeGoals, goal];
        }
    }

    function removeLifeGoal(goal) {
        selectedLifeGoals = selectedLifeGoals.filter(g => g !== goal);
    }

    function addCustomHobby() {
        if (customHobby.trim() && !selectedHobbies.includes(customHobby.trim())) {
            selectedHobbies = [...selectedHobbies, customHobby.trim()];
            customHobby = '';
        }
    }

    function toggleHobby(hobby) {
        if (selectedHobbies.includes(hobby)) {
            selectedHobbies = selectedHobbies.filter(h => h !== hobby);
        } else {
            selectedHobbies = [...selectedHobbies, hobby];
        }
    }

    function removeHobby(hobby) {
        selectedHobbies = selectedHobbies.filter(h => h !== hobby);
    }

    function addCustomIdealDate() {
        if (customIdealDate.trim() && !selectedIdealDates.includes(customIdealDate.trim())) {
            selectedIdealDates = [...selectedIdealDates, customIdealDate.trim()];
            customIdealDate = '';
        }
    }

    function toggleIdealDate(date) {
        if (selectedIdealDates.includes(date)) {
            selectedIdealDates = selectedIdealDates.filter(d => d !== date);
        } else {
            selectedIdealDates = [...selectedIdealDates, date];
        }
    }

    function removeIdealDate(date) {
        selectedIdealDates = selectedIdealDates.filter(d => d !== date);
    }

    function addCustomDealBreaker() {
        if (customDealBreaker.trim() && !selectedDealBreakers.includes(customDealBreaker.trim())) {
            selectedDealBreakers = [...selectedDealBreakers, customDealBreaker.trim()];
            customDealBreaker = '';
        }
    }

    function toggleDealBreaker(dealBreaker) {
        if (selectedDealBreakers.includes(dealBreaker)) {
            selectedDealBreakers = selectedDealBreakers.filter(d => d !== dealBreaker);
        } else {
            selectedDealBreakers = [...selectedDealBreakers, dealBreaker];
        }
    }

    function removeDealBreaker(dealBreaker) {
        selectedDealBreakers = selectedDealBreakers.filter(d => d !== dealBreaker);
    }

    function addCustomPersonalValue() {
        if (customPersonalValue.trim() && !selectedPersonalValues.includes(customPersonalValue.trim())) {
            selectedPersonalValues = [...selectedPersonalValues, customPersonalValue.trim()];
            customPersonalValue = '';
        }
    }

    function togglePersonalValue(value) {
        if (selectedPersonalValues.includes(value)) {
            selectedPersonalValues = selectedPersonalValues.filter(v => v !== value);
        } else {
            selectedPersonalValues = [...selectedPersonalValues, value];
        }
    }

    function removePersonalValue(value) {
        selectedPersonalValues = selectedPersonalValues.filter(v => v !== value);
    }

    function addCustomWeekendActivity() {
        if (customWeekendActivity.trim() && !selectedWeekendActivities.includes(customWeekendActivity.trim())) {
            selectedWeekendActivities = [...selectedWeekendActivities, customWeekendActivity.trim()];
            customWeekendActivity = '';
        }
    }

    function toggleWeekendActivity(activity) {
        if (selectedWeekendActivities.includes(activity)) {
            selectedWeekendActivities = selectedWeekendActivities.filter(a => a !== activity);
        } else {
            selectedWeekendActivities = [...selectedWeekendActivities, activity];
        }
    }

    function removeWeekendActivity(activity) {
        selectedWeekendActivities = selectedWeekendActivities.filter(a => a !== activity);
    }

    $: currentQuestion = questions[currentStep];
    $: progress = ((currentStep + 1) / totalSteps) * 100;
    $: if( gender || phoneNumber || dob || country || city || designation || description || selectedHobbies.length || favoriteBooks || travelDreams || selectedLifeGoals.length || selectedIdealDates.length || selectedDealBreakers.length || selectedPersonalValues.length || selectedWeekendActivities.length) {
        
        canProceed = validateCurrentStep();
        
    }

    function validateCurrentStep() {
        if (!currentQuestion) return false;
        console.log('phoneNumhgbhn', phoneNumber);
        
       

        switch (currentQuestion.id) {
            case 'phoneNumber':
                console.log('phoneNumber.length', typeof (phoneNumber));
                return phoneNumber.toString().length >= 10;
            case 'gender':
                return gender !== '';
            case 'dob':
                return dob !== '';
            case 'country':
                return country !== '';
            case 'city':
                return city !== '';
            case 'designation':
                return designation !== '';
            case 'description':
                return description.length > 0;
            case 'hobbies':
                return selectedHobbies.length > 0;
            case 'favoriteBooks':
                return favoriteBooks.length > 0;
            case 'travelDreams':
                return travelDreams.length > 0;
            case 'lifeGoals':
                return selectedLifeGoals.length > 0;
            case 'idealDate':
                return selectedIdealDates.length > 0;
            case 'dealBreakers':
                return selectedDealBreakers.length > 0;
            case 'personalValues':
                return selectedPersonalValues.length > 0;
            case 'idealWeekend':
                return selectedWeekendActivities.length > 0;
            default:
                return false;
        }
    }

    function nextStep() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps - 1) {
                currentStep++;
            } else {
                handleSubmit();
            }
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
        }
    }

    async function handleSubmit() {
        try {
            loading = true;
            const data = {
                gender,
                phoneNumber,
                dob,
                country,
                city,
                designation,
                description,
                hobbies: selectedHobbies.join(', '),
                favoriteBooks,
                travelDreams,
                lifeGoals: selectedLifeGoals.join(', '),
                idealDate: selectedIdealDates.join(', '),
                dealBreakers: selectedDealBreakers.join(', '),
                personalValues: selectedPersonalValues.join(', '),
                idealWeekend: selectedWeekendActivities.join(', '),
            };

            await pb.collection('users').update(pb.authStore.model?.id, data);
            goto('/find');
        } catch (err) {
            console.error('Error updating user details:', err);
            error = 'Failed to update details. Please try again.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="container">
    <div class="form-container">
        <div class="progress-bar">
            <div class="progress" style="width: {progress}%"></div>
            <div class="steps">
                {#each questions as _, i}
                    <div class="step-indicator {i <= currentStep ? 'active' : ''}" />
                {/each}
            </div>
        </div>

        <div class="question-container">
            <h1>{currentQuestion.title}</h1>
            <p class="subtitle">{currentQuestion.subtitle}</p>

            {#if error}
                <div class="error">{error}</div>
            {/if}

            <div class="question-content">
            </div>
                {#if currentQuestion.component === 'select'}
                    <div class="form-group">
                        <select bind:value={gender} required>
                            <option value="">Select gender</option>
                            {#each currentQuestion.options as option}
                                <option value={option.toLowerCase()}>{option}</option>
                            {/each}
                        </select>
                    </div>
                {:else if currentQuestion.component === 'phone'}
                    <div class="form-group">
                        <div class="phone-input">
                            <span class="country-code">+91</span>
                            <input
                                type="tel"
                                bind:value={phoneNumber}
                                placeholder="Enter your phone number"
                                pattern="[0-9]{10}"
                                maxlength="10"
                                required
                            />
                        </div>
                    </div>
                {:else if currentQuestion.component === 'date'}
                    <div class="form-group">
                        <input
                            type="date"
                            bind:value={dob}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                {:else if currentQuestion.component === 'country'}
                    <div class="form-group">
                        <select bind:value={country} required>
                            <option value="">Select country</option>
                            {#each countries as countryOption}
                                <option value={countryOption}>{countryOption}</option>
                            {/each}
                        </select>
                    </div>
                {:else if currentQuestion.component === 'city'}
                    <div class="form-group">
                        <select bind:value={city} required>
                            <option value="">Select city</option>
                            {#each cities as cityOption}
                                <option value={cityOption}>{cityOption}</option>
                            {/each}
                        </select>
                    </div>
                {:else if currentQuestion.component === 'designation'}
                    <div class="form-group">
                        <select bind:value={designation} required>
                            <option value="">Select designation</option>
                            {#each designations as designationOption}
                                <option value={designationOption}>{designationOption}</option>
                            {/each}
                        </select>
                    </div>
                {:else if currentQuestion.component === 'textarea'}
                    <div class="form-group">
                        {#if currentQuestion.id === 'description'}
                            <textarea
                                bind:value={description}
                                placeholder={currentQuestion.placeholder}
                                maxlength={currentQuestion.maxLength}
                                required
                            ></textarea>
                            <small class="char-count">
                                {description.length}/{currentQuestion.maxLength}
                            </small>
                        {:else if currentQuestion.id === 'favoriteBooks'}
                            <textarea
                                bind:value={favoriteBooks}
                                placeholder={currentQuestion.placeholder}
                                maxlength={currentQuestion.maxLength}
                                required
                            ></textarea>
                            <small class="char-count">
                                {favoriteBooks.length}/{currentQuestion.maxLength}
                            </small>
                        {:else if currentQuestion.id === 'travelDreams'}
                            <textarea
                                bind:value={travelDreams}
                                placeholder={currentQuestion.placeholder}
                                maxlength={currentQuestion.maxLength}
                                required
                            ></textarea>
                            <small class="char-count">
                                {travelDreams.length}/{currentQuestion.maxLength}
                            </small>
                        {/if}
                    </div>
                {:else if currentQuestion.component === 'hobbies'}
                    <div class="hobby-selector">
                        <div class="selected-hobbies">
                            {#each selectedHobbies as hobby}
                                <span class="hobby-tag">
                                    {hobby}
                                    <button class="remove-hobby" on:click={() => removeHobby(hobby)}>×</button>
                                </span>
                            {/each}
                        </div>
                        <div class="hobby-options">
                            {#each hobbyOptions as hobby}
                                <button
                                    class="hobby-option"
                                    class:selected={selectedHobbies.includes(hobby)}
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
                {:else if currentQuestion.component === 'lifeGoals'}
                    <div class="goal-selector">
                        <div class="selected-goals">
                            {#each selectedLifeGoals as goal}
                                <span class="goal-tag">
                                    {goal}
                                    <button class="remove-goal" on:click={() => removeLifeGoal(goal)}>×</button>
                                </span>
                            {/each}
                        </div>
                        <div class="goal-options">
                            {#each lifeGoalOptions as goal}
                                <button
                                    class="goal-option"
                                    class:selected={selectedLifeGoals.includes(goal)}
                                    on:click={() => toggleLifeGoal(goal)}
                                >
                                    {goal}
                                </button>
                            {/each}
                        </div>
                        <div class="custom-goal">
                            <input
                                type="text"
                                bind:value={customLifeGoal}
                                placeholder="Add a custom life goal..."
                                on:keydown={(e) => e.key === 'Enter' && addCustomLifeGoal()}
                            />
                            <button class="add-goal" on:click={addCustomLifeGoal}>Add</button>
                        </div>
                    </div>
                {:else if currentQuestion.component === 'idealDate'}
                    <div class="date-selector">
                        <div class="selected-dates">
                            {#each selectedIdealDates as date}
                                <span class="date-tag">
                                    {date}
                                    <button class="remove-date" on:click={() => removeIdealDate(date)}>×</button>
                                </span>
                            {/each}
                        </div>
                        <div class="date-options">
                            {#each firstDateOptions as date}
                                <button
                                    class="date-option"
                                    class:selected={selectedIdealDates.includes(date)}
                                    on:click={() => toggleIdealDate(date)}
                                >
                                    {date}
                                </button>
                            {/each}
                        </div>
                        <div class="custom-date">
                            <input
                                type="text"
                                bind:value={customIdealDate}
                                placeholder="Add a custom date idea..."
                                on:keydown={(e) => e.key === 'Enter' && addCustomIdealDate()}
                            />
                            <button class="add-date" on:click={addCustomIdealDate}>Add</button>
                        </div>
                    </div>
                {:else if currentQuestion.component === 'dealBreakers'}
                    <div class="dealbreaker-selector">
                        <div class="selected-dealbreakers">
                            {#each selectedDealBreakers as dealBreaker}
                                <span class="dealbreaker-tag">
                                    {dealBreaker}
                                    <button class="remove-dealbreaker" on:click={() => removeDealBreaker(dealBreaker)}>×</button>
                                </span>
                            {/each}
                        </div>
                        <div class="dealbreaker-options">
                            {#each dealBreakerOptions as dealBreaker}
                                <button
                                    class="dealbreaker-option"
                                    class:selected={selectedDealBreakers.includes(dealBreaker)}
                                    on:click={() => toggleDealBreaker(dealBreaker)}
                                >
                                    {dealBreaker}
                                </button>
                            {/each}
                        </div>
                        <div class="custom-dealbreaker">
                            <input
                                type="text"
                                bind:value={customDealBreaker}
                                placeholder="Add a custom deal breaker..."
                                on:keydown={(e) => e.key === 'Enter' && addCustomDealBreaker()}
                            />
                            <button class="add-dealbreaker" on:click={addCustomDealBreaker}>Add</button>
                        </div>
                    </div>
                {:else if currentQuestion.component === 'personalValues'}
                    <div class="value-selector">
                        <div class="selected-values">
                            {#each selectedPersonalValues as value}
                                <span class="value-tag">
                                    {value}
                                    <button class="remove-value" on:click={() => removePersonalValue(value)}>×</button>
                                </span>
                            {/each}
                        </div>
                        <div class="value-options">
                            {#each personalValueOptions as value}
                                <button
                                    class="value-option"
                                    class:selected={selectedPersonalValues.includes(value)}
                                    on:click={() => togglePersonalValue(value)}
                                >
                                    {value}
                                </button>
                            {/each}
                        </div>
                        <div class="custom-value">
                            <input
                                type="text"
                                bind:value={customPersonalValue}
                                placeholder="Add a custom value..."
                                on:keydown={(e) => e.key === 'Enter' && addCustomPersonalValue()}
                            />
                            <button class="add-value" on:click={addCustomPersonalValue}>Add</button>
                        </div>
                    </div>
                {:else if currentQuestion.component === 'idealWeekend'}
                    <div class="weekend-selector">
                        <div class="selected-weekends">
                            {#each selectedWeekendActivities as activity}
                                <span class="weekend-tag">
                                    {activity}
                                    <button class="remove-weekend" on:click={() => removeWeekendActivity(activity)}>×</button>
                                </span>
                            {/each}
                        </div>
                        <div class="weekend-options">
                            {#each weekendActivityOptions as activity}
                                <button
                                    class="weekend-option"
                                    class:selected={selectedWeekendActivities.includes(activity)}
                                    on:click={() => toggleWeekendActivity(activity)}
                                >
                                    {activity}
                                </button>
                            {/each}
                        </div>
                        <div class="custom-weekend">
                            <input
                                type="text"
                                bind:value={customWeekendActivity}
                                placeholder="Add a custom weekend activity..."
                                on:keydown={(e) => e.key === 'Enter' && addCustomWeekendActivity()}
                            />
                            <button class="add-weekend" on:click={addCustomWeekendActivity}>Add</button>
                        </div>
                    </div>
                {/if}
            

            <div class="button-group">
                {#if currentStep > 0}
                    <button class="back-button" on:click={prevStep}>
                        Back
                    </button>
                {/if}
                <button 
                    class="next-button" 
                    on:click={nextStep}
                    disabled={!canProceed || loading}
                >
                    {currentStep === totalSteps - 1 ? (loading ? 'Saving...' : 'Finish') : 'Next'}
                </button>
            </div>
        </div>
        <img src={details} alt="Illustration" width="100%" height="auto" class="main-illustration"/>
    </div>
    
</div>

<style>
    :global(body) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(185deg, #F8F7FF 0%, #725EA0 100%);
        min-height: 100vh;
    }

    .container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .form-container {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-radius: 1.5rem;
        padding: 2.5rem;
        width: 100%;
        min-height: 80vh;
        max-width: 500px;
        box-shadow: 0 8px 24px rgba(100, 38, 124, 0.12);
        border: 2px solid rgba(114, 94, 160, 0.1);
    }

    .progress-bar {
        position: relative;
        height: 4px;
        background: rgba(114, 94, 160, 0.1);
        border-radius: 2px;
        margin-bottom: 2.5rem;
    }

    .progress {
        position: absolute;
        height: 100%;
        background: #64267C;
        border-radius: 2px;
        transition: width 0.3s ease;
    }

    .steps {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        transform: translateY(-50%);
    }

    .step-indicator {
        width: 8px;
        height: 8px;
        background: rgba(114, 94, 160, 0.2);
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .step-indicator.active {
        background: #64267C;
        transform: scale(1.5);
    }

    .question-container {
        text-align: center;
    }

    h1 {
        color: #64267C;
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 1.2;
    }

    .subtitle {
        color: #725EA0;
        font-size: 1.125rem;
        margin: 0.5rem 0 2rem;
        opacity: 0.8;
    }

    .question-content {
        margin: 2rem 0;
    }

    .form-group {
        margin-bottom: 1.5rem;
        position: relative;
    }

    input, select, textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid rgba(114, 94, 160, 0.2);
        border-radius: 0.75rem;
        font-family: inherit;
        font-size: 1rem;
        color: #333;
        background: white;
        transition: all 0.2s ease;
        resize: none;
        max-width: 300px;
    }

    textarea {
        min-height: 120px;
    }

    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #64267C;
        box-shadow: 0 0 0 4px rgba(100, 38, 124, 0.1);
    }

    input::placeholder, textarea::placeholder {
        color: #999;
    }

    .char-count {
        position: absolute;
        bottom: -1.25rem;
        right: 0;
        font-size: 0.75rem;
        color: #725EA0;
    }

    .phone-input {
        display: flex;
        gap: 0.5rem;
    }

    .country-code {
        padding: 0.75rem 1rem;
        background: rgba(114, 94, 160, 0.1);
        border-radius: 0.75rem;
        color: #64267C;
        font-weight: 500;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }

    .back-button, .next-button {
        padding: 0.875rem 2rem;
        border-radius: 0.75rem;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .back-button {
        background: rgba(114, 94, 160, 0.1);
        color: #64267C;
        border: none;
    }

    .back-button:hover {
        background: rgba(114, 94, 160, 0.15);
        transform: translateX(-2px);
    }

    .next-button {
        background: #64267C;
        color: white;
        border: none;
        border-radius: 0.75rem;
        min-width: 120px;
    }

    .next-button:hover:not(:disabled) {
        background: #7B3195;
        transform: translateX(2px);
        box-shadow: 0 4px 12px rgba(100, 38, 124, 0.2);
    }

    .next-button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    .error {
        color: #e74c3c;
        margin: 1rem 0;
        padding: 0.75rem;
        background: rgba(231, 76, 60, 0.1);
        border-radius: 0.75rem;
        font-size: 0.875rem;
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

    .hobby-tag {
        display: inline-flex;
        align-items: center;
        padding: 0.3rem 0.8rem;
        background-color: #f0f0f0;
        border-radius: 16px;
        font-size: 0.9rem;
        gap: 0.3rem;
    }

    .remove-hobby {
        border: none;
        background: none;
        color: #666;
        cursor: pointer;
        padding: 0 0.2rem;
        font-size: 1.2rem;
        line-height: 1;
    }

    .remove-hobby:hover {
        color: #ff4444;
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
        background: #007bff;
        color: white;
        border-color: #007bff;
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
    }

    .add-hobby {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-hobby:hover {
        background: #0056b3;
    }

    .goal-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-goals {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .goal-tag {
        display: inline-flex;
        align-items: center;
        padding: 0.3rem 0.8rem;
        background-color: #f0f0f0;
        border-radius: 16px;
        font-size: 0.9rem;
        gap: 0.3rem;
    }

    .remove-goal {
        border: none;
        background: none;
        color: #666;
        cursor: pointer;
        padding: 0 0.2rem;
        font-size: 1.2rem;
        line-height: 1;
    }

    .remove-goal:hover {
        color: #ff4444;
    }

    .goal-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .goal-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .goal-option:hover {
        background: #f0f0f0;
    }

    .goal-option.selected {
        background: #007bff;
        color: white;
        border-color: #007bff;
    }

    .custom-goal {
        display: flex;
        gap: 0.5rem;
    }

    .custom-goal input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .add-goal {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-goal:hover {
        background: #0056b3;
    }

    .date-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-dates {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .date-tag {
        display: inline-flex;
        align-items: center;
        padding: 0.3rem 0.8rem;
        background-color: #f0f0f0;
        border-radius: 16px;
        font-size: 0.9rem;
        gap: 0.3rem;
    }

    .remove-date {
        border: none;
        background: none;
        color: #666;
        cursor: pointer;
        padding: 0 0.2rem;
        font-size: 1.2rem;
        line-height: 1;
    }

    .remove-date:hover {
        color: #ff4444;
    }

    .date-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .date-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .date-option:hover {
        background: #f0f0f0;
    }

    .date-option.selected {
        background: #007bff;
        color: white;
        border-color: #007bff;
    }

    .custom-date {
        display: flex;
        gap: 0.5rem;
    }

    .custom-date input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .add-date {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-date:hover {
        background: #0056b3;
    }

    .dealbreaker-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-dealbreakers {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .dealbreaker-tag {
        display: inline-flex;
        align-items: center;
        padding: 0.3rem 0.8rem;
        background-color: #f0f0f0;
        border-radius: 16px;
        font-size: 0.9rem;
        gap: 0.3rem;
    }

    .remove-dealbreaker {
        border: none;
        background: none;
        color: #666;
        cursor: pointer;
        padding: 0 0.2rem;
        font-size: 1.2rem;
        line-height: 1;
    }

    .remove-dealbreaker:hover {
        color: #ff4444;
    }

    .dealbreaker-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .dealbreaker-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .dealbreaker-option:hover {
        background: #f0f0f0;
    }

    .dealbreaker-option.selected {
        background: #007bff;
        color: white;
        border-color: #007bff;
    }

    .custom-dealbreaker {
        display: flex;
        gap: 0.5rem;
    }

    .custom-dealbreaker input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .add-dealbreaker {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-dealbreaker:hover {
        background: #0056b3;
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

    .value-tag {
        display: inline-flex;
        align-items: center;
        padding: 0.3rem 0.8rem;
        background-color: #f0f0f0;
        border-radius: 16px;
        font-size: 0.9rem;
        gap: 0.3rem;
    }

    .remove-value {
        border: none;
        background: none;
        color: #666;
        cursor: pointer;
        padding: 0 0.2rem;
        font-size: 1.2rem;
        line-height: 1;
    }

    .remove-value:hover {
        color: #ff4444;
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
        background: #007bff;
        color: white;
        border-color: #007bff;
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
    }

    .add-value {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-value:hover {
        background: #0056b3;
    }

    .weekend-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .selected-weekends {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .weekend-tag {
        display: inline-flex;
        align-items: center;
        padding: 0.3rem 0.8rem;
        background-color: #f0f0f0;
        border-radius: 16px;
        font-size: 0.9rem;
        gap: 0.3rem;
    }

    .remove-weekend {
        border: none;
        background: none;
        color: #666;
        cursor: pointer;
        padding: 0 0.2rem;
        font-size: 1.2rem;
        line-height: 1;
    }

    .remove-weekend:hover {
        color: #ff4444;
    }

    .weekend-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .weekend-option {
        padding: 0.3rem 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .weekend-option:hover {
        background: #f0f0f0;
    }

    .weekend-option.selected {
        background: #007bff;
        color: white;
        border-color: #007bff;
    }

    .custom-weekend {
        display: flex;
        gap: 0.5rem;
    }

    .custom-weekend input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .add-weekend {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .add-weekend:hover {
        background: #0056b3;
    }

    @media (max-width: 640px) {
        .container {
            padding: 1rem;
        }

        .form-container {
            padding: 1.5rem;
        }

        h1 {
            font-size: 1.75rem;
        }

        .subtitle {
            font-size: 1rem;
        }

        .button-group {
            flex-direction: column;
        }

        .back-button, .next-button {
            width: 100%;
        }
    }
</style>