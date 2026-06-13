# 2026 Improvements Checklist

## Codebase Analysis

### Current Architecture

- The app is an offline-first Electron + React desktop client backed by a self-hosted Convex instance on the local network.
- Multi-desk operation already exists at a basic level through per-device `computerName` and `printerName` settings stored in local storage.
- `Amaanat` already supports:
  - user signup
  - adding multiple stored items per user
  - assigning items to structured Amaanat locations
  - marking items as returned
  - printing collection receipts
- `Lost Property` already supports:
  - reporting lost items
  - reporting found items
  - returning found items
  - manually matching lost and found items
  - basic filtering and high-level counts
- The admin dashboard and location management page exist, but both are first-generation implementations rather than operational tools.

### What Is Working Already

- Existing lost/found matching can be reused as the base for a stronger suggestion system.
- Existing receipt printing is a good base for scanner support if the printed receipt is upgraded to include a barcode or QR code.
- Existing Amaanat location data proves the workflow, but the schema is too simple for long-term storage operations.
- Existing dashboard metrics confirm the app already has enough data to support a better analytics view.

### Main Structural Gaps

- There is no dashboard-controlled self-serve mode with protected entry and exit.
- Scanner hardware is not integrated anywhere yet.
- Found item storage is still free-text instead of structured storage.
- Item naming is still free-text everywhere, so filters, matching quality, analytics, and reporting are all weaker than they need to be.
- Location management is tied to a single global number plus size, which is why it becomes brittle when operations evolve.
- Reporting and dashboard logic is count-based only and not operationally actionable.

## Improvements Already Made In The Current Codebase

Based on the current implementation and recent git history, these improvements have already been made and should be counted before starting the next round:

- Amaanat receipt printing is implemented.
- Per-device computer naming is implemented.
- Per-device printer naming is implemented and can be edited from the frontend.
- Amaanat supports multiple items in one location for the same user.
- Extra small and extra large Amaanat location sizes were added.
- Found items now support a stored location field.
- A dedicated found item detail page exists.
- Lost/found matching dialogs were improved with more item context.
- Filtering improvements were added to Amaanat, lost items, and found items views.
- A first dashboard page exists.
- A first location management page exists.
- The system has been moved/documented around the current self-hosted Convex offline setup.

## Optimal Solution By Requirement

### 1. Self-Serve Lost Property Tablet

#### Problem

The current app is a staff application with full navigation. A public tablet must be locked to a single safe workflow.

#### Optimal Solution

- Add a `Self serve enable` action on the admin dashboard.
- When pressed, require the passcode `lost2026` before entering self-serve mode.
- After successful entry, switch the app into a dedicated self-serve route such as `/kiosk/lost-report`.
- In self-serve mode:
  - hide the sidebar and all admin navigation
  - only allow adding lost items
  - show a clear `Exit self serve` action
  - require the same passcode `lost2026` to exit and return to the normal staff view
  - auto-return to the start screen after successful submission or inactivity
- Prefer a lightweight per-device session flag for this mode instead of a more complex permanent workstation-mode system.
- Keep the self-serve form intentionally short:
  - item category
  - item name
  - details
  - lost area
  - name
  - AIMS number
  - phone number

#### Why This Is Best

- It reuses the same app and backend.
- It avoids maintaining a separate product just for tablets.
- It prevents accidental exposure of staff screens and admin tools.
- It matches the operational need to temporarily turn a staff tablet into a public self-serve device and then lock it back down again.

### 2. Amaanat Collection Tablets For Busy Desks

#### Problem

The current Amaanat flow is staff-oriented and search-driven. Queue speed still matters, but this does not need a separate tablet-only mode if staff tablets already run the normal app well.

#### Optimal Solution

- Keep Amaanat collection on the normal `staff` view.
- Optimize the existing staff flow for tablet use instead of creating a separate mode:
  - keep large tap targets
  - make the AIMS lookup field scanner-first
  - reduce unnecessary typing during collection
  - keep the stored-items and return actions easy to reach
- Treat staff laptops and staff tablets as the same application mode.

#### Why This Is Best

- It reduces queue time.
- It avoids maintaining a second Amaanat return interface.
- It matches the confirmed operating model that staff tablets can run the standard Electron app.

### 3. Scanner Implementation

#### Problem

There is no scanner flow today, and typing AIMS numbers manually is slow and error-prone.

#### Optimal Solution

- The confirmed scanner is `Tera 2D QR Barcode Scanner Wireless USB Wired 1D 2D Handheld Cordless Bar Code Reader`, model `D5100`.
- Treat the scanner as a keyboard-wedge scanner first.
- Use the scanner to populate the existing AIMS input field directly in the staff flow.
- Keep the first implementation simple:
  - focus the AIMS search field
  - accept scanner input as keyboard text
  - auto-submit or auto-search after scan completion
