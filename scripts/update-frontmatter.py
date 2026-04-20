#!/usr/bin/env python3
"""
Batch-update SKILL.md frontmatter to include layer and canonical-owner-of fields.
Only modifies YAML frontmatter between --- delimiters. Does NOT touch content below.
"""

import os
import re
import yaml

BASE_DIR = "/Users/apple/.agentskills"

# Layer mapping from the user's specification
LAYER_MAP = {
    "01": "kernel",
    "02": "product-compiler",
    "03": "product-compiler",
    "04": "product-compiler",
    "05": "product-compiler",
    "06": "product-compiler",
    "07": "product-compiler",
    "08": "product-compiler",
    "09": "product-compiler",
    "10": "product-compiler",
    "11": "product-compiler",
    "12": "product-compiler",
    "13": "capability-pack",
    "14": "capability-pack",
    "15": "capability-pack",
    "16": "capability-pack",
    "17": "capability-pack",
    "18": "capability-pack",
    "19": "capability-pack",
    "20": "capability-pack",
    "21": "product-compiler",
    "22": "capability-pack",
    "23": "capability-pack",
    "24": "capability-pack",
    "25": "product-compiler",
    "26": "capability-pack",
    "27": "capability-pack",
    "28": "capability-pack",
    "29": "capability-pack",
    "30": "product-compiler",
    "31": "capability-pack",
    "32": "capability-pack",
    "33": "capability-pack",
    "34": "capability-pack",
    "35": "capability-pack",
    "36": "capability-pack",
    "37": "capability-pack",
    "38": "capability-pack",
    "39": "capability-pack",
    "40": "capability-pack",
    "41": "capability-pack",
    "42": "capability-pack",
    "43": "capability-pack",
    "44": "capability-pack",
    "45": "capability-pack",
    "46": "capability-pack",
    "47": "capability-pack",
    "48": "capability-pack",
    "49": "capability-pack",
    "50": "capability-pack",
    "51": "capability-pack",
    "52": "capability-pack",
    "53": "product-compiler",
    "54": "capability-pack",
    "55": "capability-pack",
    "56": "release-pipeline",
    "57": "capability-pack",
    "gh-fix-ci": "capability-pack",
}

