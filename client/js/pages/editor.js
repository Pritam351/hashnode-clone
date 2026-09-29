import { isAuthenticated } from "../utils/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { createErrorMessage } from "../components/errorMessage.js";
import { getMyPostById, createPost, updatePost } from "../api/postApi.js";
import { renderMarkdown, initCodeBlockActions } from "../utils/markdown.js";
import { getTags } from "../api/tagApi.js";

const navbarRoot = document.getElementById("navbar-root");
const editorMessage = document.getElementById("editor-message");
const editorForm = document.getElementById("editor-form");
const editorTitleInput = document.getElementById("editor-title-input");
const editorCoverInput = document.getElementById("editor-cover-input");
const editorTagsInput = document.getElementById("editor-tags-input");
const editorContent = document.getElementById("editor-content");
const editorPreviewToggle = document.getElementById("editor-preview-toggle");
const editorPreviewContainer = document.getElementById("editor-preview-container");
const editorPreview = document.getElementById("editor-preview");
const editorSaveDraftBtn = document.getElementById("editor-save-draft");
const editorPublishBtn = document.getElementById("editor-publish");
const editorTitle = document.getElementById("editor-title");
const titleHelp = document.getElementById("title-help");
const coverPreviewContainer = document.getElementById("cover-preview-container");
const coverPreview = document.getElementById("cover-preview");
const tagSuggestions = document.getElementById("tag-suggestions");
const tagInputHelp = document.getElementById("tag-input-help");

let isEditMode = false;
let postId = null;
let postStatus = "draft";
let allTags = [];
let selectedTags = [];
let loadedPostTags = [];
let isSubmitting = false;

function showMessage(message, type = "error", title = "") {
  if (!editorMessage) return;
  editorMessage.innerHTML = "";

  if (type === "error") {
    const errorEl = createErrorMessage(message, title || "Error");
    editorMessage.appendChild(errorEl);
  } else {
    const successEl = document.createElement("div");
    successEl.className = "editor-alert editor-alert--success";
    successEl.setAttribute("role", "status");
    successEl.textContent = message;
    editorMessage.appendChild(successEl);
  }

  editorMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearMessage() {
  if (editorMessage) {
    editorMessage.innerHTML = "";
  }
}

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "/client/pages/login.html";
    return;
  }

  renderNavbar(navbarRoot);
  await loadAllTags();
  setupEventListeners();

  const urlParams = new URLSearchParams(window.location.search);
  postId = urlParams.get("id");

  if (postId) {
    isEditMode = true;
    if (editorTitle) editorTitle.textContent = "Edit Post";
    if (editorPublishBtn) editorPublishBtn.textContent = "Update & Publish";
    if (editorSaveDraftBtn) editorSaveDraftBtn.textContent = "Update Draft";
    await loadPostForEdit();
  } else {
    isEditMode = false;
    if (editorTitle) editorTitle.textContent = "New Post";
    if (editorPublishBtn) editorPublishBtn.textContent = "Publish";
    if (editorSaveDraftBtn) editorSaveDraftBtn.textContent = "Save as Draft";
    postStatus = "draft";
    initializePreview();
  }
}

async function loadAllTags() {
  try {
    const response = await getTags();
    allTags = response.tags || [];
  } catch (error) {
    console.warn("Failed to load tags for autocomplete:", error);
  }
}

