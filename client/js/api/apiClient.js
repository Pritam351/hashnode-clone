export const API_BASE_URL = "https://hashnode-clone-api.onrender.com/api";

function buildUrl(path, query) {
    const url = new URL(path.replace(/^\//, ""), `${API_BASE_URL}/`);

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, value);
            }
        });
    }

    return url;
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return response.text();
}

function getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
    const {
        method = "GET",
        body,
        headers = {},
        query,
        signal
    } = options;

    const requestHeaders = {
        Accept: "application/json",
        ...getAuthHeaders(),
        ...headers
    };

    const requestOptions = {
        method,
        headers: requestHeaders,
        signal
    };

    if (body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(body);
    }

    let response;

    try {
        response = await fetch(buildUrl(path, query), requestOptions);
    } catch (error) {
        throw new Error("Unable to reach the API. Check that the server is running.", {
            cause: error
        });
    }

    const data = await parseResponse(response);

    if (!response.ok) {
        const message = typeof data === "object" && data?.message
            ? data.message
            : "Something went wrong while communicating with the API.";
        const apiError = new Error(message);

        apiError.status = response.status;
        apiError.data = data;

        throw apiError;
    }

    return data;
}

export const apiClient = {
    get: (path, options = {}) => request(path, { ...options, method: "GET" }),
    post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
    put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
    delete: (path, options = {}) => request(path, { ...options, method: "DELETE" })
};