# Canonical ownership derived from "What This Skill Owns" sections and target-architecture.md
CANONICAL_OWNERSHIP = {
    "01": [
        "supreme-policy-and-autonomy",
        "one-line-prompt-interpretation",
        "emphasis-signal-processing",
        "prompt-re-synthesis",
        "cross-skill-coordination",
        "done-definitions",
        "conflict-resolution",
    ],
    "02": [
        "project-thesis",
        "product-type-inference",
        "target-user-identification",
        "business-model-inference",
        "brief-evolution",
    ],
    "03": [
        "web-research-and-evidence",
        "technology-evaluation",
        "implementation-planning",
        "work-decomposition",
        "assumption-tracking",
    ],
    "04": [
        "voice-of-the-customer",
        "user-preference-capture",
        "preference-confidence-levels",
        "preference-scoping",
    ],
    "05": [
        "platform-selection",
        "architecture-patterns",
        "cloudflare-decision-trees",
        "auth-architecture",
        "data-architecture",
    ],
    "06": [
        "vertical-slice-planning",
        "anti-placeholder-enforcement",
        "implementation-standards",
        "content-generation-rules",
    ],
    "07": [
        "zero-recommendations-gate",
        "quality-gate-7-checks",
        "verification-pyramid",
        "form-testing-matrix",
        "visual-inspection-protocol",
    ],
    "08": [
        "deploy-and-verify-loop",
        "cache-purge-strategy",
        "production-verification",
        "rollback-decisions",
        "wrangler-configuration",
    ],
    "09": [
        "brand-extraction",
        "copy-system-and-tone",
        "trust-surfaces",
        "legal-pages",
        "information-architecture",
    ],
    "10": [
        "typography-system",
        "color-system",
        "layout-patterns",
        "component-design",
        "anti-slop-enforcement",
    ],
    "11": [
        "transition-grammar",
        "scroll-driven-animation",
        "page-transitions",
        "hover-focus-active-states",
        "reduced-motion-handling",
        "motion-hierarchy",
    ],
    "12": [
        "image-generation-pipeline",
        "video-generation-pipeline",
        "logo-and-icon-systems",
        "social-preview-images",
        "media-critique-loops",
    ],
    "13": [
        "analytics-instrumentation",
        "error-tracking-setup",
        "growth-surfaces",
        "experimentation-framework",
    ],
    "14": [
        "autonomous-improvement-proposals",
        "idea-evaluation-and-rejection",
        "evidence-backed-research",
    ],
    "15": [
        "easter-egg-implementation",
        "hidden-delight-features",
        "qr-code-flyer-generation",
    ],
    "16": [
        "domain-provisioning",
        "animated-placeholder-pages",
        "dns-ssl-automation",
    ],
    "17": [
        "competitor-feature-extraction",
        "pricing-analysis",
        "design-pattern-analysis",
    ],
    "18": [
        "stripe-product-creation",
        "checkout-flow",
        "donation-presets",
        "subscription-management",
    ],
    "19": [
        "transactional-email-templates",
        "email-dark-mode-support",
        "resend-delivery-patterns",
    ],
    "20": [
        "wcag-aa-audit",
        "focus-styling",
        "aria-landmarks",
        "axe-core-integration",
    ],
    "21": [
        "core-web-vitals",
        "bundle-size-budgets",
        "image-optimization-pipeline",
        "lazy-loading-strategy",
        "font-loading-strategy",
        "code-splitting-decisions",
    ],
    "22": [
        "content-security-policy",
        "owasp-top-10-prevention",
        "turnstile-captcha-integration",
        "rate-limiting-implementation",
        "secret-rotation-policy",
    ],
    "23": [
        "ga4-configuration",
        "gtm-container-setup",
        "posthog-sdk-integration",
        "feature-flag-management",
        "event-taxonomy",
        "session-recording-config",
    ],
    "24": [
        "pwa-manifest",
        "sitemap-xml",
        "robots-txt",
        "web-metadata-files",
        "opensearch-xml",
    ],
    "25": [
        "hono-rpc-mode",
        "error-envelope-format",
        "api-rate-limiting",
        "openapi-spec-generation",
        "api-versioning",
        "api-documentation",
    ],
    "26": [
        "shared-api-key-pool",
        "secret-discovery",
        "cross-project-service-integration",
    ],
    "27": [
        "social-media-automation",
        "postiz-integration",
        "platform-specific-copy",
    ],
    "28": [
        "keyphrase-research",
        "on-page-seo-checks",
        "programmatic-seo",
        "internal-linking-strategy",
        "schema-structured-data",
    ],
    "29": [
        "readme-template",
        "claude-md-standards",
        "code-comment-hygiene",
        "jsdoc-documentation",
        "stale-code-removal",
    ],
    "30": [
        "ai-native-coding-patterns",
        "documentation-as-code",
        "ai-optimized-file-structure",
        "context-window-management",
    ],
    "31": [
        "custom-error-pages",
        "branded-404-500-503",
        "offline-pwa-page",
    ],
    "32": [
        "contact-form-implementation",
        "form-validation-patterns",
        "form-test-matrix",
    ],
    "33": [
        "blog-system",
        "markdown-rendering",
        "rss-feed",
        "seo-driven-content",
    ],
    "34": [
        "launch-day-checklist",
        "sitemap-submission",
        "go-live-verification",
    ],
    "35": [
        "github-actions-pipeline",
        "branch-preview-deploys",
        "ci-playwright-integration",
    ],
    "36": [
        "onboarding-flows",
        "guided-tour",
        "activation-tracking",
    ],
    "37": [
        "ai-search-implementation",
        "search-indexing-strategy",
        "cmd-k-search-ui",
        "mcp-search-endpoint",
    ],
    "38": [
        "health-endpoints",
        "uptime-monitoring-setup",
        "status-page",
    ],
    "39": [
        "changelog-generation",
        "semantic-versioning",
        "github-releases",
    ],
    "40": [
        "backup-automation",
        "disaster-recovery-runbook",
        "infrastructure-restore",
    ],
    "41": [
        "feedback-widget",
        "nps-surveys",
        "testimonial-collection",
    ],
    "42": [
        "i18n-implementation",
        "translation-pipeline",
        "hreflang-tags",
        "rtl-support",
    ],
    "43": [
        "ai-chat-implementation",
        "rag-chat-widget",
        "vectorize-auto-indexing",
    ],
    "44": [
        "drizzle-orm-patterns",
        "database-migrations",
        "schema-conventions",
    ],
    "45": [
        "webhook-signature-verification",
        "event-routing",
        "idempotency-dedup",
        "outbound-webhook-dispatch",
    ],
    "46": [
        "admin-dashboard",
        "content-moderation-ui",
        "bolt-diy-editor-integration",
    ],
    "47": [
        "command-palette",
        "keyboard-shortcuts",
        "keyboard-first-navigation",
    ],
    "48": [
        "empty-state-patterns",
        "skeleton-screens",
        "first-action-prompts",
    ],
    "49": [
        "push-notifications",
        "in-app-notification-bell",
        "notification-preferences",
    ],
    "50": [
        "coolify-api-interaction",
        "docker-service-deployment",
        "self-hosted-orchestration",
    ],
    "51": [
        "behavioral-psychology-patterns",
        "ethical-persuasion",
        "design-psychology",
        "wisdom-informed-copy",
    ],
    "52": [
        "mcp-server-discovery",
        "cloud-service-integration",
        "ai-api-usage-strategy",
        "cross-service-orchestration",
    ],
    "53": [
        "parallel-agent-spawning",
        "self-healing-decision-trees",
        "task-graph-decomposition",
        "autonomous-decision-policy",
    ],
    "54": [
        "computer-use-decision-making",
        "native-macos-app-control",
        "visual-qa-beyond-playwright",
        "cross-app-orchestration",
    ],
    "55": [
        "browser-tool-selection",
        "playwright-e2e-workflows",
        "web-scraping-extraction",
        "chrome-devtools-profiling",
    ],
    "56": [
        "feature-completeness-engine",
        "visual-convergence-loop",
        "done-detection",
    ],
    "57": [
        "visual-tdd-loop",
        "gpt-4o-vision-analysis",
        "workers-ai-edge-inference",
        "rag-embedding-pipelines",
        "ai-cost-optimization",
    ],
    "gh-fix-ci": [
        "github-actions-debugging",
        "ci-failure-diagnosis",
        "pr-check-inspection",
    ],
}


