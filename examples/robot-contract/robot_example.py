"""A demo robot that follows the contract. Parameters let the check force every outcome."""

import json
import sys
import time


def event(level: str, msg: str, **extra) -> None:
    print(json.dumps({"level": level, "msg": msg, **extra}), flush=True)


config = json.load(open(sys.argv[sys.argv.index("--config") + 1]))
params = config.get("params", {})
company = config["company"]["code"]

event("info", f"processing company {company}", step="login")
event("info", "signed in")  # inherits step "login"
event("checkpoint", "checking amounts", step="check")
if params.get("noise"):
    print("Traceback (most recent call last): not JSON, kept as raw")
if params.get("hang"):
    time.sleep(60)

code = int(params.get("exit", 0))
reasons = {
    1: "portal answered HTTP 503",
    2: "3 of 5 documents downloaded",
    3: "amounts differ from last month, needs review",
    4: "no activity this month",
}
if code in reasons:
    event("warning" if code in (2, 3) else "info", reasons[code], reason=True)
sys.exit(code)
