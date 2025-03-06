import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import { env } from '$env/dynamic/public';

// const backendUrl = env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const backendUrl =  'https://api.wallflowerapp.in/';
export const pb = new PocketBase(backendUrl);

// Add auth store to handle authentication state
export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model);
});