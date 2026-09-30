import { isAuthenticated, logout } from "../utils/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader, hideLoader, createLoaderElement } from "../components/loader.js";
import { createErrorMessage, showErrorToast } from "../components/errorMessage.js";
import { getMyPosts, getMyPostStats, getMyPostById, deletePost } from "../api/postApi.js";
import { renderMarkdown } from "../utils/markdown.js";

const navbarRoot = document.getElementById("navbar-root");
const loaderContainer = document.getElementById("dashboard-loader");
const errorContainer = document.getElementById("dashboard-error");
const postsContainer = document.getElementById("posts-container");
const paginationContainer = document.getElementById("pagination-container");
const deleteModal = document.getElementById("delete-modal");
const deleteModalText = document.getElementById("delete-modal-text");
const deleteModalPostTitle = document.getElementById("delete-modal-post-title");
const deleteModalCancel = document.getElementById("delete-modal-cancel");
const deleteModalConfirm = document.getElementById("delete-modal-confirm");
const modalCloseBtn = deleteModal.querySelector(".modal-close");

const statAllValue = document.getElementById("stat-all-value");
const statPublishedValue = document.getElementById("stat-published-value");
const statDraftValue = document.getElementById("stat-draft-value");

const tabButtons = {
  all: document.querySelector('.tab-btn[data-status="all"]'),
  published: document.querySelector('.tab-btn[data-status="published"]'),
  draft: document.querySelector('.tab-btn[data-status="draft"]')
};

let currentStatus = "all";
let currentPage = 1;
const limit = 10;
let totalStats = { all: 0, published: 0, draft: 0 };

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "/client/pages/login.html";
    return;
  }

  renderNavbar(navbarRoot);
  setupEventListeners();
  await loadDashboardData();
}

function setupEventListeners() {
  // Tab buttons
  Object.values(tabButtons).forEach(btn => {
    btn.addEventListener("click", () => {
      const status = btn.dataset.status;
      if (currentStatus !== status) {
        currentStatus = status;
        updateTabActiveState();
        currentPage = 1;
        loadPosts();
      }
    });
  });

  // Delete modal
  deleteModalCancel.addEventListener("click", () => {
    hideDeleteModal();
  });

  modalCloseBtn.addEventListener("click", () => {
    hideDeleteModal();
  });

  deleteModalConfirm.addEventListener("click", async () => {
    const postId = deleteModalConfirm.dataset.postId;
    if (postId) {
      await handleDeletePost(postId);
    }
  });

  // Close modal on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !deleteModal.classList.contains("hidden")) {
      hideDeleteModal();
    }
  });

  // Close modal on backdrop click
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      hideDeleteModal();
    }
  });
}

function updateTabActiveState() {
  Object.entries(tabButtons).forEach(([status, btn]) => {
    if (status === currentStatus) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }
  });
}

async function loadDashboardData() {
  try {
    showLoader(loaderContainer);
    // Fetch statistics using the new dedicated endpoint
    const statsResponse = await getMyPostStats();
    // Fetch posts for current tab with pagination
    const postsResponse = await getMyPosts({ status: currentStatus !== "all" ? currentStatus : undefined, page: currentPage, limit });

    console.log('[DASHBOARD] Stats response:', statsResponse);
    console.log('[DASHBOARD] Posts response:', postsResponse);

    // Process stats from statsResponse (all posts)
    totalStats = {
      all: statsResponse.all,
      published: statsResponse.published,
      draft: statsResponse.draft
    };
    updateStatsDisplay();

    // Process posts for current status and page from postsResponse
    const displayPostsData = postsResponse.posts || [];
    renderPosts(displayPostsData);
    renderPagination(postsResponse.pagination.totalPosts);

    hideLoader(loaderContainer);
  } catch (error) {
    hideLoader(loaderContainer);
    console.error('[DASHBOARD] Error:', error);
    showError(error);
  }
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";
  if (posts.length === 0) {
    renderEmptyState();
    return;
  }

  posts.forEach(post => {
    const postCard = createPostCard(post);
    postsContainer.appendChild(postCard);
  });
}