def extract_skill_id(dirname):
    """Extract the skill ID from a directory name like '01-operating-system' or 'gh-fix-ci'."""
    match = re.match(r'^(\d+)-', dirname)
    if match:
        return match.group(1)
    # Non-numeric prefix (like gh-fix-ci)
    return dirname


def parse_frontmatter(content):
    """Parse YAML frontmatter from a markdown file. Returns (frontmatter_dict, rest_of_content)."""
    if not content.startswith('---'):
        return None, content

    # Find the closing ---
    end_match = re.search(r'\n---\s*\n', content[3:])
    if not end_match:
        # Try end of file
        end_match = re.search(r'\n---\s*$', content[3:])
        if not end_match:
            return None, content

    fm_text = content[4:3 + end_match.start()]
    rest = content[3 + end_match.end():]

    try:
        fm = yaml.safe_load(fm_text)
        if not isinstance(fm, dict):
            return None, content
        return fm, rest
    except yaml.YAMLError:
        return None, content


def serialize_frontmatter(fm):
    """Serialize frontmatter dict back to YAML string between --- delimiters."""
    # Custom ordering: name, description, layer, canonical-owner-of, then rest
    ordered_keys = ['name', 'description', 'layer', 'canonical-owner-of']
    other_keys = [k for k in fm if k not in ordered_keys]

    lines = ['---']
    for key in ordered_keys:
        if key in fm:
            val = fm[key]
            if key == 'canonical-owner-of' and isinstance(val, list):
                lines.append(f'{key}:')
                for item in val:
                    lines.append(f'  - "{item}"')
            elif isinstance(val, str) and ('"' in val or ':' in val or '#' in val or '\n' in val or val.startswith('{') or val.startswith('[')):
                # Use double quotes for strings that need escaping
                escaped = val.replace('\\', '\\\\').replace('"', '\\"')
                lines.append(f'{key}: "{escaped}"')
            elif isinstance(val, str):
                lines.append(f'{key}: "{val}"')
            elif isinstance(val, bool):
                lines.append(f'{key}: {"true" if val else "false"}')
            else:
                lines.append(f'{key}: {val}')

    for key in other_keys:
        val = fm[key]
        if isinstance(val, str) and ('"' in val or ':' in val or '#' in val or '\n' in val or val.startswith('{') or val.startswith('[')):
            escaped = val.replace('\\', '\\\\').replace('"', '\\"')
            lines.append(f'{key}: "{escaped}"')
        elif isinstance(val, str):
            lines.append(f'{key}: "{val}"')
        elif isinstance(val, bool):
            lines.append(f'{key}: {"true" if val else "false"}')
        elif isinstance(val, list):
            lines.append(f'{key}:')
            for item in val:
                if isinstance(item, str):
                    lines.append(f'  - "{item}"')
                else:
                    lines.append(f'  - {item}')
        else:
            lines.append(f'{key}: {val}')

    lines.append('---')
    return '\n'.join(lines)


