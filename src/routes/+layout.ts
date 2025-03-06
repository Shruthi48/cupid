import { pb } from '$lib/pocketbase';


export const load = async () => {
    return {
        user: pb.authStore.model
    };
};

