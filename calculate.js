document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const rawPhone = decodeURIComponent(params.get("phone") || params.get("p_phone") || "").trim();
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const formattedPhone = digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`;

  if (!digitsOnly) {
    console.warn("Invalid phone number.");
    return;
  }

  try {
    const response = await fetch(`https://acro-ghl-estimate.dennis-e64.workers.dev/?phone=${encodeURIComponent(formattedPhone)}`);
    const result = await response.json();
    const contact = result.contact;

    if (!contact) {
      console.warn("No contact found.");
      return;
    }

    const setText = (id, value, formatter) => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatter ? formatter(value) : (value || "");
    };

    const formatMoney = (value) => {
      if (!value) return "";
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const showIfYes = (field, sectionId, mappings) => {
      if (contact[field]?.toLowerCase() === "yes") {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = "block";

        mappings.forEach(({ id, key, formatter }) => {
          setText(id, contact[key], formatter);
        });
      }
    };

    // Roofing Section
    showIfYes("roofing_submit", "roofing-section", [
      { id: "roof-size", key: "Roof Size (square footage)" },
      { id: "roof-rate", key: "Roof Rate", formatter: formatMoney },
      { id: "roof-flat-rate", key: "Roof Flat Rate", formatter: formatMoney },
      { id: "roof-total", key: "Roof Total", formatter: formatMoney }
    ]);

    // Siding Section
    showIfYes("siding_submit", "siding-section", [
      { id: "siding-sqft", key: "Total Square Footage of Siding Area" },
      { id: "siding-rate", key: "Siding Rate", formatter: formatMoney },
      { id: "siding-flat-rate", key: "Siding Flat Cost", formatter: formatMoney },
      { id: "siding-total", key: "Siding Total", formatter: formatMoney }
    ]);

    // Gutters Section
    showIfYes("gutters_submit", "gutters-section", [
      { id: "gutters-feet", key: "Linear Feet of Gutters Required" },
      { id: "gutter-rate", key: "Gutter Rate", formatter: formatMoney },
      { id: "gutter-flat-fee", key: "Gutter Flat Fee", formatter: formatMoney },
      { id: "gutter-total", key: "Gutter Total", formatter: formatMoney }
    ]);

    // Windows Section
    showIfYes("windows_submit", "windows-section", [
      { id: "window-count", key: "Number of Windows" },
      { id: "window-rate", key: "Window Rate", formatter: formatMoney },
      { id: "window-flat-rate", key: "Window Flat Rate", formatter: formatMoney },
      { id: "window-total", key: "Window Total", formatter: formatMoney }
    ]);

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
