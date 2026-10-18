"""Run any robot that follows a small, language-agnostic contract.

    <robot> --config <file.json>

- The config file carries the parameters and secrets. It exists only while the robot runs.
- The robot reports progress as JSON Lines on stdout: {"level", "step", "msg", ...}.
  A line without "step" inherits the previous one. A line that is not JSON (a traceback,
  say) is kept as "raw" and breaks nothing. "reason": true marks the line that explains
  the outcome.
- The exit code carries meaning, so the panel can tell "broken" from "needs a person".
"""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
import threading
from dataclasses import dataclass, field

STATES = {0: "success", 1: "error", 2: "partial", 3: "intervention", 4: "dismissed"}


@dataclass
class Run:
    state: str
    exit_code: int | None
    reason: str = ""
    events: list[dict] = field(default_factory=list)


def run(command: list[str], config: dict, timeout: float = 1800) -> Run:
    fd, path = tempfile.mkstemp(suffix=".json")
    with os.fdopen(fd, "w") as f:
        json.dump(config, f)
    timed_out = threading.Event()
    try:
        proc = subprocess.Popen([*command, "--config", path], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

        def kill() -> None:
            timed_out.set()
            proc.kill()

        timer = threading.Timer(timeout, kill)
        timer.start()
        events: list[dict] = []
        step = None
        for line in proc.stdout:
            line = line.rstrip("\n")
            if not line:
                continue
            try:
                event = json.loads(line)
                if not isinstance(event, dict):
                    raise ValueError
            except ValueError:
                event = {"level": "raw", "msg": line}
            step = event.setdefault("step", step)
            events.append(event)
        code = proc.wait()
        timer.cancel()
    finally:
        os.remove(path)  # secrets never outlive the run

    if timed_out.is_set():
        return Run("timeout", None, f"passed {timeout}s and was stopped", events)
    reason = next((e.get("msg", "") for e in reversed(events) if e.get("reason")), "")
    return Run(STATES.get(code, "error"), code, reason, events)  # any code outside the contract is an error
