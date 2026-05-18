import { describe, expect, it } from 'vitest';

import ciWorkflow from '../../.github/workflows/ci.yml?raw';

const workflowNameValues = ciWorkflow
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.startsWith('name: '))
  .map((line) => line.slice('name: '.length));

describe('CI workflow policy and required-check names', () => {
  it('uses pull_request trigger and avoids pull_request_target', () => {
    expect(ciWorkflow).toContain('pull_request:');
    expect(ciWorkflow).not.toContain('pull_request_target:');
  });

  it('keeps the lint/unit required check name stable', () => {
    expect(workflowNameValues).toContain('Lint + typecheck + unit tests');
  });

  it('keeps the fan-in required check name stable', () => {
    expect(ciWorkflow).toContain('e2e-complete:');
    expect(workflowNameValues).toContain('Playwright E2E complete');
  });

  it('does not include obsolete shard-era check names', () => {
    expect(workflowNameValues).not.toContain('Playwright E2E (shard 1/2)');
    expect(workflowNameValues).not.toContain('Playwright E2E (shard 2/2)');
    expect(workflowNameValues).not.toContain('Playwright E2E (shard 1/4)');
    expect(workflowNameValues).not.toContain('Playwright E2E (shard 2/4)');
    expect(workflowNameValues).not.toContain('Playwright E2E (shard 3/4)');
    expect(workflowNameValues).not.toContain('Playwright E2E (shard 4/4)');
  });

  it('uses PR-number concurrency keys for pull_request runs', () => {
    expect(ciWorkflow).toContain("github.event_name == 'pull_request'");
    expect(ciWorkflow).toContain("format('ci-pr-{0}', github.event.pull_request.number)");
    expect(ciWorkflow).not.toContain("github.event_name == 'pull_request_target'");
  });
});
