# NexIQ-NG Mobile Control and Reporting

This is a clean-room, mobile-first status surface. It is intentionally
read-only for reporting and stages only bounded research-only commands.

## Reports

The page reads `status.json` and distinguishes:

- `LIVE`: fresh verified heartbeat;
- `STALE`: last heartbeat is too old;
- `UNREACHABLE`: no fresh feed is available;
- `BLOCKED`: a gate or authority prevents execution.

The page reports the current job, checkpoint, result, transport state, chassis
gate, research-execution authority, and next action. `research_gate` is the
chassis/readiness gate; `research_execution_authority` is the separate live
research permission and remains `CLOSED` unless its authority is explicitly
verified. Cached data is never displayed as `LIVE`.

## Controls

The allowed commands are explicit and are written to `commands/` as staged
requests. They are not arbitrary shell commands and are not executed by the
mobile page. A canonical adapter must validate, authorize, and execute them.

No mobile command can change production policy or allocate capital.

## Installation

After the mobile directory is served from an HTTPS URL (or localhost for
testing), open that URL on the phone and choose **Add to Home Screen**. The
manifest and service worker make it installable as a PWA.

Opening `index.html` directly from a file manager is not a supported live mode:
the browser will not reliably provide service-worker support, status fetching,
or command staging.