def process_skill_file(filepath, skill_id):
    """Process a single SKILL.md file, adding layer and canonical-owner-of if missing."""
    with open(filepath, 'r') as f:
        content = f.read()

    fm, rest = parse_frontmatter(content)
    if fm is None:
        print(f"  SKIP (no valid frontmatter): {filepath}")
        return False

    modified = False

    # Add layer if missing
    if 'layer' not in fm:
        layer = LAYER_MAP.get(skill_id)
        if layer:
            fm['layer'] = layer
            modified = True
            print(f"  + layer: {layer}")
        else:
            print(f"  WARN: no layer mapping for skill ID '{skill_id}'")

    # Add canonical-owner-of if missing
    if 'canonical-owner-of' not in fm:
        ownership = CANONICAL_OWNERSHIP.get(skill_id)
        if ownership:
            fm['canonical-owner-of'] = ownership
            modified = True
            print(f"  + canonical-owner-of: {len(ownership)} concepts")
        else:
            print(f"  WARN: no ownership data for skill ID '{skill_id}'")

    if not modified:
        print(f"  SKIP (already has layer + canonical-owner-of): {filepath}")
        return False

    # Write back
    new_content = serialize_frontmatter(fm) + '\n' + rest
    with open(filepath, 'w') as f:
        f.write(new_content)

    return True


def main():
    updated = 0
    skipped = 0
    errors = 0

    # Find all SKILL.md files
    for entry in sorted(os.listdir(BASE_DIR)):
        skill_dir = os.path.join(BASE_DIR, entry)
        skill_file = os.path.join(skill_dir, 'SKILL.md')

        if not os.path.isdir(skill_dir) or not os.path.isfile(skill_file):
            continue

        skill_id = extract_skill_id(entry)
        print(f"\nProcessing: {entry} (id={skill_id})")

        try:
            if process_skill_file(skill_file, skill_id):
                updated += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            errors += 1

    print(f"\n{'='*60}")
    print(f"Done. Updated: {updated}, Skipped: {skipped}, Errors: {errors}")


if __name__ == '__main__':
    main()
