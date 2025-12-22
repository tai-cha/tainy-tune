# Rule: Artifact Maintenance

To maintain a reliable source of truth for the project state, you MUST update the following artifacts in the `.agent/` directory whenever relevant work is completed.

## 1. Roadmap (`.agent/roadmap.md`)
*   **When to update**: immediately after finishing a Phase or a major feature within a Phase.
*   **Action**: 
    *   Mark completed items with `[x]`.
    *   Update the "Current Status" or move active tasks if necessary.

## 2. Walkthrough (`.agent/walkthrough.md`)
*   **When to update**: after implementing a new feature or changing functionality.
*   **Action**: 
    *   Add or update the corresponding section to reflect the *current* system behavior.
    *   Keep it as a "comprehensive system guide," not just a diff log.

**Goal**: These files should always reflect the latest state of the main branch, allowing anyone (or any agent) to understand the project status and features by reading just these two files.
