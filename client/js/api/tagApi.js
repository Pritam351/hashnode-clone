import { apiClient } from "./apiClient.js";

export async function getTags() {
    return apiClient.get("/tags");
}

export async function getTagBySlug(slug) {
    return apiClient.get(`/tags/${slug}`);
}
