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

    const showIfYes = (field, sectionId) => {
      if (contact[field]?.toLowerCase() === "yes") {
        const el = document.getElementById(sectionId);
        if (el) el.style.display = "block";
      }
    };

    showIfYes("basic_submit", "basic-section");
    showIfYes("roofing_submit", "roofing-section");
    showIfYes("siding_submit", "siding-section");
    showIfYes("windows_submit", "windows-section");

    document.getElementById("contact-full-name-display").textContent = contact.full_name || "";
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";

    const address1 = contact.address1 || "";
    const city = contact.city || "";
    const state = contact.state || "";
    const zip = contact.postal_code || "";
    const fullAddress = `${address1}${city ? ", " + city : ""}${state ? " " + state : ""}${zip ? " " + zip : ""}`.trim();
    document.getElementById("field-address").textContent = fullAddress;

    document.getElementById("field-building-type").textContent = contact["Building Type"] || "";
    document.getElementById("field-number-of-stories").textContent = contact["Number of Stories"] || "";

    document.getElementById("field-roof-size").textContent = contact["Roof Size (square footage)"] || "";
    document.getElementById("field-roof-pitch").textContent = contact["Roof pitch/slope"] || "";

    document.getElementById("field-siding-type").textContent = contact["Type of New Siding"] || "";
    document.getElementById("field-siding-color").textContent = contact["Siding Brand/Model/Color"] || "";

    document.getElementById("field-window-style").textContent = contact["Type of Windows"] || "";
    document.getElementById("field-num-windows").textContent = contact["Number of Windows"] || "";

    const showSectionIfTotalExists = (sectionId, fieldId, totalValue) => {
      const section = document.getElementById(sectionId);
      const field = document.getElementById(fieldId);
      if (totalValue && section && field) {
        section.style.display = "block";
        field.textContent = `$${parseFloat(totalValue).toFixed(2)}`;
      }
    };

    showSectionIfTotalExists("roofing-totals-section", "field-roof-total", contact["roof_total"]);
    showSectionIfTotalExists("siding-totals-section", "field-siding-total", contact["siding_total"]);
    showSectionIfTotalExists("gutter-totals-section", "field-gutter-total", contact["gutter_total"]);
    showSectionIfTotalExists("window-totals-section", "field-window-total", contact["window_total"]);

    const summarySection = document.getElementById("summary-totals-section");
    if (summarySection && (contact["combined_total"] || contact["grand_total"])) {
      summarySection.style.display = "block";
      document.getElementById("field-combined-total").textContent = `$${contact["combined_total"] || ""}`;
      document.getElementById("field-grand-total").textContent = `$${contact["grand_total"] || ""}`;
      document.getElementById("field-discount").textContent = contact["discount_value"] ? `${contact["discount_type"] === "percent" ? contact["discount_value"] + "%" : "$" + contact["discount_value"]}` : "";
      document.getElementById("field-discount-reason").textContent = contact["discount_reason"] || "";
      document.getElementById("field-discount-end-date").textContent = contact["discount_end_date"] || "";
    }

    updateExternalButtons(contact);

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});

// Replace buttons on the GHL parent page
function updateExternalButtons(submitStatus) {
  const sections = [
    { field: 'basic_submit', name: 'Basic Info', id: 'btn-basic' },
    { field: 'roofing_submit', name: 'Roofing', id: 'btn-roofing' },
    { field: 'siding_submit', name: 'Siding', id: 'btn-siding' },
    { field: 'gutter_submit', name: 'Gutters', id: 'btn-gutter' },
    { field: 'windows_submit', name: 'Windows', id: 'btn-window' }
  ];

  sections.forEach(section => {
    try {
      const btn = window.parent.document.getElementById(section.id);
      if (!btn) return;

      if (submitStatus[section.field]?.toLowerCase() === "yes") {
        const replacement = document.createElement('div');
        replacement.className = 'sidebar-section-complete';
        replacement.innerHTML = `
          <div>${section.name}</div>
          <div>✔️</div>
        `;
        btn.replaceWith(replacement);
      }
    } catch (err) {
      console.warn(`Could not access or replace ${section.id}:`, err);
    }
  });
}
