const form = document.querySelector("#control-form");
const statusMessage = document.querySelector("#status-message");
const serviceStatus = document.querySelector("#service-status");
const lastResponse = document.querySelector("#last-response");
const lastLatency = document.querySelector("#last-latency");

const setStatus = (message) => {
  statusMessage.textContent = message;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  serviceStatus.textContent = "sending";
  setStatus("Sending control request...");

  const intent = document.querySelector("#intent").value.trim();
  const payloadInput = document.querySelector("#payload").value.trim();

  let payload = {};
  try {
    payload = payloadInput ? JSON.parse(payloadInput) : {};
  } catch (error) {
    setStatus("Payload must be valid JSON.");
    serviceStatus.textContent = "error";
    return;
  }

  const startedAt = performance.now();
  try {
    const response = await fetch("/api/control/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        intent,
        input: payload,
        auth: {
          subjectId: "console-user",
          tenantId: "tenant-local",
        },
      }),
    });
    const data = await response.json();
    const elapsed = Math.round(performance.now() - startedAt);

    serviceStatus.textContent = response.ok ? "ok" : "error";
    lastResponse.textContent = data.status || "unknown";
    lastLatency.textContent = `${elapsed}ms`;
    setStatus(response.ok ? "Control request completed." : "Control request failed.");
  } catch (error) {
    serviceStatus.textContent = "error";
    lastResponse.textContent = "error";
    lastLatency.textContent = "--";
    setStatus("Network error while sending request.");
  }
});
