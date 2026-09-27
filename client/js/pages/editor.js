import { isAuthenticated, logout } from "../utils/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader, hideLoader, createLoaderElement } from "../components/loader.js";
import { createErrorMessage, showErrorToast } from "../components/errorMessage.js";
import { getMyPostById, createPost, updatePost } from "../api/postApi.js";
import { renderMarkdown } from "../utils/markdown.js";
import { getTags } from "../api/tagApi.js";
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
const editorCancelBtn = document.getElementById("editor-cancel");
const editorTitle = document.getElementById("editor-title");
const titleHelp = document.getElementById("title-help");
const coverPreviewContainer = document.getElementById("cover-preview-container");
const coverPreview = document.getElementById("cover-preview");
const tagSuggestions = document.getElementById("tag-suggestions");
const tagInputHelp = document.getElementById("tag-input-help");

let isEditMode = false;
let postId = null;
let allTags = []; // Store all fetched tags for autocomplete
let selectedTags = []; // Currently selected tags

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "/client/pages/login.html";
    return;
  }

  renderNavbar(navbarRoot);
  await loadAllTags(); // Load tags for autocomplete
  setupEventListeners();

  // Check if we're in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  postId = urlParams.get("id");

  if (postId) {
    isEditMode = true;
    editorTitle.textContent = "Edit Post";
    await loadPostForEdit();
  } else {
    isEditMode = false;
    editorTitle.textContent = "Create New Post";
    // Set default status to draft
    editorStatusSelect.value = "draft";
    initializePreview();
  }
}

