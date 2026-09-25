export function formatDate(dateString) {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    } catch (error) {
        return dateString;
    }
}

export function truncateText(text, maxLength = 150) {
    if (!text) return "";

    const stripped = text
        .replace(/[#*_`~\[\]()]/g, "")
        .replace(/\n+/g, " ")
        .trim();

    if (stripped.length <= maxLength) {
        return stripped;
    }

    return stripped.slice(0, maxLength).trim() + "...";
}
