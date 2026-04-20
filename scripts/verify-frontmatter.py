#!/usr/bin/env python3
"""Verify all SKILL.md files have correct layer and canonical-owner-of."""

import os
import re

BASE_DIR = "/Users/apple/.agentskills"

LAYER_MAP = {
    "01": "kernel",
    "02": "product-compiler", "03": "product-compiler", "04": "product-compiler",
    "05": "product-compiler", "06": "product-compiler", "07": "product-compiler",
    "08": "product-compiler", "09": "product-compiler", "10": "product-compiler",
    "11": "product-compiler", "12": "product-compiler",
    "13": "capability-pack", "14": "capability-pack", "15": "capability-pack",
    "16": "capability-pack", "17": "capability-pack", "18": "capability-pack",
    "19": "capability-pack", "20": "capability-pack",
    "21": "product-compiler",
    "22": "capability-pack", "23": "capability-pack", "24": "capability-pack",
    "25": "product-compiler",
    "26": "capability-pack", "27": "capability-pack", "28": "capability-pack",
    "29": "capability-pack",
    "30": "product-compiler",
    "31": "capability-pack", "32": "capability-pack", "33": "capability-pack",
    "34": "capability-pack", "35": "capability-pack", "36": "capability-pack",
    "37": "capability-pack", "38": "capability-pack", "39": "capability-pack",
    "40": "capability-pack", "41": "capability-pack", "42": "capability-pack",
    "43": "capability-pack", "44": "capability-pack", "45": "capability-pack",
    "46": "capability-pack", "47": "capability-pack", "48": "capability-pack",
    "49": "capability-pack", "50": "capability-pack", "51": "capability-pack",
    "52": "capability-pack",
    "53": "product-compiler",
    "54": "capability-pack", "55": "capability-pack",
    "56": "release-pipeline",
    "57": "capability-pack",
    "gh-fix-ci": "capability-pack",
}

missing = []
wrong_layer = []
total = 0

for entry in sorted(os.listdir(BASE_DIR)):
    skill_file = os.path.join(BASE_DIR, entry, "SKILL.md")
    if not os.path.isfile(skill_file):
        continue

    total += 1

    with open(skill_file) as f:
        content = f.read()

    if not content.startswith("---"):
        missing.append((entry, "no frontmatter"))
        continue

    match = re.search(r"\n---", content[4:])
    if not match:
        missing.append((entry, "no closing ---"))
        continue

    fm = content[4:4 + match.start()]

    has_layer = bool(re.search(r"^layer:", fm, re.MULTILINE))
    has_owner = bool(re.search(r"^canonical-owner-of:", fm, re.MULTILINE))

    if not has_layer:
        missing.append((entry, "missing layer"))
    if not has_owner:
        missing.append((entry, "missing canonical-owner-of"))

    # Check layer value
    m = re.search(r'^layer:\s*["\']?([a-z-]+)', fm, re.MULTILINE)
    if m:
        skill_id_match = re.match(r"^(\d+)-", entry)
        sid = skill_id_match.group(1) if skill_id_match else entry
        expected = LAYER_MAP.get(sid)
        actual = m.group(1)
        if expected and actual != expected:
            wrong_layer.append((entry, actual, expected))

if missing:
    print("MISSING FIELDS:")
    for entry, issue in missing:
        print(f"  {entry}: {issue}")
else:
    print("All skill files have both layer and canonical-owner-of fields.")

if wrong_layer:
    print("\nWRONG LAYER VALUES:")
    for entry, actual, expected in wrong_layer:
        print(f'  {entry}: has "{actual}", expected "{expected}"')
else:
    print("All layer values match the specified mapping.")

print(f"\nTotal skill directories checked: {total}")
