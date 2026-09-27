import { isAuthenticated, logout } from "../utils/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader, hideLoader, createLoaderElement } from "../components/loader.js";
import { createErrorMessage, showErrorToast } from "../components/errorMessage.js";
import { getMyPostById, createPost, updatePost } from "../api/postApi.js";
import { renderMarkdown } from "../utils/markdown.js";
import { getUser } from "../utils/auth.js";

const navbarRoot = document.getElementById("navbar-root");
const editorForm = document.getElementById("editor-form");
const editorTitleInput = document.getElementById("editor-title-input");
const editorCoverInput = document.getElementById("editor-cover-input");
const editorTagsInput = document.getElementById("editor-tags-input");
const editorStatusSelect = document.getElementById("editor-status");
const editorContent = document.getElementById("editor-content");
const editorPreviewToggle = document.getElementById("editor-preview-toggle");
const editorPreviewContainer = document.getElementById("editor-preview-container");
const editorPreview = document.getElementById("editor-preview");
const editorSaveDraftBtn = document.getElementById("editor-save-draft");
const editorPublishBtn = document.getElementById("editor-publish");
const editorTitle = document.getElementById("editor-title");

let isEditMode = false;
let postId = null;

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "/client/pages/login.html";
    return;
  }

  renderNavbar(navbarRoot);
  setupEventListeners();

  // Check if we're in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  postId = urlParams.get("id");

  if (postId) {
    isEditMode = true;
    editorTitle.textContent = "Edit Story";
    await loadPostForEdit();
  } else {
    isEditMode = false;
    editorTitle.textContent = "New Story";
    // Set default status to draft
    editorStatusSelect.value = "draft";
    initializePreview();
  }
}

function setupEventListeners() {
  editorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  editorSaveDraftBtn.addEventListener("click", () => {
    editorStatusSelect.value = "draft";
    handleFormSubmit();
  });

  editorPublishBtn.addEventListener("click", () => {
    editorStatusSelect.value = "published";
    handleFormSubmit();
  });

  editorPreviewToggle.addEventListener("change", () => {
    if (editorPreviewToggle.checked) {
      showPreview();
    } else {
      hidePreview();
    }
  });

  editorContent.addEventListener("input", () => {
    if (editorPreviewToggle.checked) {
      updatePreview();
    }
  });
}

function initializePreview() {
  // Start with preview hidden
  editorPreviewContainer.classList.add("hidden");
  editorPreviewToggle.checked = false;
}

function showPreview() {
  editorPreviewContainer.classList.remove("hidden");
  updatePreview();
}

function hidePreview() {
  editorPreviewContainer.classList.add("hidden");
}

function updatePreview() {
  const content = editorContent.value;
  if (content.trim()) {
    editorPreview.innerHTML = renderMarkdown(content);
  } else {
    editorPreview.innerHTML = "<p>Start writing to see a preview...</p>";
  }
}

async function loadPostForEdit() {
  try {
    showLoader(document.getElementById("main-content"));
    const response = await getMyPostById(postId);
    const post = response.data;

    // Populate form
    editorTitleInput.value = post.title || "";
    editorCoverInput.value = post.coverImage || "";
    editorTagsInput.value = post.tags ? post.tags.map(t => t.name).join(", ") : "";
    editorStatusSelect.value = post.status;
    editorContent.value = post.content || "";

    // Update preview if toggle is on
    if (editorPreviewToggle.checked) {
      updatePreview();
    }

    hideLoader(document.getElementById("main-content"));
  } catch (error) {
    hideLoader(document.getElementById("main-content"));
    showErrorToast("Failed to load post. It may have been deleted or you don't have permission.", "error");
    setTimeout(() => {
      window.location.href = "/client/pages/dashboard.html";
    }, 1500);
  }
}

async function handleFormSubmit() {
  // Validate required fields
  if (!editorTitleInput.value.trim()) {
    showErrorToast("Title is required", "error");
    editorTitleInput.focus();
    return;
  }

  if (!editorContent.value.trim()) {
    showErrorToast("Content is required", "error");
    editorContent.focus();
    return;
  }

  // Prepare post data
  const postData = {
    title: editorTitleInput.value.trim(),
    content: editorContent.value.trim(),
    coverImage: editorCoverInput.value.trim() || null,
    tags: editorTagsInput.value
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0),
    status: editorStatusSelect.value
  };

  try {
    if (isEditMode) {
      showLoader(document.getElementById("main-content"));
      await updatePost(postId, postData);
      showErrorToast("Post updated successfully", "success");
      // Redirect to dashboard after successful update
      setTimeout(() => {
        window.location.href = "/client/pages/dashboard.html";
      }, 1000);
    } else {
      showLoader(document.getElementById("main-content"));
      const response = await createPost(postData);
      showErrorToast("Post created successfully", "success");
      // Redirect to dashboard or post view
      setTimeout(() => {
        window.location.href = `/client/pages/post.html?slug=${response.data.slug}`;
      }, 1000);
    }
  } catch (error) {
    hideLoader(document.getElementById("main-content"));
    let errorMessage = "Failed to save post";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    showErrorToast(errorMessage, "error");
  } finally {
    if (isEditMode) {
      hideLoader(document.getElementById("main-content"));
    }
  }
}

// Initialize editor on load
init();