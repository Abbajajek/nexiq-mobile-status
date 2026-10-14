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
    const generated = Date.parse(data.generated_at);
    const age = Date.now() - generated;
    const stale = !Number.isFinite(age) || age < 0 || age > 90000;
    setState(stale ? "STALE" : (data.system_state || "UNKNOWN"));
    const observation = data.owner_storage_observations?.health?.observation;
    const service = observation?.service;
    $("storageAlert").textContent = service?.ActiveState === "failed"
      ? "هشدار: در آخرین مشاهده collector متوقف بوده؛ سلامت فعلی نیازمند تأیید تازه است."
      : `وضعیت ظرفیت: ${data.storage_state || "UNKNOWN"}؛ سلامت لایو احراز نشده`;
    $("storageObserved").textContent = `زمان مشاهدهٔ دیسک: ${observation?.observed_at_utc || "نامعلوم"}`;
    $("capacityForecast").textContent = `نرخ رشد و زمان باقی‌مانده: ${data.storage_growth_forecast?.status || "UNKNOWN"}`;
    const published = !stale && data.current_chain_publication_allowed === true
      && data.paper_result_visibility === "PUBLISHED_CURRENT_CHAIN"
      && typeof data.paper_published_realized_net === "number";
    $("paperNet").textContent = published ? `سود و زیان کاغذی تأییدشده: ${data.paper_published_realized_net}` : "سود و زیان کاغذی لایو: نامعلوم / تأییدنشده";
    $("paperTrades").textContent = "دفتر معاملات کاغذی لایو هنوز به این صفحه متصل نشده است.";
    $("simulationNet").textContent = data.paper_display_realized_net == null ? "" : `آزمایش synthetic یا گزارش بدون تأیید انتشار: ${data.paper_display_realized_net}؛ سود لایو محسوب نمی‌شود.`;
    $("modules").replaceChildren();
    for (const item of data.module_registry_snapshot?.modules || []) {
      const li = document.createElement("li");
      li.textContent = `${item.module_id}: ${item.name} — ${item.status}${stale ? " (گزارش کهنه)" : ""}`;
      $("modules").appendChild(li);
    }
    $("gate").textContent = stale ? "گزارش کهنه؛ مجوز فعلی احراز نشده" : (data.research_gate || "—");
    $("heartbeat").textContent = data.last_heartbeat || "—";
    $("job").textContent = data.job_status || data.job_id || "—";
    $("checkpoint").textContent = data.checkpoint_ref || "—";
    $("next").textContent = data.next_action || "—";
    $("summary").textContent = data.transport_state || "وضعیت transport نامشخص است";
    if ($("paper")) $("paper").textContent = stale ? "گزارش کهنه؛ اجرای فعلی نامعلوم" : (data.paper_runtime_state || "NOT_STARTED");
    if ($("paperHealth")) $("paperHealth").textContent = stale ? "UNKNOWN_STALE_REPORT" : (data.paper_health_state || "NOT_AVAILABLE");
  } catch (error) {
    setState("UNREACHABLE");
    $("summary").textContent = "heartbeat معتبر دریافت نشد؛ وضعیت زنده قابل تأیید نیست.";
    $("paperNet").textContent = "سود و زیان لایو: نامعلوم؛ گزارش تازه دریافت نشد.";
    $("storageAlert").textContent = "هشدار: ارتباط گزارش قطع است؛ وضعیت collector نامعلوم است.";
    $("modules").replaceChildren();
    for (const id of ["gate", "heartbeat", "job", "checkpoint", "next", "paper", "paperHealth", "capacityForecast"]) {
      if ($(id)) $(id).textContent = "نامعلوم؛ ارتباط گزارش قطع است";
    }
    $("simulationNet").textContent = "";
    $("paperTrades").textContent = "دفتر معاملات تازه در دسترس نیست";
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
    const response = await fetch("commands/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const result = await response.json().catch(() => ({}));
    alert(result.status ? `وضعیت درخواست: ${result.status}` : "درخواست دریافت شد؛ اجرای آن منوط به canonical adapter است.");
  } catch (_) {
    alert("کانال کنترل در دسترس نیست؛ هیچ اجرای محلی انجام نشد.");
  }
}

document.querySelectorAll("button[data-command]").forEach((button) => button.addEventListener("click", () => stageCommand(button.dataset.command)));
loadStatus();
setInterval(loadStatus, 30000);
