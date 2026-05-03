import re

# Keywords that indicate a line is worth keeping
_KEYWORDS = re.compile(
    r"error|failed|failure|exception|traceback|exit\s*code"
    r"|not\s*found|timeout|conflict|permission\s*denied|warning"
    r"|cannot|unable|invalid|missing|undefined|rejected",
    re.IGNORECASE,
)

# Lines that are just timestamps, progress bars, or whitespace
_NOISE = re.compile(
    r"^[\s\d:.T\-Z]+$"           # timestamp-only lines
    r"|[█▓▒░#=\-]{5,}"           # progress bars
    r"|^\s*\d+%"                  # percentage-only lines
    r"|^\s*$",                    # blank lines
    re.MULTILINE,
)


def clean_log(raw_log: str) -> str:
    """Keep only lines that contain relevant error/warning keywords.

    Strips timestamp-only lines, progress bars, and blank lines.
    Returns the filtered text as a single string.
    """
    kept: list[str] = []
    for line in raw_log.splitlines():
        # Skip noisy / empty lines
        if _NOISE.fullmatch(line):
            continue
        # Keep lines that match at least one keyword
        if _KEYWORDS.search(line):
            kept.append(line)
    return "\n".join(kept)


def chunk_log(clean_log: str, max_chars: int = 8000) -> list[str]:
    """Split cleaned log text into chunks of at most *max_chars* characters.

    Splits only at newline boundaries — lines are never cut in half.
    """
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for line in clean_log.splitlines():
        line_len = len(line) + 1  # +1 for the newline we'll add back
        if current and current_len + line_len > max_chars:
            chunks.append("\n".join(current))
            current = []
            current_len = 0
        current.append(line)
        current_len += line_len

    if current:
        chunks.append("\n".join(current))

    return chunks


def summarize_chunks(chunks: list[str]) -> str:
    """Merge chunks into a single string for downstream processing.

    - 1 chunk  → returned as-is.
    - 2-3 chunks → joined with a section-break separator.
    - 4+ chunks → only the first 3 are used; the rest are discarded.
    """
    if not chunks:
        return ""
    if len(chunks) == 1:
        return chunks[0]
    return "\n--- SECTION BREAK ---\n".join(chunks[:3])