function createPostCard(post) {
  const card = document.createElement("div");
  card.className = "post-card";
  card.dataset.postId = post._id;

  const statusBadge = document.createElement("span");
  statusBadge.className = `badge ${post.status === "published" ? "badge-published" : "badge-draft"}`;
  statusBadge.textContent = post.status.charAt(0).toUpperCase() + post.status.slice(1);

  const titleLink = document.createElement("a");
  titleLink.href = `/client/pages/post.html?slug=${post.slug}`;
  titleLink.className = "post-card__title";
  titleLink.textContent = post.title;
  titleLink.target = "_blank"; // Open in new tab for preview
  titleLink.rel = "noopener noreferrer";

  const metaInfo = document.createElement("div");
  metaInfo.className = "post-card__meta";

  const dateInfo = document.createElement("span");
  dateInfo.className = "post-card__date";
  const date = post.createdAt ? new Date(post.createdAt) : new Date();
  dateInfo.textContent = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const readTimeInfo = document.createElement("span");
  readTimeInfo.className = "post-card__read-time";
  readTimeInfo.textContent = `• ${post.readTime || 1} min read`;

  const viewsInfo = document.createElement("span");
  viewsInfo.className = "post-card__views";
  viewsInfo.textContent = `• ${post.viewsCount || 0} views`;

  metaInfo.append(dateInfo, readTimeInfo, viewsInfo);

  const tagsContainer = document.createElement("div");
  tagsContainer.className = "post-card__tags";
  if (post.tags && post.tags.length > 0) {
    post.tags.forEach(tag => {
      const tagPill = document.createElement("span");
      tagPill.className = "tag-pill";
      tagPill.textContent = tag.name || tag;
      tagsContainer.appendChild(tagPill);
    });
  } else {
    tagsContainer.textContent = "No tags";
  }

  const actionsContainer = document.createElement("div");
  actionsContainer.className = "post-card__actions";

  const viewBtn = document.createElement("a");
  viewBtn.href = `/client/pages/post.html?slug=${post.slug}`;
  viewBtn.className = "btn btn-outline btn-sm";
  viewBtn.textContent = "View";
  viewBtn.target = "_blank";
  viewBtn.rel = "noopener noreferrer";

  const editBtn = document.createElement("a");
  editBtn.href = `/client/pages/editor.html?id=${post._id}`;
  editBtn.className = "btn btn-outline btn-sm";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-outline btn-sm btn-danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    showDeleteModal(post._id, post.title);
  });

  actionsContainer.append(viewBtn, editBtn, deleteBtn);

  card.append(statusBadge, titleLink, metaInfo, tagsContainer, actionsContainer);
  return card;
}

function renderEmptyState() {
  postsContainer.innerHTML = `
    <div class="empty-state">
      <h3>No posts yet</h3>
      <p>Start writing your first story to share with the world.</p>
      <a href="/client/pages/editor.html" class="btn btn-primary">Create a Post</a>
    </div>
  `;
}

function renderPagination(totalPosts) {
  const totalPages = Math.ceil(totalPosts / limit);
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadPosts();
    }
  });

  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadPosts();
    }
  });

  const pageInfo = document.createElement("span");
  pageInfo.className = "pagination-info";
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  paginationContainer.append(prevBtn, pageInfo, nextBtn);
}

async function loadPosts() {
  try {
    showLoader(loaderContainer);
    const response = await getMyPosts({ status: currentStatus !== "all" ? currentStatus : undefined, page: currentPage, limit });
    const postsData = response.posts || [];
    renderPosts(postsData);
    renderPagination(response.pagination.totalPosts);
    hideLoader(loaderContainer);
  } catch (error) {
    hideLoader(loaderContainer);
    showError(error);
  }
}

function updateStatsDisplay() {
  statAllValue.textContent = totalStats.all;
  statPublishedValue.textContent = totalStats.published;
  statDraftValue.textContent = totalStats.draft;
}

function showDeleteModal(postId, postTitle) {
  deleteModalConfirm.dataset.postId = postId;
  deleteModalPostTitle.textContent = `"${postTitle}"`;
  deleteModalText.textContent = "Are you sure you want to delete this post? This action cannot be undone.";
  deleteModal.classList.remove("hidden");
  deleteModal.setAttribute("aria-hidden", "false");
  // Focus on cancel button for accessibility
  deleteModalCancel.focus();
}

function hideDeleteModal() {
  deleteModalConfirm.dataset.postId = "";
  deleteModalPostTitle.textContent = "";
  deleteModal.classList.add("hidden");
  deleteModal.setAttribute("aria-hidden", "true");
}

async function handleDeletePost(postId) {
  try {
    deleteModalConfirm.disabled = true;
    deleteModalConfirm.textContent = "Deleting...";
    await deletePost(postId);
    showErrorToast("Post deleted successfully", "success");
    hideDeleteModal();
    await loadDashboardData(); // Reload data to update list and stats
  } catch (error) {
    showError(error);
  } finally {
    deleteModalConfirm.disabled = false;
    deleteModalConfirm.textContent = "Delete Post";
  }
}

function showError(error) {
  let errorMessage = "An unknown error occurred";
  if (error.response && error.response.data && error.response.data.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  createErrorMessage(errorContainer, errorMessage);
  showErrorToast(errorMessage, "error");
}

// Initialize dashboard on load
init();