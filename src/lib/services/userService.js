import { pb } from '$lib/pocketbase';

export async function fetchOppositeGenderUsers(currentUser) {
    const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';
    return await pb.collection('users').getFullList({
        sort: '-created',
        filter: `gender = "${oppositeGender}"`,
        expand: 'city'
    });
}

export async function fetchLikedUsers(currentUser) {
    const likes = await pb.collection('likes').getList(1, 50, {
        filter: `user = "${currentUser.id}"`,
        expand: 'liked_user'
    });
    
    const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';
    return likes.items
        .map(like => like.expand.liked_user)
        .filter(user => user?.gender === oppositeGender);
}

export async function fetchMatches(currentUser) {
    const myLikes = await pb.collection('likes').getList(1, 50, {
        filter: `user = "${currentUser.id}"`,
        expand: 'liked_user'
    });
    
    const likedUserIds = myLikes.items
        .map(like => like.liked_user)
        .filter(id => id);
    
    if (likedUserIds.length === 0) {
        return [];
    }
    
    const theirLikes = await pb.collection('likes').getList(1, 50, {
        filter: `user in ["${likedUserIds.join('","')}"] && liked_user = "${currentUser.id}"`,
        expand: 'user'
    });
    
    const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';
    return theirLikes.items
        .map(like => like.expand.user)
        .filter(user => user?.gender === oppositeGender);
}

export async function toggleLike(currentUser, targetUser) {
    const existingLike = await pb.collection('likes').getFirstListItem(
        `user = "${currentUser.id}" && liked_user = "${targetUser.id}"`
    ).catch(() => null);

    if (existingLike) {
        await pb.collection('likes').delete(existingLike.id);
    } else {
        await pb.collection('likes').create({
            user: currentUser.id,
            liked_user: targetUser.id
        });
    }
}
