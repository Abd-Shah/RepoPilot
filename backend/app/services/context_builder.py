def estimate_tokens(text: str) -> int:
    # Good enough for budgeting without provider-specific tokenizer dependencies.
    return max(1, len(text) // 4)


def build_context(ranked_chunks: list[dict], max_tokens: int = 6000) -> list[dict]:
    selected: list[dict] = []
    current = 0
    seen_files: dict[str, int] = {}

    for chunk in ranked_chunks:
        token_count = estimate_tokens(chunk["content"])
        if token_count > max_tokens * 0.45:
            continue
        # Avoid one file monopolizing the context.
        if seen_files.get(chunk["file_path"], 0) >= 4:
            continue
        if current + token_count > max_tokens:
            continue
        selected.append(chunk)
        current += token_count
        seen_files[chunk["file_path"]] = seen_files.get(chunk["file_path"], 0) + 1
    return selected
