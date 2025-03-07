<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import Logo from '$lib/components/Logo.svelte';
    import { onDestroy } from 'svelte';
    
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let nickname = '';
    let phoneNumber = '';
    let error = '';
    let isCheckingNickname = false;
    let isCheckingPhone = false;
    let isVerificationSent = false;
    let isResendingEmail = false;
    let isCheckingVerification = false;
    let verificationAttempts = 0;
    let userId = '';

    // Password validation states
    $: passwordValidation = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Password confirmation validation
    $: passwordsMatch = password && passwordConfirm && password === passwordConfirm;

    // Phone number validation
    function validatePhoneNumber(phone: string) {
        return /^[0-9]{10}$/.test(phone);
    }

    async function checkPhoneAvailability() {
        if (!validatePhoneNumber(phoneNumber)) return;
        
        try {
            isCheckingPhone = true;
            error = '';
            
            // Check if phone number exists
            const result = await pb.collection('users').getList(1, 1, {
                filter: `phoneNumber = "${phoneNumber}"`
            });
            
            if (result.items.length > 0) {
                error = 'This phone number is already registered';
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error checking phone number:', err);
            error = 'Error checking phone number availability';
            return false;
        } finally {
            isCheckingPhone = false;
        }
    }

    // Check if form is valid
    $: isFormValid = email && 
        nickname &&
        validatePhoneNumber(phoneNumber) &&
        Object.values(passwordValidation).every(Boolean) && 
        passwordsMatch;

    function validatePassword(pass: string) {
        const minLength = pass.length >= 8;
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

        if (!minLength) return 'Password must be at least 8 characters long';
        if (!hasUpperCase) return 'Password must include at least one uppercase letter';
        if (!hasNumber) return 'Password must include at least one number';
        if (!hasSpecial) return 'Password must include at least one special character';
        return null;
    }

    let verificationCheckInterval: number;

    async function checkVerificationStatus() {
        if (!userId) {
            console.error('No user ID available for verification check');
            return;
        }

        try {
            verificationAttempts++;
            isCheckingVerification = true;
            
            // Get the latest user data directly using the ID
            const user = await pb.collection('users').getOne(userId);
            
            // Check if the user is verified
            if (user.verified) {
                clearInterval(verificationCheckInterval);
                goto('/login');
                return;
            }

            // Stop checking after 3 attempts
            if (verificationAttempts >= 3) {
                clearInterval(verificationCheckInterval);
            }
        } catch (err) {
            // Handle specific error cases
            if (err.status === 404) {
                console.warn('User record not found during verification check');
            } else if (err.status === 0 || err.status === 502 || err.status === 503) {
                console.warn('Network error during verification check:', err);
            } else {
                console.error('Error checking verification status:', err);
            }
            
            // Stop after 3 attempts
            if (verificationAttempts >= 3) {
                clearInterval(verificationCheckInterval);
            }
        } finally {
            isCheckingVerification = false;
        }
    }

    async function checkNicknameAvailability() {
        if (!nickname) return;
        
        try {
            isCheckingNickname = true;
            error = '';
            
            // Check if nickname exists
            const result = await pb.collection('users').getList(1, 1, {
                filter: `nickname = "${nickname}"`
            });
            
            if (result.items.length > 0) {
                error = 'This nickname is already taken';
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error checking nickname:', err);
            error = 'Error checking nickname availability';
            return false;
        } finally {
            isCheckingNickname = false;
        }
    }

    async function signup() {
        // Validate phone number format
        if (!validatePhoneNumber(phoneNumber)) {
            error = 'Please enter a valid 10-digit phone number';
            return;
        }

        // Check phone number availability
        const isPhoneAvailable = await checkPhoneAvailability();
        if (!isPhoneAvailable) return;

        // Check nickname availability
        const isNicknameAvailable = await checkNicknameAvailability();
        if (!isNicknameAvailable) return;

        // Validate password requirements
        const passwordError = validatePassword(password);
        if (passwordError) {
            error = passwordError;
            return;
        }

        if (password !== passwordConfirm) {
            error = 'Passwords do not match';
            return;
        }

        try {
            const data = {
                email,
                password,
                passwordConfirm,
                nickname,
                phoneNumber
            };
            
            // Create the user account
            const newUser = await pb.collection('users').create(data);
            userId = newUser.id;
            
            // Send verification email
            await pb.collection('users').requestVerification(email);
            
            isVerificationSent = true;
            error = '';

            // Check immediately first
            await checkVerificationStatus();
            
            // Then start periodic checks
            verificationCheckInterval = setInterval(checkVerificationStatus, 30000);
        } catch (err) {
            // Check if error is about email uniqueness
            if (err?.response?.data?.email?.code === 'validation_not_unique') {
                error = 'This email is already registered. Please use a different email or try logging in.';
                return;
            } else {
                error = err.message;
            }
            
        }
    }

    // Clean up interval when component is destroyed
    onDestroy(() => {
        if (verificationCheckInterval) {
            clearInterval(verificationCheckInterval);
        }
    });

    async function resendVerification() {
        try {
            isResendingEmail = true;
            
            // First get the user ID if we don't have it
            if (!userId) {
                const user = await pb.collection('users').getFirstListItem(`email = "${email}"`);
                userId = user.id;
            }
            
            await pb.collection('users').requestVerification(email);
            error = '';

            // Clear existing interval if any
            if (verificationCheckInterval) {
                clearInterval(verificationCheckInterval);
            }

            // Reset verification attempts
            verificationAttempts = 0;
            
            // Check immediately first
            await checkVerificationStatus();
            
            // Then start periodic checks
            verificationCheckInterval = setInterval(checkVerificationStatus, 30000);
        } catch (err) {
            error = err.message;
        } finally {
            isResendingEmail = false;
        }
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="page-container">
    <div class="signup-container">
        {#if isVerificationSent}
            <div class="verification-sent">
                <h2>Verify your email</h2>
                <p>We've sent a verification email to <strong>{email}</strong>.</p>
                <p>Please check your inbox and click the verification link to complete your registration.</p>
                
                <div class="resend-section">
                    <p>Didn't receive the email?</p>
                    <button 
                        class="resend-button" 
                        on:click={resendVerification} 
                        disabled={isResendingEmail}
                    >
                        {isResendingEmail ? 'Sending...' : 'Resend verification email'}
                    </button>
                </div>

                <div class="verification-status">
                    {#if isCheckingVerification}
                        <div class="checking">
                            <div class="mini-spinner"></div>
                            <span>Checking verification status... (Attempt {verificationAttempts}/3)</span>
                        </div>
                    {:else if verificationAttempts >= 3}
                        <div class="checking-complete">
                            <span>Verification not detected. Please check your email and click the verification link.</span>
                        </div>
                    {/if}
                </div>
                <div class="login-link">
                    <a href="/login">Already verified? Sign in</a>
                </div>
            </div>
        {:else}
            <div class="header">
                <h1>Create Account</h1>
                <p class="subtitle">Join our community and start connecting</p>
            </div>
            
            {#if error}
                <div class="error">{error}</div>
            {/if}

            <div class="form-container">
                <form on:submit|preventDefault={signup}>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            bind:value={email} 
                            required 
                            placeholder="Enter your professional email"
                        />
                        <p class="email-note">
                            Please use your professional email for verification. This helps us validate your identity.
                            <span class="privacy-note">For privacy, your email will never be displayed or shared with other users.</span>
                        </p>
                    </div>

                    <div class="form-group">
                        <label for="nickname">Nickname</label>
                        <input 
                            type="text" 
                            id="nickname" 
                            bind:value={nickname} 
                            on:blur={checkNicknameAvailability}
                            required 
                            placeholder="Choose a unique nickname"
                            class={error && error.includes('nickname') ? 'error' : ''}
                        />
                        {#if isCheckingNickname}
                            <div class="checking-nickname">
                                <div class="mini-spinner"></div>
                                <span>Checking nickname availability...</span>
                            </div>
                        {/if}
                    </div>

                    <div class="form-group">
                        <label for="phoneNumber">Phone Number</label>
                        <input 
                            type="tel" 
                            id="phoneNumber" 
                            bind:value={phoneNumber} 
                            required 
                            pattern="[0-9]{10}"
                            minlength="10"
                            maxlength="10"
                            placeholder="Enter your 10-digit phone number"
                            class={error && error.includes('phone') ? 'error' : ''}
                            on:blur={checkPhoneAvailability}
                        />
                        {#if isCheckingPhone}
                            <div class="checking-phone">
                                <div class="mini-spinner"></div>
                                <span>Checking phone number availability...</span>
                            </div>
                        {/if}
                        <p class="phone-note">
                            Please provide a valid 10-digit phone number.
                            <span class="privacy-note">Your phone number will be kept private and used only for account security.</span>
                        </p>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            bind:value={password} 
                            required 
                            placeholder="Create a password"
                        />
                        <div class="password-rules">
                            <p>Password requirements:</p>
                            <ul>
                                <li class={passwordValidation.minLength ? 'valid' : ''}>
                                    {passwordValidation.minLength ? '✓' : '○'} At least 8 characters long
                                </li>
                                <li class={passwordValidation.hasUpperCase ? 'valid' : ''}>
                                    {passwordValidation.hasUpperCase ? '✓' : '○'} One uppercase letter
                                </li>
                                <li class={passwordValidation.hasNumber ? 'valid' : ''}>
                                    {passwordValidation.hasNumber ? '✓' : '○'} One number
                                </li>
                                <li class={passwordValidation.hasSpecial ? 'valid' : ''}>
                                    {passwordValidation.hasSpecial ? '✓' : '○'} One special character
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="passwordConfirm">Confirm Password</label>
                        <input 
                            type="password" 
                            id="passwordConfirm" 
                            bind:value={passwordConfirm} 
                            required 
                            placeholder="Confirm your password"
                        />
                        {#if passwordConfirm}
                            <div class="password-confirmation {passwordsMatch ? 'valid' : 'invalid'}">
                                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </div>
                        {/if}
                    </div>

                    <button 
                        type="submit" 
                        class="submit-button" 
                        disabled={!isFormValid}
                    >
                        Create Account
                    </button>

                    <div class="login-link">
                        Already have an account? <a href="/login">Sign in</a>
                    </div>
                </form>
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
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(185deg, #F8F7FF 0%, #725EA0 100%);
        padding: 1rem;
    }

    .signup-container {
        width: 100%;
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        animation: fadeInUp 0.5s ease forwards;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    h1 {
        font-size: 2rem;
        color: #64267C;
        margin: 0;
        font-weight: 600;
    }

    .subtitle {
        color: #666;
        margin-top: 0.5rem;
        font-size: 1rem;
    }
    
    .error {
        color: #dc3545;
        background-color: rgba(220, 53, 69, 0.1);
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        font-size: 0.9rem;
    }
    
    .form-group {
        margin-bottom: 1.25rem;
    }
    
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #444;
    }
    
    input, select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.2s ease;
        background: white;
        max-width: 300px;
    }
    
    input:focus, select:focus {
        outline: none;
        border-color: #64267C;
        box-shadow: 0 0 0 2px rgba(100, 38, 124, 0.1);
    }

    select {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364267C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 1.25rem center;
        background-size: 1em;
        padding-right: 3rem;
        cursor: pointer;
    }
    
    select:invalid {
        color: #999;
    }

    select option {
        color: #333;
        font-size: 1rem;
        padding: 0.5rem;
    }

    select option:first-child {
        color: #999;
    }

    .submit-button {
        width: 100%;
        padding: 0.875rem;
        background: #64267C;
        color: white;
        border: none;
        border-radius: 2rem;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.2s ease;
        margin-top: 1rem;
    }
    
    .submit-button:hover:not(:disabled) {
        background: #7c2f99;
        transform: translateY(-1px);
    }

    .submit-button:disabled {
        background: #cccccc;
        cursor: not-allowed;
        transform: none;
    }

    .submit-button:active {
        transform: translateY(0);
    }

    .password-rules {
        background: rgba(100, 38, 124, 0.05);
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        margin: 0.5rem 0 1rem;
        font-size: 0.9rem;
    }

    .password-rules p {
        color: #64267C;
        margin: 0 0 0.5rem 0;
        font-weight: 500;
    }

    .password-rules ul {
        margin: 0;
        padding-left: 1.2rem;
        list-style-type: disc;
    }

    .password-rules li {
        color: #666;
        margin: 0.25rem 0;
        line-height: 1.4;
    }

    .login-link {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: #666;
    }

    .login-link a {
        color: #64267C;
        text-decoration: none;
        font-weight: 500;
    }

    .login-link a:hover {
        text-decoration: underline;
    }

    .verification-sent {
        text-align: center;
        padding: 1rem;
    }

    .verification-sent h2 {
        margin-bottom: 1rem;
        color: #64267C;
    }

    .verification-sent p {
        margin-bottom: 1rem;
        color: #666;
    }

    .resend-section {
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(100, 38, 124, 0.05);
        border-radius: 0.5rem;
    }

    .resend-button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        background: transparent;
        border: 1px solid #64267C;
        border-radius: 2rem;
        color: #64267C;
        cursor: pointer;
        transition: all 0.2s;
    }

    .resend-button:hover:not(:disabled) {
        background: rgba(100, 38, 124, 0.1);
    }

    .resend-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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

    .password-rules {
        background: rgba(100, 38, 124, 0.05);
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 0.75rem 0;
        font-size: 0.85rem;
        border: 1px solid rgba(100, 38, 124, 0.1);
    }

    .email-note, .phone-note {
        font-size: 0.85rem;
        color: #666;
        margin-top: 0.5rem;
        line-height: 1.4;
        max-width: 300px;
    }

    .privacy-note {
        display: block;
        color: #64267C;
        margin-top: 0.25rem;
        font-style: italic;
    }

    .password-rules p {
        color: #64267C;
        margin: 0 0 0.5rem 0;
        font-weight: 500;
    }

    .password-rules ul {
        margin: 0;
        padding-left: 1.2rem;
        list-style-type: none;
    }

    .password-rules li {
        color: #666;
        margin: 0.4rem 0;
        line-height: 1.4;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .password-rules li.valid {
        color: #28a745;
        font-weight: 500;
    }

    .password-confirmation {
        font-size: 0.85rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
    }

    .password-confirmation.valid {
        color: #28a745;
        background: rgba(40, 167, 69, 0.1);
    }

    .password-confirmation.invalid {
        color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
    }

    .verification-status {
        margin: 1rem 0;
    }

    .checking-phone,
    .checking-nickname {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: #64267C;
    }

    .checking, .checking-complete {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: #64267C;
        font-size: 0.9rem;
        text-align: center;
    }

    .checking-complete {
        padding: 0.5rem;
        background: rgba(100, 38, 124, 0.05);
        border-radius: 0.5rem;
    }

    .mini-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #64267C;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @media (max-width: 640px) {
        .page-container {
            padding: 1rem;
        }

        .signup-container {
            margin: 1rem auto;
        }

        .form-container {
            padding: 1.5rem;
        }
    }
</style>