- Update Amaanat receipt printing to include a barcode or QR code containing the AIMS number so receipts can be rescanned later if needed.
- Add scanner-aware inputs that:
  - stay focused
  - accept rapid input bursts
  - auto-submit on trailing `Enter`
- Only build HID/serial-specific integration if the purchased scanner does not behave as a keyboard device.

#### Why This Is Best

- Keyboard-wedge scanners are the most reliable offline option.
- It requires no special drivers in the common case.
- It matches the confirmed scanner hardware and the intended AIMS lookup workflow.

### 4. Location Management

#### Problem

Current locations are only `{ number, size, is_occupied }`. That model does not handle racks, sections, or evolving storage layouts.

#### Optimal Solution

- Replace the current model with structured storage:
  - `storage_zones`
  - `storage_racks`
  - `storage_locations`
- Example location identity:
  - zone: `Amaanat`
  - rack: `C`
  - slot: `042`
  - display code: `C-042`
- Store location attributes separately from the display code:
  - rack
  - slot number
  - size
  - workflow type
  - category restriction if any
  - active/inactive
- Keep numbering sequential within a rack or zone, not globally across the whole system.
- Add migration support so old numeric locations can map into a default rack such as `A-001`, `A-002`, etc.

#### Why This Is Best

- Staff can find items physically, not just numerically.
- New racks can be introduced without breaking numbering logic.
- The same storage model can serve both Amaanat and found property.

### 5. Found Items Storage Locations

#### Problem

Found item storage is currently a free-text field. A second completely separate location system would create duplication and confusion.

#### Optimal Solution

- Reuse the same structured storage model as Amaanat.
- Add zones for found property such as:
  - `Found Phones`
  - `Found Keys`
  - `Found Bags`
  - `Found Documents`
- Support optional category restrictions on locations so a phone bin only accepts phone-category items.
- Provide “next available location” suggestions inside the found item form.

#### Why This Is Best

- One location engine is easier to maintain than two.
- Staff still get category-specific storage behavior.
- Reporting becomes much cleaner.

### 6. Better Linking Between Lost And Found Items

#### Problem

Matching exists, but it is manual and discovery is weak.

#### Optimal Solution

- Add a normalized item category model.
- Add a `match_suggestions` query that scores candidates using:
  - category match
  - name similarity
  - keyword overlap in details
  - date proximity
  - location proximity if relevant
  - brand/color keywords where present
- Show top suggestions automatically:
  - after submitting a lost item
  - after submitting a found item
  - on item detail pages
- Display reasons for each suggestion such as:
  - `Same category`
  - `Same keyword: iPhone`
  - `Reported within 1 day`
- Keep final matching manual and explicit.

#### Why This Is Best

- It improves recovery rates without automating risky decisions.
- It uses current matching functionality instead of replacing it.
- It pairs naturally with item categories and better filters.

### 7. Dropdown Categories For Amaanat, Lost, Found, And Filters

#### Problem

Free-text item names create inconsistent data and weak filtering.

#### Optimal Solution

- Add a central `item_categories` table with:
  - label
  - slug
  - workflow availability
  - sort order
  - active flag
- Add category selection to:
  - Amaanat item form
  - lost item form
  - found item form
  - lost/found filters
  - dashboard analytics
- Keep a free-text custom field for exceptions:
  - category dropdown
  - optional custom item name
- Build the initial category list from last year’s real production data, not from guesswork.
- Suggested starter categories if needed before analysis:
  - Phone
  - Keys
  - Bag
  - Suitcase
  - Wallet
  - Passport / Documents
  - Clothing
  - Bottle
  - Electronics
  - Jewellery
  - Other

#### Why This Is Best

- It improves search, matching, dashboards, and storage assignment at the same time.
- It still allows unusual items to be entered safely.

### 8. Printable Found Items Report

#### Problem

Staff currently need to prepare end-of-event reports manually.

#### Optimal Solution

- Add an admin action: `Print unreturned found items report`.
- Generate a print-friendly HTML page grouped by:
  - category
  - storage location
  - age if useful
- Include summary totals at the top:
  - total unreturned found items
  - totals by category
  - totals by storage zone
- Reuse the Electron print path already used for Amaanat receipts, but target A4-style report output rather than receipt output.

#### Why This Is Best

- It fits the current Electron architecture.
- It removes a manual operational task.

### 9. Better Dashboard And Analysis

#### Problem

The dashboard currently shows only a small set of counts and no operational breakdowns.

#### Optimal Solution

