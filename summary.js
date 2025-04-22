document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);

  const rawPhone = decodeURIComponent(params.get("phone") || params.get("p_phone") || "").trim();
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const formattedPhone = digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`;

  console.log("Raw phone:", rawPhone);
  console.log("Digits only:", digitsOnly);
  console.log("Formatted phone:", formattedPhone);

  if (!digitsOnly) {
    console.warn("Invalid phone number.");
    return;
  }

  try {
    const response = await fetch(`https://acro-ghl-estimate.dennis-e64.workers.dev/?phone=${encodeURIComponent(formattedPhone)}`);
    const result = await response.json();
    const contact = result.contact;

    console.log("Fetched result:", result);

    if (!contact) {
      console.warn("No contact found.");
      return;
    }

    // Section visibility
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

    // Full name and additional name
    const fullName = contact.full_name || "";
    const additionalFirst = contact["Additional First Name"]?.trim() || "";
    const additionalLast = contact["Additional Last Name"]?.trim() || "";
    const additionalName = (additionalFirst || additionalLast) ? ` + ${additionalFirst} ${additionalLast}`.trim() : "";
    const fullDisplayName = `${fullName}${additionalName}`;

    // Address
    const address1 = contact.address1 || "";
    const city = contact.city || "";
    const state = contact.state || "";
    const zip = contact.postal_code || "";
    const fullAddress = `${address1}${city ? ", " + city : ""}${state ? " " + state : ""}${zip ? " " + zip : ""}`.trim();

    // Basic Info DOM
    document.getElementById("contact-full-name-display").textContent = fullDisplayName;
    const signatureName = document.getElementById("contact-full-name-signature");
    if (signatureName) signatureName.textContent = fullDisplayName;
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";
    document.getElementById("field-address").textContent = fullAddress;
    document.getElementById("field-building-type").textContent = contact["Building Type"] || "";
    document.getElementById("field-number-of-stories").textContent = contact["Number of Stories"] || "";

    // Roofing
    document.getElementById("field-roof-size").textContent = contact["Roof Size (square footage)"] || "";
    document.getElementById("field-roof-pitch").textContent = contact["Roof pitch/slope"] || "";

    // Siding
    document.getElementById("field-siding-type").textContent = contact["Type of New Siding"] || "";
    document.getElementById("field-siding-color").textContent = contact["Siding Brand/Model/Color"] || "";

    // Windows
    document.getElementById("field-window-style").textContent = contact["Type of Windows"] || "";
    document.getElementById("field-num-windows").textContent = contact["Number of Windows"] || "";

    // Additional signature
    if (additionalFirst || additionalLast) {
      const additionalSection = document.getElementById("additional-signature");
      const nameDisplay = document.getElementById("additional-name-display");
      if (additionalSection && nameDisplay) {
        additionalSection.style.display = "block";
        nameDisplay.textContent = `${additionalFirst} ${additionalLast}`.trim();
      }
    }

    // ==============================
    // NEW: Show Scope of Work Totals
    // ==============================

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

    // Summary Totals
    const summarySection = document.getElementById("summary-totals-section");
    const showIfValue = (fieldId, value, formatFn = v => v) => {
      const row = document.getElementById(fieldId)?.closest(".field-row");
      const span = document.getElementById(fieldId);
      if (value && span && row) {
        span.textContent = formatFn(value);
        row.style.display = "block";
      } else if (row) {
        row.style.display = "none";
      }
    };

    let showSummary = false;

    if (contact["combined_total"] || contact["grand_total"]) {
      showSummary = true;
      showIfValue("field-combined-total", contact["combined_total"], v => `$${v}`);
      showIfValue("field-grand-total", contact["grand_total"], v => `$${v}`);
    }

    const discountType = contact["discount_type"];
    const discountValue = contact["discount_value"];
    if (discountValue) {
      showSummary = true;
      const formattedDiscount = discountType === "percent" ? `${discountValue}%` : `$${discountValue}`;
      showIfValue("field-discount", formattedDiscount);
    }

    if (contact["discount_reason"]) {
      showSummary = true;
      showIfValue("field-discount-reason", contact["discount_reason"]);
    }

    if (contact["discount_end_date"]) {
      showSummary = true;
      showIfValue("field-discount-end-date", contact["discount_end_date"]);
    }

    if (showSummary && summarySection) {
      summarySection.style.display = "block";
    }

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
