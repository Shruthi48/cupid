<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import Logo from '$lib/components/Logo.svelte';
    
    let identity = '';
    let password = '';
    let error = '';
    let isLoading = false;

    function validatePhoneNumber(phone: string) {
        return /^[0-9]{10}$/.test(phone);
    }

    async function login() {
        try {
            isLoading = true;
            error = '';
            
            // Don't allow email login
            if (identity.includes('@')) {
                error = 'Please use your nickname or phone number to login';
                return;
            }
            
            // If input looks like a phone number, validate it
            if (/^[0-9]+$/.test(identity)) {
                if (!validatePhoneNumber(identity)) {
                    error = 'Please enter a valid 10-digit phone number';
                    return;
                }
            }
            
            // Try to find a user with this nickname or phone number
            const result = await pb.collection('users').getList(1, 1, {
                filter: `nickname = "${identity}" || phoneNumber = "${identity}"`
            });
            
            // If we found a user, use their email to login
            if (result.items.length > 0) {
                await pb.collection('users').authWithPassword(result.items[0].email, password);
                goto('/find');
            } else {
                if (/^[0-9]+$/.test(identity)) {
                    error = 'Phone number not found. Please check and try again.';
                } else {
                    error = 'Nickname not found. Please check and try again.';
                }
            }
        } catch (err) {
            error = 'Invalid credentials. Please check your login details and try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="page-container">
    <div class="login-container">
        <div class="header">
            <h1>Welcome Back</h1>
            <p class="subtitle">Sign in to continue your journey</p>
        </div>
        
        {#if error}
            <div class="error">{error}</div>
        {/if}
        
        <form on:submit|preventDefault={login}>
            <div class="form-group">
                <label for="identity">Nickname or Phone Number</label>
                <input 
                    type="text" 
                    id="identity" 
                    bind:value={identity} 
                    required 
                    placeholder="Enter your nickname or phone number"
                />
                <p class="input-note">You can sign in using your nickname or 10-digit phone number</p>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    bind:value={password} 
                    required 
                    placeholder="Enter your password"
                />
            </div>
            
            <button type="submit" class="submit-button" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div class="signup-link">
                Don't have an account? <a href="/signup">Create one</a>
            </div>
        </form>
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

    .login-container {
        width: 100%;
        max-width: 400px;
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
    
    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.2s ease;
        background: white;
    }
    
    input:focus {
        outline: none;
        border-color: #64267C;
        box-shadow: 0 0 0 2px rgba(100, 38, 124, 0.1);
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

    .signup-link {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: #666;
    }

    .signup-link a {
        color: #64267C;
        text-decoration: none;
        font-weight: 500;
    }

    .signup-link a:hover {
        text-decoration: underline;
    }

    .input-note {
        font-size: 0.85rem;
        color: #666;
        margin-top: 0.5rem;
        line-height: 1.4;
    }

    .submit-button:disabled {
        background: #cccccc;
        cursor: not-allowed;
        transform: none;
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
</style>