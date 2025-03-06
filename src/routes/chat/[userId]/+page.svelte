<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { currentUser } from '$lib/pocketbase';
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { generateChatKey, encryptMessage, decryptMessage } from '$lib/encryption';

    let chatMessage = '';
    let chatMessages = [];
    let unsubscribe = null;
    let selectedUser = null;
    let error = '';
    let showEmojiPicker = false;
    let emojiButton: HTMLElement;
    let emojiPicker: HTMLElement;
    let selectedCategory = 'recent';
    let chatKey = '';

    const emojiCategories = {
        recent: {
            name: 'Recent',
            icon: 'history',
            emojis: ['😊', '😂', '❤️', '👍', '🎉', '🌹', '🤗', '😍']
        },
        smileys: {
            name: 'Smileys',
            icon: 'sentiment_satisfied_alt',
            emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘']
        },
        people: {
            name: 'People',
            icon: 'face',
            emojis: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️']
        },
        nature: {
            name: 'Nature',
            icon: 'eco',
            emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🌸', '🌺']
        },
        food: {
            name: 'Food',
            icon: 'restaurant',
            emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝']
        },
        activities: {
            name: 'Activities',
            icon: 'sports_soccer',
            emojis: ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍']
        },
        objects: {
            name: 'Objects',
            icon: 'lightbulb',
            emojis: ['⌚️', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼']
        },
        symbols: {
            name: 'Symbols',
            icon: 'emoji_symbols',
            emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖']
        }
    };

    $: isLoggedIn = !!$currentUser;
    $: userId = $page.params.userId;
    $: currentEmojis = emojiCategories[selectedCategory].emojis;

    // Close emoji picker when clicking outside
    function handleClickOutside(event: MouseEvent) {
        if (browser && showEmojiPicker && emojiPicker && emojiButton && 
            !emojiPicker.contains(event.target as Node) && 
            !emojiButton.contains(event.target as Node)) {
            showEmojiPicker = false;
        }
    }

    // Add emoji to message
    function addEmoji(emoji: string) {
        chatMessage += emoji;
        
        // Update recent emojis
        if (selectedCategory !== 'recent') {
            const recentEmojis = emojiCategories.recent.emojis;
            if (!recentEmojis.includes(emoji)) {
                recentEmojis.unshift(emoji);
                if (recentEmojis.length > 16) {
                    recentEmojis.pop();
                }
            }
        }
    }

    async function loadUserDetails() {
        try {
            selectedUser = await pb.collection('users').getOne(userId);
        } catch (err) {
            console.error('Error loading user:', err);
            error = 'Failed to load user details';
            goto('/find');
        }
    }

    // Subscribe to real-time chat messages
    async function subscribeToChatMessages() {
        try {
            // Load existing messages
            const existingMessages = await pb.collection('chat_messages').getList(1, 50, {
                filter: `(sender = "${$currentUser.id}" && receiver = "${userId}") || (sender = "${userId}" && receiver = "${$currentUser.id}")`,
                sort: 'created',
            });
            chatMessages = existingMessages.items.map(msg => ({
                ...msg,
                message: decryptMessage(msg.message, chatKey)
            }));

            // Subscribe to new messages
            unsubscribe = await pb.collection('chat_messages').subscribe('*', async ({ action, record }) => {
                if (action === 'create') {
                    // Check if message is for current chat
                    if ((record.sender === $currentUser.id && record.receiver === userId) ||
                        (record.sender === userId && record.receiver === $currentUser.id)) {
                        record.message = decryptMessage(record.message, chatKey);
                        chatMessages = [...chatMessages, record];
                    }
                }
            });
        } catch (err) {
            console.error('Error subscribing to messages:', err);
            error = 'Failed to load messages';
        }
    }

    async function sendMessage() {
        if (!chatMessage.trim() || !selectedUser) return;

        try {
            const encryptedMessage = encryptMessage(chatMessage.trim(), chatKey);
            const messageData = {
                sender: $currentUser.id,
                receiver: userId,
                message: encryptedMessage,
                read: false
            };

            await pb.collection('chat_messages').create(messageData);
            chatMessage = ''; // Clear input after sending
        } catch (err) {
            error = 'Failed to send message';
            console.error('Error sending message:', err);
        }
    }

    function scrollToBottom() {
        if (browser) {
            const chatContainer = document.querySelector('.chat-messages');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    }

    onMount(async () => {
        if (!isLoggedIn) {
            goto('/login');
            return;
        }
        loadUserDetails();
        chatKey = generateChatKey($currentUser.id, userId);
        await subscribeToChatMessages();
        
        // Add click outside listener
        if (browser) {
            document.addEventListener('click', handleClickOutside);
            scrollToBottom();
        }
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
        if (browser) {
            document.removeEventListener('click', handleClickOutside);
        }
    });
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

<div class="chat-page">
    {#if error}
        <div class="error">{error}</div>
    {/if}

    {#if selectedUser}
        <div class="chat-container">
            <div class="encryption-notice">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Messages in this chat are end-to-end encrypted</span>
            </div>

            <div class="chat-header">
                <a href="/find" class="back-button">←</a>
                <h3>Chat with {selectedUser.nickname}</h3>
            </div>
            
            <div class="chat-messages">
                {#each chatMessages as msg}
                    <div class="message-bubble {msg.sender === $currentUser.id ? 'sent' : 'received'}">
                        <p>{msg.message}</p>
                        <small>{new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</small>
                    </div>
                {/each}
            </div>

            <div class="chat-input">
                <div class="emoji-section">
                    <button 
                        class="emoji-button" 
                        bind:this={emojiButton}
                        on:click={() => showEmojiPicker = !showEmojiPicker}
                    >
                        <span class="material-icons">emoji_emotions</span>
                    </button>
                    
                    {#if showEmojiPicker}
                        <div class="emoji-picker" bind:this={emojiPicker}>
                            <div class="emoji-categories">
                                {#each Object.entries(emojiCategories) as [key, category]}
                                    <button 
                                        class="category-button {selectedCategory === key ? 'active' : ''}"
                                        on:click={() => selectedCategory = key}
                                        title={category.name}
                                    >
                                        <span class="material-icons">{category.icon}</span>
                                    </button>
                                {/each}
                            </div>
                            <div class="emoji-grid">
                                {#each currentEmojis as emoji}
                                    <button 
                                        class="emoji-item"
                                        on:click={() => addEmoji(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
                
                <input
                    type="text"
                    bind:value={chatMessage}
                    placeholder="Type a message..."
                    on:keydown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button class="send-button" on:click={sendMessage}>
                    <span class="material-icons">send</span>
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(185deg, #F8F7FF 0%, #725EA0 100%);
        min-height: 100vh;
    }

    .chat-page {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
        height: calc(100vh - 4rem);
    }

    .chat-container {
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-radius: 1.5rem;
        box-shadow: 0 8px 24px rgba(100, 38, 124, 0.12);
        border: 2px solid rgba(114, 94, 160, 0.1);
        height: 100%;
    }

    .encryption-notice {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background-color: #ebf8ff;
        color: #2c5282;
        font-size: 13px;
        border-bottom: 1px solid #bee3f8;
    }

    .encryption-notice svg {
        color: #4299e1;
    }

    .chat-header {
        padding: 1.5rem;
        border-bottom: 2px solid rgba(114, 94, 160, 0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .back-button {
        text-decoration: none;
        color: #64267C;
        font-size: 1.5rem;
        line-height: 1;
        transition: transform 0.2s ease;
    }

    .back-button:hover {
        transform: translateX(-2px);
    }

    h3 {
        color: #64267C;
        margin: 0;
        font-weight: 600;
        font-size: 1.25rem;
    }

    .chat-messages {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .message-bubble {
        max-width: 70%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        position: relative;
        animation: fadeIn 0.3s ease forwards;
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

    .message-bubble p {
        margin: 0;
        line-height: 1.4;
    }

    .message-bubble small {
        font-size: 0.75rem;
        opacity: 0.7;
        margin-top: 0.25rem;
        display: block;
    }

    .sent {
        align-self: flex-end;
        background: #64267C;
        color: white;
        border-bottom-right-radius: 0.25rem;
    }

    .received {
        align-self: flex-start;
        background: rgba(114, 94, 160, 0.1);
        color: #333;
        border-bottom-left-radius: 0.25rem;
    }

    .chat-input {
        padding: 1.5rem;
        border-top: 2px solid rgba(114, 94, 160, 0.1);
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .emoji-section {
        position: relative;
    }

    .emoji-button {
        background: transparent;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64267C;
        transition: all 0.2s ease;
    }

    .emoji-button:hover {
        background: rgba(100, 38, 124, 0.1);
    }

    .chat-input input {
        flex: 1;
        padding: 0.875rem 1.25rem;
        border: 2px solid rgba(114, 94, 160, 0.2);
        border-radius: 2rem;
        font-family: inherit;
        font-size: 1rem;
        color: #333;
        background: white;
        transition: all 0.2s ease;
    }

    .chat-input input:focus {
        outline: none;
        border-color: #64267C;
        box-shadow: 0 0 0 4px rgba(100, 38, 124, 0.1);
    }

    .chat-input input::placeholder {
        color: #999;
    }

    .emoji-picker {
        position: absolute;
        bottom: 100%;
        left: 0;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        z-index: 1000;
        animation: fadeInUp 0.2s ease;
        width: 320px;
    }

    .emoji-categories {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(114, 94, 160, 0.1);
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .emoji-categories::-webkit-scrollbar {
        display: none;
    }

    .category-button {
        background: transparent;
        border: none;
        padding: 0.5rem;
        color: #999;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: all 0.2s ease;
    }

    .category-button:hover {
        background: rgba(100, 38, 124, 0.1);
        color: #64267C;
    }

    .category-button.active {
        background: rgba(100, 38, 124, 0.1);
        color: #64267C;
    }

    .emoji-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding-right: 0.5rem;
    }

    .emoji-grid::-webkit-scrollbar {
        width: 6px;
    }

    .emoji-grid::-webkit-scrollbar-track {
        background: rgba(114, 94, 160, 0.1);
        border-radius: 3px;
    }

    .emoji-grid::-webkit-scrollbar-thumb {
        background: rgba(100, 38, 124, 0.2);
        border-radius: 3px;
    }

    .emoji-item {
        background: transparent;
        border: none;
        padding: 0.5rem;
        font-size: 1.25rem;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .emoji-item:hover {
        background: rgba(100, 38, 124, 0.1);
        transform: scale(1.1);
    }

    .send-button {
        background: #64267C;
        color: white;
        border: none;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .send-button:hover {
        background: #7B3195;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(100, 38, 124, 0.2);
    }

    .send-button:active {
        transform: translateY(0);
    }

    .material-icons {
        font-size: 1.25rem;
    }

    .error {
        background: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
        padding: 1rem;
        border-radius: 1rem;
        margin-bottom: 1rem;
        text-align: center;
        font-size: 0.875rem;
    }

    @media (max-width: 640px) {
        .chat-page {
            margin: 0;
            height: 100vh;
            padding: 0;
        }

        .chat-container {
            border-radius: 0;
            border: none;
        }

        .chat-header {
            padding: 1rem;
        }

        .chat-messages {
            padding: 1rem;
        }

        .chat-input {
            padding: 1rem;
        }

        .emoji-picker {
            position: fixed;
            bottom: 5rem;
            left: 1rem;
            right: 1rem;
            width: auto;
            margin-bottom: 0;
        }

        .emoji-grid {
            max-height: 150px;
        }
    }
</style>
