import { apiClient } from "./apiClient.js";

export async function getPosts(options = {}) {
    const { page, limit, search, tag, author } = options;

    return apiClient.get("/posts", {
        query: {
            page,
            limit,
            search,
            tag,
            author
        }
    });
}

export async function getPostBySlug(slug) {
    return apiClient.get(`/posts/${slug}`);
}

export async function getMyPosts(options = {}) {
    const { page, limit, status } = options;

    return apiClient.get("/posts/my-posts", {
        query: {
            page,
            limit,
            status
        }
    });
}

export async function createPost(postData) {
    return apiClient.post("/posts", postData);
}

export async function updatePost(id, postData) {
    return apiClient.put(`/posts/${id}`, postData);
}

export async function deletePost(id) {
    return apiClient.delete(`/posts/${id}`);
}
