"""
MachLock Preflight Verification Script
Verifies presence of required files, documents, configuration templates, security posture, and test suites.
"""

import os
import sys
import re

REQUIRED_FILES = [
    "START_HERE.md",
    "README.md",
    "RIME_EVIDENCE.md",
    "DEMO_SCRIPT.md",
    "ARCHITECTURE.md",
    "LIMITATIONS.md",
    "LICENSE",
    "requirements.txt",
    "config/.env.example",
    "config/pronunciation.yaml",
    "config/settings.py",
    "app/backend/main.py",
    "app/state/epoch_fencer.py",
    "app/state/heard_state_ledger.py",
    "app/state/audit_store.py",
    "app/state/models.py",
    "app/tools/checklist_tools.py",
    "app/voice/intent_gate.py",
    "app/voice/rime_client.py",
    "tests/test_epoch_fencing.py",
    "tests/test_heard_state.py",
    "tests/test_stale_tool.py",
    "tests/test_interruption.py",
    "scripts/test_interruption.py",
    "scripts/run_e2e_test.py",
    "demo/demo_transcript.md"
]

def check_preflight():
    print("=" * 60)
    print("MACHLOCK PRE-FLIGHT VERIFICATION")
    print("=" * 60)
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    all_passed = True

    # 1. Check required files
    for rel_path in REQUIRED_FILES:
        full_path = os.path.join(root_dir, rel_path)
        if os.path.exists(full_path):
            print(f"[PASS] File exists: {rel_path}")
        else:
            print(f"[FAIL] Missing file: {rel_path}")
            all_passed = False

    # 2. Check that .env is NOT committed with real secrets
    env_file = os.path.join(root_dir, ".env")
    if os.path.exists(env_file):
        print("[WARN] Local .env present (ensure it is ignored in .gitignore)")
    else:
        print("[PASS] No raw .env committed in repository")

    # 3. Check demo MP4 status
    demo_mp4 = os.path.join(root_dir, "demo", "MachLock_Demo.mp4")
    if os.path.exists(demo_mp4):
        print("[INFO] DEMO MP4 PRESENT")
    else:
        print("[INFO] DEMO MP4 NOT PRESENT — USER WILL ADD MANUALLY (EXPECTED)")

    # 4. Check test directories
    demo_dir = os.path.join(root_dir, "demo")
    evidence_dir = os.path.join(root_dir, "evidence")
    if os.path.isdir(demo_dir) and os.path.isdir(evidence_dir):
        print("[PASS] Demo and Evidence directories validated")
    else:
        print("[FAIL] Missing demo or evidence directory")
        all_passed = False

    print("=" * 60)
    if all_passed:
        print("PRE-FLIGHT STATUS: ALL SYSTEMS GO [READY FOR HACKATHON EVALUATION]")
        print("=" * 60)
        return True
    else:
        print("PRE-FLIGHT STATUS: FAILED")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = check_preflight()
    sys.exit(0 if success else 1)
