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
   // console.log("Full Contact:", contact);


    if (!contact) {
      console.warn("No contact found.");
      return;
    }

    const formatDate = (isoDate) => {
      if (!isoDate) return "";
      const d = new Date(isoDate);
      if (isNaN(d)) return isoDate;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || "";
    };

    const formatMoney = (value) => {
      if (!value) return "";
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Function to show sections and send postMessage for checkmark buttons
    const showIfYes = (field, sectionId) => {
      if (contact[field]?.toLowerCase() === "yes") {
        const el = document.getElementById(sectionId);
        if (el) el.style.display = "block";
    
        // Wait 300ms before sending postMessage to parent
        setTimeout(() => {
          window.parent.postMessage(
            {
              type: "markSectionComplete",
              section: sectionId.replace("-section", "").replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())
            },
            "*"
          );
        }, 300);
      }
    };


    // Show sections if their *_submit fields are yes
    showIfYes("basic_submit", "basic-section");
    showIfYes("roofing_submit", "roofing-section");
    showIfYes("siding_submit", "siding-section");
    showIfYes("gutters_submit", "gutters-section");
    showIfYes("windows_submit", "windows-section");

    // Basic Info
    setText("field-estimate-date", formatDate(contact["Estimate Date"]));
    
    let fullName = contact.full_name || " ";
    const additionalFirst = (contact["Additional First Name"] || "").trim();
    const additionalLast = (contact["Additional Last Name"] || "").trim();
    const additionalName = (additionalFirst || additionalLast) ? ` + ${additionalFirst} ${additionalLast}` : "";
    setText("contact-full-name-display", `${fullName}${additionalName}`);
    
    setText("field-phone", contact.phone);
    setText("field-email", contact.email);
    setText("field-address", `${contact.address1 || ""}${contact.city ? ", " + contact.city : ""}${contact.state ? " " + contact.state : ""}${contact.postal_code ? " " + contact.postal_code : ""}`);
    setText("field-building-type", contact["Building Type"]);
    setText("field-number-of-stories", contact["Number of Stories"]);

    // Roofing
    setText("field-roof-size-square-footage", contact["Roof Size (square footage)"]);
    setText("field-material-desired", contact["Material Desired"]);
    setText("field-roof-rate", formatMoney(contact["Roof Rate"]));
    setText("field-roof-flat-rate", formatMoney(contact["Roof Flat Rate"]));
    setText("field-roof-pitchslope", contact["Roof pitch/slope"]);
    setText("field-current-roofing-material", contact["Current roofing material"]);
    setText("field-condition-of-existing-roof", contact["Condition of Existing Roof"]);
    setText("field-layers-of-existing-roof", contact["Layers of Existing Roofing"]);
    setText("field-tearoff-type", contact["Tearoff Type"]);
    setText("field-sheathing-condition", contact["Sheathing Condition"]);
    setText("field-color-preference", contact["Color Preference"]);
    setText("field-underlayment-type", contact["Underlayment type"]);
    setText("field-installation-ventalation-upgrades", contact["installation / ventalation upgrades"]);
    setText("field-additional-roofing-information", contact["Additional Roofing Information"]);
    setText("field-underlayment-option", contact["Underlayment Option"]);
    setText("field-markup-percent", contact["Markup Percent"] ? `${contact["Markup Percent"]}%` : "");

    // Siding
    setText("field-total-square-footage-of-siding-area", contact["Total Square Footage of Siding Area"]);
    setText("field-type-of-new-siding", contact["Type of New Siding"]);
    setText("field-siding-rate", formatMoney(contact["Siding Rate"]));
    setText("field-siding-flat-cost", formatMoney(contact["Siding Flat Cost"]));
    setText("field-type-of-existing-siding", contact["Type of Existing Siding"]);
    setText("field-siding-brandmodelcolor", contact["Siding Brand/Model/Color"]);
    setText("field-trim-and-accent-areas", contact["Trim and Accent Areas"]);
    setText("field-number-and-type-of-windowsdoors", contact["Number and type of Windows/Doors"]);
    setText("field-special-architectural-features", contact["Special Architectural Features"]);
    setText("field-labor-costs", formatMoney(contact["Labor Costs"]));
    setText("field-material-costs", formatMoney(contact["Material Costs"]));
    setText("field-equipment-rental", formatMoney(contact["Equipment Rental"]));
    setText("field-wast-disposaldumpster-fees", formatMoney(contact["Wast Disposal/Dumpster Fees"]));
    setText("field-permits-or-inspection-fees", formatMoney(contact["Permits or Inspection Fees"]));
    setText("field-additional-siding-information", contact["Additional Siding Information"]);

    // Gutters
    setText("field-linear-feet-of-gutters-required", contact["Linear Feet of Gutters Required"]);
    setText("field-type-of-gutter-work", contact["Type of Gutter Work"]);
    setText("field-gutter-rate", formatMoney(contact["Gutter Rate"]));
    setText("field-gutter-flat-fee", formatMoney(contact["Gutter Flat Fee"]));
    setText("field-type-of-gutters", contact["Type of Gutters"]);
    setText("field-gutter-material-chosen", contact["Gutter Material Chosen"]);
    setText("field-gutter-size", contact["Gutter Size"]);
    setText("field-downspout-size-and-style", contact["Downspout Size and Style"]);
    setText("field-gutter-guard-type", contact["Gutter Guard Type"]);
    setText("field-gutter-color-and-finish", contact["Gutter Color and Finish"]);
    setText("field-areas-of-house-involved", contact["Areas of House Involved"]);
    setText("field-linear-feet-of-downspouts", contact["Linear Feet of Downspouts"]);
    setText("field-number-of-insideoutside-corners", contact["Number of Inside/Outside Corners"]);
    setText("field-number-of-downspout-dropsoutlets", contact["Number of Downspout Drops/Outlets"]);
    setText("field-special-roof-features", contact["Special Roof Features"]);
    setText("field-gutter-material-cost-per-linear-foot", formatMoney(contact["Gutter Material Cost (per linear foot)"]));
    setText("field-downspout-material", formatMoney(contact["Downspout Material"]));
    setText("field-elbows-end-caps-hangers-brackets", formatMoney(contact["Elbows, End Caps, Hangers, Brackets"]));
    setText("field-screws-sealants-splash-blocks-gutter-guards", formatMoney(contact["Screws, Sealants, Splash Blocks, Gutter Guards"]));
    setText("field-fasteners-hidden-hangers-miters", formatMoney(contact["Fasteners, Hidden Hangers, Miters"]));
    setText("field-waste-factor", formatMoney(contact["Waste Factor"]));
    setText("field-hourly-labor-rate", formatMoney(contact["Hourly Labor Rate"]));
    setText("field-estimated-labor-time", contact["Estimated Labor Time"]);
    setText("field-additional-labor-fees", formatMoney(contact["Additional Labor Fees"]));
    setText("field-demolition-and-disposal-fees", formatMoney(contact["Demolition and Disposal Fees"]));
    setText("field-equipment-and-logistic-fees", formatMoney(contact["Equipment and Logistic Fees"]));
    setText("field-additional-gutters-information", contact["Additional Gutters Information"]);

    // Windows
    setText("field-number-of-windows", contact["Number of Windows"]);
    setText("field-type-of-windows", contact["Type of Windows"]);
    setText("field-material", contact["Material"]);
    setText("field-window-rate", formatMoney(contact["Window Rate"]));
    setText("field-window-flat-rate", formatMoney(contact["Window Flat Rate"]));
    setText("field-glass-type", contact["Glass Type"]);
    setText("field-grid-style", contact["Grid Style"]);
    setText("field-interiorexterior-color", contact["Interior/Exterior Color"]);
    setText("field-window-brandmodel", contact["Window Brand/Model"]);
    setText("field-size-or-custom-measurements", contact["Size or Custom Measurements"]);
    setText("field-labor-cost-per-window-or-hourly", formatMoney(contact["Labor Cost Per Window or Hourly"]));
    setText("field-number-of-crew-members", contact["Number of Crew Members"]);
    setText("field-estimated-labor-hours", contact["Estimated Labor Hours"]);
    setText("field-old-window-removal-costs", formatMoney(contact["Old Window Removal Costs"]));
    setText("field-window-disposal-fees", formatMoney(contact["Window Disposal Fees"]));
    setText("field-flashingwaterproofing-details", contact["Flashing/Waterproofing Details"]);
    setText("field-interiorexterior-trim-work", contact["Interior/Exterior Trim Work"]);
    setText("field-caulking-and-insulation", contact["Caulking and Insulation"]);
    setText("field-cleanup-services", contact["Cleanup Services"]);
    setText("field-additional-windows-information", contact["Additional Windows Information"]);

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
