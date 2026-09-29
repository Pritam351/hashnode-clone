import { apiClient } from "./apiClient.js";

export async function updateMyProfile(data) {
    const response = await apiClient.put("/users/me", data);
    return response;
}
