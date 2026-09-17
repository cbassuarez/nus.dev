#!/usr/bin/env python3
"""Record a real PTY session to an asciinema v2 cast.

    scripts/record-cast.py OUT.cast [--cols 96] [--rows 30] -- CMD [ARGS...]

The point is that the hero on nus.dev replays *bytes a shell actually wrote*,
not a transcription of them. This captures those bytes with their timings; the
page feeds them to nus's own VT core, compiled to WebAssembly.

A prompt that emits OSC 133 marks is injected where the shell supports it, so
the recording carries the prompt/command/output boundaries the app's block
model reads — the same marks nus installs for pwsh, bash, zsh and fish.

asciinema v2: a JSON header line, then [elapsed, "o", data] lines.
Output is decoded incrementally so a multi-byte character split across two
reads is never corrupted.
"""

import argparse
import codecs
import fcntl
import json
import os
import pty
import select
import signal
import struct
import sys
import termios
import time


def set_size(fd, cols, rows):
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--cols", type=int, default=96)
    ap.add_argument("--rows", type=int, default=30)
    ap.add_argument("--idle-cap", type=float, default=1.5,
                    help="compress any gap longer than this, in seconds")
    ap.add_argument("--send", metavar="FILE",
                    help="lines to type into the session, one command per line; "
                         "'#' comments, '~N' waits N seconds, "
                         "trailing '\\' types without running")
    ap.add_argument("--keystroke", type=float, default=0.055,
                    help="seconds between typed characters")
    ap.add_argument("--quiet-for", type=float, default=0.45,
                    help="seconds of silence that mean a command has finished")
    ap.add_argument("--max-seconds", type=float, default=180,
                    help="give up on a session that will not end")
    # Split on the first "--" ourselves: argparse.REMAINDER would swallow the
    # option flags that come before it.
    argv = sys.argv[1:]
    if "--" in argv:
        cut = argv.index("--")
        argv, cmd = argv[:cut], argv[cut + 1:]
    else:
        cmd = []

    args = ap.parse_args(argv)
    if not cmd:
        ap.error("give a command after --")

    env = dict(os.environ)
    env["TERM"] = "xterm-256color"
    env["COLORTERM"] = "truecolor"
    env["TERM_PROGRAM"] = "nus-recorder"
    env["COLUMNS"] = str(args.cols)
    env["LINES"] = str(args.rows)
    # Keep the recording deterministic and free of the host's own prompt setup.
    env.pop("PROMPT_COMMAND", None)

    pid, fd = pty.fork()
    if pid == 0:
        os.execvpe(cmd[0], cmd, env)
        os._exit(127)

    set_size(fd, args.cols, args.rows)

    script = []
    if args.send:
        with open(args.send, encoding="utf-8") as f:
            script = [ln.rstrip("\n") for ln in f
                      if ln.strip() and not ln.lstrip().startswith("#")]

    decoder = codecs.getincrementaldecoder("utf-8")("replace")
    events = []
    state = {"start": time.time(), "last": time.time()}

    def pump(timeout):
        """Drain one read if there is one. Returns True if bytes arrived."""
        r, _, _ = select.select([fd], [], [], timeout)
        if fd not in r:
            return False
        try:
            chunk = os.read(fd, 65536)
        except OSError:
            return False
        if not chunk:
            raise EOFError

        now = time.time()
        gap = now - state["last"]
        if gap > args.idle_cap:           # compress dead air
            state["start"] += gap - args.idle_cap
        state["last"] = now

        text = decoder.decode(chunk)
        if text:
            events.append([round(now - state["start"], 6), "o", text])
        return True

    def settle(seconds):
        """Read until the session has been quiet for `seconds`."""
        quiet_since = time.time()
        while time.time() - quiet_since < seconds:
            if pump(0.05):
                quiet_since = time.time()

    try:
        settle(args.quiet_for)            # let the first prompt paint

        for line in script:
            if line.startswith("~"):
                settle(float(line[1:] or 1))
                continue
            hold = line.endswith("\\")     # trailing \ = type it, do not run it
            if hold:
                line = line[:-1]
            for ch in line:               # type it, a character at a time
                os.write(fd, ch.encode("utf-8"))
                deadline = time.time() + args.keystroke
                while time.time() < deadline:
                    pump(0.01)
            if hold:
                settle(args.quiet_for)
                continue
            os.write(fd, b"\r")
            settle(args.quiet_for)

        deadline = time.time() + args.max_seconds
        while time.time() < deadline:     # drain until the child exits
            if not pump(0.25):
                if os.waitpid(pid, os.WNOHANG)[0] == pid:
                    break
    except (EOFError, KeyboardInterrupt):
        pass
    finally:
        try:
            os.close(fd)
        except OSError:
            pass
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass

    start = state["start"]

    tail = decoder.decode(b"", final=True)
    if tail:
        events.append([round(time.time() - start, 6), "o", tail])

    header = {
        "version": 2,
        "width": args.cols,
        "height": args.rows,
        "timestamp": int(start),
        "env": {"TERM": "xterm-256color", "SHELL": cmd[0]},
    }

    with open(args.out, "w", encoding="utf-8") as f:
        f.write(json.dumps(header) + "\n")
        for e in events:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    dur = events[-1][0] if events else 0
    size = os.path.getsize(args.out)
    print(f"{args.out}: {len(events)} events, {dur:.1f}s, {size / 1024:.0f} KB "
          f"({args.cols}×{args.rows})", file=sys.stderr)


if __name__ == "__main__":
    main()