- Replace the current dashboard with an operations dashboard that includes:
  - lost reported
  - lost matched
  - found reported
  - found returned
  - found matched to lost
  - lost reported and later returned
  - current Amaanat stored
  - current found inventory still held
- Add category breakdown tables for:
  - lost items
  - found items
  - returned found items
  - current open found inventory
- Add aging views:
  - found items older than X days
  - unmatched lost items older than X days
- Add operational views:
  - top categories
  - busiest desks if needed later
  - storage utilization by rack/zone

#### Why This Is Best

- It turns the dashboard into a decision-making tool instead of a vanity count page.

## Recommended Implementation Order

The best order is to build shared foundations first, then the device-specific flows.

1. Finalize production data export from last year.
2. Define the category taxonomy.
3. Redesign the location data model.
4. Migrate Amaanat locations onto the new storage model.
5. Reuse that model for found item storage.
6. Add settings-controlled self-serve mode with passcode protection.
7. Add scanner-first AIMS lookup and barcode/QR printing.
8. Optimize the Amaanat staff workflow for tablets.
9. Build the lost property self-serve tablet flow.
10. Add automatic lost/found match suggestions.
11. Add printable unreturned found-items reporting.
12. Replace the dashboard with operational analytics.

## Implementation Checklist

### Phase 1: Discovery And Data Design

- [ ] Export last year’s real production item data.
- [ ] Count the top item names for Amaanat, lost, and found workflows separately.
- [ ] Decide the first category taxonomy and confirm it with operations staff.
- [ ] Confirm the scanner setup and verify keyboard-wedge behavior with the Tera D5100 scanner.
- [ ] Configure self-serve tablets to run the Electron app directly, matching the previous Surface tablet setup.

### Phase 2: Shared Data Model Changes

- [ ] Add `item_categories` schema and seed data.
- [ ] Add category fields to Amaanat items, lost items, and found items.
- [ ] Add structured storage entities:
  - [ ] `storage_zones`
  - [ ] `storage_racks`
  - [ ] `storage_locations`
- [ ] Add workflow and optional category restrictions to storage locations.
- [ ] Add migration logic from existing Amaanat numeric locations to the new structured format.
- [ ] Replace free-text found storage with structured storage references.

### Phase 3: Device Modes And Scanner Support

- [x] Add a `Self serve enable` button to settings.
- [x] Require passcode `lost2026` before entering self-serve mode.
- [x] Add route guards and a kiosk layout without sidebar/navigation.
- [x] Add an `Exit self serve` action inside the kiosk view.
- [x] Require passcode `lost2026` before leaving self-serve mode.
- [x] Add inactivity reset behavior for kiosk screens.
- [ ] Add barcode or QR output to Amaanat receipts using the AIMS number.
- [ ] Add scanner-aware search input with auto-submit on scan completion.

### Phase 4: Workflow UX

- [ ] Optimize the existing Amaanat staff workflow for tablet use.
- [ ] Make the AIMS lookup field scanner-first in the staff workflow.
- [x] Build the lost-property self-serve kiosk page.
- [x] Restrict the self-serve kiosk page to lost-item creation only.
- [x] Add clear success and restart states for public use.
- [x] Add category dropdown + custom item entry to lost item forms.
- [x] Add category dropdown + custom item entry to found item forms.
- [x] Add category dropdown + custom item entry to Amaanat item forms.
- [ ] Add category filters to lost and found list pages.
- [ ] Add category filters to Amaanat list pages.
- [ ] Add next available storage suggestions to found-item entry.

### Phase 5: Matching And Reporting

- [ ] Add normalized candidate suggestion logic for lost/found matching.
- [ ] Show top match suggestions on create and detail screens.
- [ ] Add manual confirm-match actions from suggestion results.
- [ ] Add admin print view for all unreturned found items.
- [ ] Add grouped totals in the print report by category and storage location.

### Phase 6: Analytics

- [ ] Replace current dashboard queries with aggregated operational queries.
- [ ] Add KPI cards for lost, found, matched, returned, and open inventory.
- [ ] Add category breakdown tables/charts.
- [ ] Add storage utilization reporting by rack and zone.
- [ ] Add aging views for stale unmatched or unreturned items.

## Notes And Constraints

- Do not build a separate found-item location engine. Reuse one structured storage model across workflows.
- Do not make matching automatic. Suggestions should be ranked, but staff should confirm the actual match.
- Do not rely on free-text item names for analytics. Use categories plus optional free text.
- The current agreed self-serve passcode is `lost2026`. Treat it as an operational placeholder that can be moved into configuration later if needed.
- Start scanner work against the existing AIMS field first, then decide whether receipt rescanning needs anything beyond AIMS-based barcode/QR output.
- The checked-in sample SQLite data is too small to derive a real category taxonomy, so the production export step is mandatory.
