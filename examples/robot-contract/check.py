"""Self-check: drives the demo robot through every outcome. Run: python3 check.py"""

import glob
import sys
import tempfile
from pathlib import Path

from runner import run

robot = [sys.executable, str(Path(__file__).with_name("robot_example.py"))]
company = {"code": "0042", "name": "Empresa Exemplo Ltda"}  # fictional
before = set(glob.glob(f"{tempfile.gettempdir()}/*.json"))

for code, state in [(0, "success"), (1, "error"), (2, "partial"), (3, "intervention"), (4, "dismissed"), (7, "error")]:
    r = run(robot, {"company": company, "params": {"exit": code}})
    assert r.state == state, (code, r)
    print(f"ok: exit {code} -> {r.state}{f' ({r.reason})' if r.reason else ''}")

r = run(robot, {"company": company, "params": {"noise": True}, "secrets": {"password": "not-real"}})
assert r.events[1] == {"level": "info", "msg": "signed in", "step": "login"}, "a line without step inherits the previous one"
assert any(e["level"] == "raw" for e in r.events), "non-JSON output is kept as raw"
print("ok: step inheritance and raw lines")

r = run(robot, {"company": company, "params": {"hang": True}}, timeout=1)
assert r.state == "timeout" and r.exit_code is None
print("ok: a robot that hangs is stopped and marked timeout")

assert set(glob.glob(f"{tempfile.gettempdir()}/*.json")) == before, "config files (with secrets) must be deleted"
print("ok: no config file left behind")
print("all checks passed")
