```markdown
# generalist-agent Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `generalist-agent` TypeScript repository. It covers file organization, code style, import/export patterns, and testing approaches. By following these guidelines, contributors can write consistent, maintainable, and idiomatic code for this project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myModule.ts`, `userAgent.ts`

### Import Style
- Use **relative imports** for referencing other modules within the project.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // utils.ts
    export function helper() { ... }

    // usage
    import { helper } from './utils';
    ```

### Commit Messages
- Freeform, with no strict prefixing.
- Average commit message length: ~44 characters.

## Workflows

_No explicit workflows detected in the repository._

## Testing Patterns

- **Framework:** Not explicitly detected.
- **File Pattern:** Test files are named with the pattern `*.test.*`.
  - Example: `userAgent.test.ts`
- Tests are typically colocated with the code they test or in a parallel directory.

### Example Test File
```typescript
// userAgent.test.ts
import { userAgent } from './userAgent';

describe('userAgent', () => {
  it('should return the correct agent', () => {
    expect(userAgent()).toBe('expectedAgent');
  });
});
```

## Commands
| Command | Purpose |
|---------|---------|
| /run-tests | Run all test files matching `*.test.*` |
| /format-code | Format code according to project conventions |
| /list-modules | List all modules in camelCase naming |
```