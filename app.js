const $ = (id) => document.getElementById(id);

function setState(name) {
  const el = $("state");
  el.textContent = name;
  el.className = "badge " + (name === "LIVE" ? "live" : name === "STALE" ? "stale" : "bad");
}

async function loadStatus() {
  try {
    const response = await fetch("status.json", { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    setState(data.system_state || "UNKNOWN");
    $("gate").textContent = data.research_gate || "—";
    $("heartbeat").textContent = data.last_heartbeat || "—";
    $("job").textContent = data.job_status || data.job_id || "—";
    $("checkpoint").textContent = data.checkpoint_ref || "—";
    $("next").textContent = data.next_action || "—";
    $("summary").textContent = data.transport_state || "وضعیت transport نامشخص است";
    if ($("paper")) $("paper").textContent = data.paper_runtime_state || "NOT_STARTED";
    if ($("paperHealth")) $("paperHealth").textContent = data.paper_health_state || "NOT_AVAILABLE";
  } catch (error) {
    setState("UNREACHABLE");
    $("summary").textContent = "heartbeat معتبر دریافت نشد؛ وضعیت زنده قابل تأیید نیست.";
  }
}

async function stageCommand(command) {
  const request = {
    schema_version: "1.0",
    request_id: `${command}-${Date.now()}`,
    command,
    created_at: new Date().toISOString(),
    research_only: true
  };
  try {
    await fetch("commands/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
    alert("درخواست stage شد؛ اجرای آن منوط به canonical adapter است.");
  } catch (_) {
    alert("کانال کنترل در دسترس نیست؛ هیچ اجرای محلی انجام نشد.");
  }
}

document.querySelectorAll("button[data-command]").forEach((button) => button.addEventListener("click", () => stageCommand(button.dataset.command)));
loadStatus();
setInterval(loadStatus, 30000);