async function loadAllTags() {
  try {
    const response = await getTags();
    allTags = response.data || [];
  } catch (error) {
    console.warn("Failed to load tags for autocomplete:", error);
    // Continue without tag suggestions
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

  editorCancelBtn.addEventListener("click", () => {
    if (isEditMode) {
      window.location.href = "/client/pages/dashboard.html";
    } else {
      // Ask for confirmation if there's content
      if (editorTitleInput.value.trim() || editorContent.value.trim()) {
        if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
          window.location.href = "/client/pages/dashboard.html";
        }
      } else {
        window.location.href = "/client/pages/dashboard.html";
      }
    }
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

    // Update title help visibility
    if (editorTitleInput.value.trim()) {
      titleHelp.style.opacity = "0.5";
    } else {
      titleHelp.style.opacity = "1";
    }

    // Update tag input help visibility
    if (editorTagsInput.value.trim()) {
      tagInputHelp.style.opacity = "0.5";
    } else {
      tagInputHelp.style.opacity = "1";
    }
  });

  editorTagsInput.addEventListener("input", handleTagInput);
  editorTagsInput.addEventListener("keydown", handleTagKeydown);

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!editorTagsInput.contains(e.target) && !tagSuggestions.contains(e.target)) {
      hideTagSuggestions();
    }
  });

  // Cover image preview
  editorCoverInput.addEventListener("change", () => {
    const url = editorCoverInput.value.trim();
    if (url) {
      coverPreview.src = url;
      coverPreviewContainer.classList.remove("hidden");
      coverPreview.onerror = () => {
        coverPreview.src = ""; // Break the image link on error
        coverPreviewContainer.classList.add("hidden");
        showErrorToast("Invalid image URL", "error");
      };
    } else {
      coverPreviewContainer.classList.add("hidden");
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

    // Show cover image preview if exists
    if (post.coverImage) {
      coverPreview.src = post.coverImage;
      coverPreviewContainer.classList.remove("hidden");
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
    tags: selectedTags.map(tag => ({ name: tag })), // Convert to expected format
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
      // Redirect to post view
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

// Tag autocomplete functionality
function handleTagInput(e) {
  const inputValue = e.target.value.trim();

  if (!inputValue) {
    hideTagSuggestions();
    return;
  }

  // Get the last tag being typed (after last comma)
  const tags = inputValue.split(",");
  const currentTag = tags[tags.length - 1].trim();

  if (!currentTag) {
    hideTagSuggestions();
    return;
  }

  // Filter tags that match the current input
  const matchingTags = allTags
    .map(tag => tag.name)
    .filter(tag =>
      tag.toLowerCase().includes(currentTag.toLowerCase()) &&
      !selectedTags.includes(tag)
    )
    .slice(0, 10); // Limit to 10 suggestions

  if (matchingTags.length > 0) {
    showTagSuggestions(matchingTags, currentTag);
  } else {
    hideTagSuggestions();
  }
}

function handleTagKeydown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addTagFromInput();
  } else if (e.key === ",") {
    e.preventDefault();
    addTagFromInput();
  } else if (e.key === "Backspace") {
    const inputValue = editorTagsInput.value.trim();
    if (!inputValue && selectedTags.length > 0) {
      // Remove last tag if backspace on empty input
      removeTag(selectedTags.length - 1);
    }
  }
}

function addTagFromInput() {
  const inputValue = editorTagsInput.value.trim();
  if (!inputValue) return;

  // Split by comma and process each tag
  const tags = inputValue.split(",").map(tag => tag.trim()).filter(tag => tag);

  tags.forEach(tag => {
    // Check if tag already exists (case-insensitive)
    const exists = selectedTags.some(selectedTag =>
      selectedTag.toLowerCase() === tag.toLowerCase()
    );

    if (!exists && tag) {
      selectedTags.push(tag);
    }
  });

  // Update UI
  updateTagDisplay();
  editorTagsInput.value = "";
  hideTagSuggestions();
}

function removeTag(index) {
  selectedTags.splice(index, 1);
  updateTagDisplay();
}

function showTagSuggestions(matchingTags, currentTag) {
  // Position the suggestions box below the input
  const rect = editorTagsInput.getBoundingClientRect();
  tagSuggestions.style.top = `${rect.bottom + window.scrollY}px`;
  tagSuggestions.style.left = `${rect.left + window.scrollX}px`;
  tagSuggestions.style.width = `${rect.width}px`;

  // Clear and populate suggestions
  tagSuggestions.innerHTML = "";
  matchingTags.forEach(tag => {
    const suggestionDiv = document.createElement("div");
    suggestionDiv.className = "tag-suggestion";
    suggestionDiv.textContent = tag;

    // Highlight the matching part
    const lowerTag = tag.toLowerCase();
    const lowerCurrent = currentTag.toLowerCase();
    const startIndex = lowerTag.indexOf(lowerCurrent);

    if (startIndex >= 0) {
      const beforeMatch = tag.substring(0, startIndex);
      const matchText = tag.substring(startIndex, startIndex + currentTag.length);
      const afterMatch = tag.substring(startIndex + currentTag.length);

      suggestionDiv.innerHTML = `${beforeMatch}<strong>${matchText}</strong>${afterMatch}`;
    }

    suggestionDiv.addEventListener("click", () => {
      // Add the tag to selected tags
      const inputValue = editorTagsInput.value.trim();
      const tags = inputValue.split(",");
      tags[tags.length - 1] = tag; // Replace current tag with selected suggestion

      // Reconstruct the input value
      editorTagsInput.value = tags.filter(t => t.trim()).join(", ") + ", ";

      // Add the tag
      addTagFromInput();
    });

    tagSuggestions.appendChild(suggestionDiv);
  });

  tagSuggestions.classList.remove("hidden");
}

function hideTagSuggestions() {
  tagSuggestions.classList.add("hidden");
}

function updateTagDisplay() {
  // Update the visual tag display (we'll implement this as chips)
  // For now, just update the input with selected tags
  editorTagsInput.value = selectedTags.join(", ");

  // Update help text visibility
  if (selectedTags.length > 0) {
    tagInputHelp.style.opacity = "0.5";
  } else {
    tagInputHelp.style.opacity = "1";
  }
}

// Initialize editor on load
init();