import { apiClient } from "./apiClient.js";

export async function getUserById(userId) {
    return apiClient.get(`/users/${userId}`);
}

export async function getUserPosts(userId) {
    return apiClient.get(`/users/${userId}/posts`);
}

export async function updateMyProfile(data) {
    const response = await apiClient.put("/users/me", data);
    return response;
}

