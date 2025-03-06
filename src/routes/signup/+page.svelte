<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import Logo from '$lib/components/Logo.svelte';
    
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let error = '';
    let isVerificationSent = false;
    let isResendingEmail = false;

    async function signup() {
        if (password !== passwordConfirm) {
            error = 'Passwords do not match';
            return;
        }

        try {
            const data = {
                email,
                password,
                passwordConfirm
            };
            
            // Create the user account
            await pb.collection('users').create(data);
            
            // Send verification email
            await pb.collection('users').requestVerification(email);
            
            isVerificationSent = true;
            error = '';
        } catch (err) {
            error = err.message;
        }
    }

    async function resendVerification() {
        try {
            isResendingEmail = true;
            await pb.collection('users').requestVerification(email);
            error = '';
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

                <div class="login-link">
                    Already verified? <a href="/basic-details">Add more info</a>
                </div>
                <div class="login-link">
                    Already verified? <a href="/login">Login</a>
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
                            placeholder="Enter your email"
                        />
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
                    </div>

                    <button type="submit" class="submit-button">Create Account</button>

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
    
    .submit-button:hover {
        background: #7c2f99;
        transform: translateY(-1px);
    }

    .submit-button:active {
        transform: translateY(0);
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