function setupEventListeners() {
  editorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  editorSaveDraftBtn.addEventListener("click", () => {
    postStatus = "draft";
    handleFormSubmit();
  });

  editorPublishBtn.addEventListener("click", () => {
    postStatus = "published";
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

  editorTitleInput.addEventListener("input", () => {
    if (titleHelp) {
      titleHelp.style.opacity = editorTitleInput.value.trim() ? "0.5" : "1";
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
  editorCoverInput.addEventListener("input", handleCoverImageChange);
  editorCoverInput.addEventListener("change", handleCoverImageChange);
}

function handleCoverImageChange() {
  const url = editorCoverInput.value.trim();
  if (url) {
    coverPreview.src = url;
    coverPreviewContainer.classList.remove("hidden");
    coverPreview.onerror = () => {
      coverPreview.src = "";
      coverPreviewContainer.classList.add("hidden");
      showMessage("Invalid cover image URL", "error", "Image Error");
    };
    coverPreview.onload = () => {
      clearMessage();
    };
  } else {
    coverPreviewContainer.classList.add("hidden");
    coverPreview.src = "";
  }
}

function initializePreview() {
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
  if (content && content.trim()) {
    editorPreview.innerHTML = renderMarkdown(content);
    initCodeBlockActions(editorPreview);
  } else {
    editorPreview.innerHTML = "<p>Start writing to see a preview...</p>";
  }
}

async function loadPostForEdit() {
  try {
    setFormDisabled(true);
    const response = await getMyPostById(postId);
    const post = response.post;

    if (!post) {
      throw new Error("Post not found");
    }

    editorTitleInput.value = post.title || "";
    editorCoverInput.value = post.coverImage || "";

    loadedPostTags = post.tags || [];
    selectedTags = loadedPostTags.map((t) => (typeof t === "object" ? t.name : t));
    editorTagsInput.value = selectedTags.join(", ");

    postStatus = post.status || "draft";
    editorContent.value = post.content || "";

    if (editorPreviewToggle.checked) {
      updatePreview();
    }

    if (post.coverImage) {
      coverPreview.src = post.coverImage;
      coverPreviewContainer.classList.remove("hidden");
    }

    setFormDisabled(false);
  } catch (error) {
    setFormDisabled(false);
    showMessage(
      "Failed to load post. It may have been deleted or you don't have permission.",
      "error",
      "Post Loading Error"
    );
    setTimeout(() => {
      window.location.href = "/client/pages/dashboard.html";
    }, 2000);
  }
}

function setFormDisabled(disabled) {
  editorTitleInput.disabled = disabled;
  editorCoverInput.disabled = disabled;
  editorTagsInput.disabled = disabled;
  editorContent.disabled = disabled;
  editorSaveDraftBtn.disabled = disabled;
  editorPublishBtn.disabled = disabled;
}

function setSubmittingState(submitting, status) {
  isSubmitting = submitting;
  editorSaveDraftBtn.disabled = submitting;
  editorPublishBtn.disabled = submitting;

  if (submitting) {
    if (status === "published") {
      editorPublishBtn.dataset.originalText = editorPublishBtn.textContent;
      editorPublishBtn.textContent = isEditMode ? "Updating..." : "Publishing...";
    } else {
      editorSaveDraftBtn.dataset.originalText = editorSaveDraftBtn.textContent;
      editorSaveDraftBtn.textContent = isEditMode ? "Updating Draft..." : "Saving Draft...";
    }
  } else {
    editorPublishBtn.textContent =
      editorPublishBtn.dataset.originalText || (isEditMode ? "Update & Publish" : "Publish");
    editorSaveDraftBtn.textContent =
      editorSaveDraftBtn.dataset.originalText || (isEditMode ? "Update Draft" : "Save as Draft");
  }
}

async function handleFormSubmit() {
  if (isSubmitting) return;

  clearMessage();

  const title = editorTitleInput.value.trim();
  if (!title) {
    showMessage("Title is required and cannot be empty or whitespace.", "error", "Validation Error");
    editorTitleInput.focus();
    return;
  }

  const rawContent = editorContent.value;
  if (!rawContent || !rawContent.trim()) {
    showMessage("Content is required and cannot be empty or whitespace.", "error", "Validation Error");
    editorContent.focus();
    return;
  }

  // Parse current tags from input
  const currentTagsFromInput = editorTagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const combinedTagNames = Array.from(new Set([...selectedTags, ...currentTagsFromInput]));

  let tagIds = [];
  if (combinedTagNames.length > 0) {
    tagIds = combinedTagNames
      .map((tagName) => {
        const loadedTag = loadedPostTags.find(
          (t) =>
            (t.name && t.name.toLowerCase() === tagName.toLowerCase()) ||
            (t.slug && t.slug.toLowerCase() === tagName.toLowerCase())
        );
        if (loadedTag && loadedTag._id) return loadedTag._id;

        const availableTag = allTags.find(
          (t) =>
            (t.name && t.name.toLowerCase() === tagName.toLowerCase()) ||
            (t.slug && t.slug.toLowerCase() === tagName.toLowerCase())
        );
        return availableTag && availableTag._id ? availableTag._id : null;
      })
      .filter((id) => id !== null);
  }

  const postData = {
    title,
    content: rawContent, // Preserve raw Markdown formatting and newlines
    coverImage: editorCoverInput.value.trim() || "",
    tags: tagIds,
    status: postStatus
  };

  setSubmittingState(true, postStatus);

  try {
    if (isEditMode) {
      const response = await updatePost(postId, postData);
      showMessage(
        postStatus === "published"
          ? "Post updated and published successfully!"
          : "Draft updated successfully!",
        "success"
      );

      setTimeout(() => {
        if (postStatus === "published" && response?.post?.slug) {
          window.location.href = `/client/pages/post.html?slug=${response.post.slug}`;
        } else {
          window.location.href = "/client/pages/dashboard.html";
        }
      }, 1000);
    } else {
      const response = await createPost(postData);
      showMessage(
        postStatus === "published"
          ? "Post published successfully!"
          : "Draft saved successfully!",
        "success"
      );

      setTimeout(() => {
        if (postStatus === "published" && response?.post?.slug) {
          window.location.href = `/client/pages/post.html?slug=${response.post.slug}`;
        } else {
          window.location.href = "/client/pages/dashboard.html";
        }
      }, 1000);
    }
  } catch (error) {
    setSubmittingState(false, postStatus);
    console.error("[EDITOR] Error saving post:", error);
    let errorMessage = "Failed to save post";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    showMessage(errorMessage, "error", "Submission Failed");
  }
}

// Tag autocomplete functionality
function handleTagInput(e) {
  const inputValue = e.target.value;
  const parts = inputValue.split(",");
  const currentTag = parts[parts.length - 1].trim();

  selectedTags = parts
    .slice(0, parts.length - 1)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tagInputHelp) {
    tagInputHelp.style.opacity = inputValue.trim() ? "0.5" : "1";
  }

  if (!currentTag) {
    hideTagSuggestions();
    return;
  }

  const matchingTags = allTags
    .map((tag) => tag.name)
    .filter(
      (tagName) =>
        tagName.toLowerCase().includes(currentTag.toLowerCase()) &&
        !selectedTags.some((st) => st.toLowerCase() === tagName.toLowerCase())
    )
    .slice(0, 10);

  if (matchingTags.length > 0) {
    showTagSuggestions(matchingTags, currentTag);
  } else {
    hideTagSuggestions();
  }
}

function handleTagKeydown(e) {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addTagFromInput();
  } else if (e.key === "Backspace") {
    const inputValue = editorTagsInput.value;
    if (!inputValue && selectedTags.length > 0) {
      removeTag(selectedTags.length - 1);
    }
  }
}

function addTagFromInput() {
  const inputValue = editorTagsInput.value.trim();
  if (!inputValue) return;

  const tags = inputValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  tags.forEach((tag) => {
    const exists = selectedTags.some(
      (selectedTag) => selectedTag.toLowerCase() === tag.toLowerCase()
    );

    if (!exists && tag) {
      selectedTags.push(tag);
    }
  });

  updateTagDisplay();
  hideTagSuggestions();
}

function removeTag(index) {
  selectedTags.splice(index, 1);
  updateTagDisplay();
}

function showTagSuggestions(matchingTags, currentTag) {
  tagSuggestions.innerHTML = "";
  matchingTags.forEach((tag) => {
    const suggestionDiv = document.createElement("div");
    suggestionDiv.className = "tag-suggestion";

    const lowerTag = tag.toLowerCase();
    const lowerCurrent = currentTag.toLowerCase();
    const startIndex = lowerTag.indexOf(lowerCurrent);

    if (startIndex >= 0) {
      const beforeMatch = tag.substring(0, startIndex);
      const matchText = tag.substring(startIndex, startIndex + currentTag.length);
      const afterMatch = tag.substring(startIndex + currentTag.length);

      suggestionDiv.innerHTML = `${beforeMatch}<strong>${matchText}</strong>${afterMatch}`;
    } else {
      suggestionDiv.textContent = tag;
    }

    suggestionDiv.addEventListener("click", () => {
      const inputValue = editorTagsInput.value;
      const parts = inputValue.split(",");
      parts[parts.length - 1] = tag;
      const cleaned = parts.map((t) => t.trim()).filter(Boolean);
      selectedTags = Array.from(new Set(cleaned));
      editorTagsInput.value = selectedTags.join(", ") + ", ";
      editorTagsInput.focus();
      hideTagSuggestions();
    });

    tagSuggestions.appendChild(suggestionDiv);
  });

  tagSuggestions.classList.remove("hidden");
}

function hideTagSuggestions() {
  tagSuggestions.classList.add("hidden");
}

function updateTagDisplay() {
  editorTagsInput.value = selectedTags.join(", ");
  if (tagInputHelp) {
    tagInputHelp.style.opacity = selectedTags.length > 0 ? "0.5" : "1";
  }
}

init();
