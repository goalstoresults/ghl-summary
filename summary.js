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

        window.parent.postMessage(
          {
            type: "markSectionComplete",
            section: sectionId.replace("-section", "").replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())
          },
          "*"
        );
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
    setText("field-total-square-footage-of-siding-area", contact.total_square_footage_of_siding_area);
    setText("field-type-of-new-siding", contact.type_of_new_siding);
    setText("field-siding-rate", formatMoney(contact.siding_rate));
    setText("field-siding-flat-cost", formatMoney(contact.siding_flat_cost));
    setText("field-type-of-existing-siding", contact.type_of_existing_siding);
    setText("field-siding-brandmodelcolor", contact.siding_brandmodelcolor);
    setText("field-trim-and-accent-areas", contact.trim_and_accent_areas);
    setText("field-number-and-type-of-windowsdoors", contact.number_and_type_of_windowsdoors);
    setText("field-special-architectural-features", contact.special_architectural_features);
    setText("field-labor-costs", formatMoney(contact.labor_costs));
    setText("field-material-costs", formatMoney(contact.material_costs));
    setText("field-equipment-rental", formatMoney(contact.equipment_rental));
    setText("field-wast-disposaldumpster-fees", formatMoney(contact.wast_disposaldumpster_fees));
    setText("field-permits-or-inspection-fees", formatMoney(contact.permits_or_inspection_fees));
    setText("field-additional-siding-information", contact.additional_siding_information);

    // Gutters
    setText("field-linear-feet-of-gutters-required", contact.linear_feet_of_gutters_required);
    setText("field-type-of-gutter-work", contact.type_of_gutter_work);
    setText("field-gutter-rate", formatMoney(contact.gutter_rate));
    setText("field-gutter-flat-fee", formatMoney(contact.gutter_flat_fee));
    setText("field-type-of-gutters", contact.type_of_gutters);
    setText("field-gutter-material-chosen", contact.gutter_material_chosen);
    setText("field-gutter-size", contact.gutter_size);
    setText("field-downspout-size-and-style", contact.downspout_size_and_style);
    setText("field-gutter-guard-type", contact.gutter_guard_type);
    setText("field-gutter-color-and-finish", contact.gutter_color_and_finish);
    setText("field-areas-of-house-involved", contact.areas_of_house_involved);
    setText("field-linear-feet-of-downspouts", contact.linear_feet_of_downspouts);
    setText("field-number-of-insideoutside-corners", contact.number_of_insideoutside_corners);
    setText("field-number-of-downspout-dropsoutlets", contact.number_of_downspout_dropsoutlets);
    setText("field-special-roof-features", contact.special_roof_features);
    setText("field-gutter-material-cost-per-linear-foot", formatMoney(contact.gutter_material_cost_per_linear_foot));
    setText("field-downspout-material", formatMoney(contact.downspout_material));
    setText("field-elbows-end-caps-hangers-brackets", formatMoney(contact.elbows_end_caps_hangers_brackets));
    setText("field-screws-sealants-splash-blocks-gutter-guards", formatMoney(contact.screws_sealants_splash_blocks_gutter_guards));
    setText("field-fasteners-hidden-hangers-miters", formatMoney(contact.fasteners_hidden_hangers_miters));
    setText("field-waste-factor", formatMoney(contact.waste_factor));
    setText("field-hourly-labor-rate", formatMoney(contact.hourly_labor_rate));
    setText("field-estimated-labor-time", contact.estimated_labor_time);
    setText("field-additional-labor-fees", formatMoney(contact.additional_labor_fees));
    setText("field-demolition-and-disposal-fees", formatMoney(contact.demolition_and_disposal_fees));
    setText("field-equipment-and-logistic-fees", formatMoney(contact.equipment_and_logistic_fees));
    setText("field-additional-gutters-information", contact.additional_gutters_information);

    // Windows
    setText("field-window-style", contact.type_of_windows);
    setText("field-number-of-windows", contact.number_of_windows);
    setText("field-type-of-windows", contact.type_of_windows);
    setText("field-material", contact.material);
    setText("field-window-rate", formatMoney(contact.window_rate));
    setText("field-window-flat-rate", formatMoney(contact.window_flat_rate));
    setText("field-glass-type", contact.glass_type);
    setText("field-grid-style", contact.grid_style);
    setText("field-interiorexterior-color", contact.interiorexterior_color);
    setText("field-window-brandmodel", contact.window_brandmodel);
    setText("field-size-or-custom-measurements", contact.size_or_custom_measurements);
    setText("field-labor-cost-per-window-or-hourly", formatMoney(contact.labor_cost_per_window_or_hourly));
    setText("field-number-of-crew-members", contact.number_of_crew_members);
    setText("field-estimated-labor-hours", contact.estimated_labor_hours);
    setText("field-old-window-removal-costs", formatMoney(contact.old_window_removal_costs));
    setText("field-window-disposal-fees", formatMoney(contact.window_disposal_fees));
    setText("field-flashingwaterproofing-details", contact.flashingwaterproofing_details);
    setText("field-interiorexterior-trim-work", contact.interiorexterior_trim_work);
    setText("field-caulking-and-insulation", contact.caulking_and_insulation);
    setText("field-cleanup-services", contact.cleanup_services);
    setText("field-additional-windows-information", contact.additional_windows_information);

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
