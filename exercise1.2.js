/**
 * Exercise 1.2: Library Seat & Equipment Booking Simulator
 * Logic, State Management, Interactive Floor Map & Real-time Recalibration
 */

(function () {
  'use strict';

  // --- Initial System Capacities & Stock ---
  const INITIAL_CAPACITY = {
    "Study Table": 12,
    "Computer Desk": 8,
    "Private Cabin": 4
  };

  const INITIAL_STOCK = {
    "Laptop": 6,
    "Projector": 3,
    "Camera": 2,
    "Microphone": 5
  };

  const SEAT_PREFIXES = {
    "Study Table": "ST",
    "Computer Desk": "CD",
    "Private Cabin": "PC"
  };

  const SEAT_ICONS = {
    "Study Table": "📖",
    "Computer Desk": "🖥️",
    "Private Cabin": "🔒"
  };

  const EQUIPMENT_ICONS = {
    "Laptop": "💻",
    "Projector": "📽️",
    "Camera": "📷",
    "Microphone": "🎙️"
  };

  // --- Application State ---
  let seatCapacity = { ...INITIAL_CAPACITY };
  let equipmentStock = { ...INITIAL_STOCK };
  let bookings = [];
  let selectedSeatCode = null;
  let activeSeatFilter = 'all';

  // --- DOM Elements Cache ---
  const elements = {
    // Top Stats
    statTotalBookings: document.getElementById('statTotalBookings'),
    statActiveStudents: document.getElementById('statActiveStudents'),
    statSeatsLeft: document.getElementById('statSeatsLeft'),
    statSeatsTotal: document.getElementById('statSeatsTotal'),
    statEquipmentLeft: document.getElementById('statEquipmentLeft'),
    statEquipmentTotal: document.getElementById('statEquipmentTotal'),
    statUtilization: document.getElementById('statUtilization'),
    utilizationStatus: document.getElementById('utilizationStatus'),
    bookingProgressBar: document.getElementById('bookingProgressBar'),
    seatsProgressBar: document.getElementById('seatsProgressBar'),
    equipmentProgressBar: document.getElementById('equipmentProgressBar'),
    utilizationProgressBar: document.getElementById('utilizationProgressBar'),

    // Live Clock & Theme
    currentTime: document.getElementById('currentTime'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    resetDataBtn: document.getElementById('resetDataBtn'),

    // Form Inputs
    bookingForm: document.getElementById('bookingForm'),
    studentName: document.getElementById('studentName'),
    studentId: document.getElementById('studentId'),
    seatType: document.getElementById('seatType'),
    equipmentType: document.getElementById('equipmentType'),
    equipmentQty: document.getElementById('equipmentQty'),
    bookingDuration: document.getElementById('bookingDuration'),
    selectedSeatStockPill: document.getElementById('selectedSeatStockPill'),
    selectedEquipmentStockPill: document.getElementById('selectedEquipmentStockPill'),
    qtyDecrementBtn: document.getElementById('qtyDecrementBtn'),
    qtyIncrementBtn: document.getElementById('qtyIncrementBtn'),
    clearFormBtn: document.getElementById('clearFormBtn'),

    // Inventory & Floor Map
    inventoryMonitorList: document.getElementById('inventoryMonitorList'),
    seatGridContainer: document.getElementById('seatGridContainer'),
    seatFilterTabs: document.querySelectorAll('.seat-tab'),

    // Table & Filters
    bookingsTable: document.getElementById('bookingsTable'),
    bookingsTableBody: document.getElementById('bookingsTableBody'),
    tableEmptyState: document.getElementById('tableEmptyState'),
    tableRecordCount: document.getElementById('tableRecordCount'),
    recordSearchInput: document.getElementById('recordSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterSeatSelect: document.getElementById('filterSeatSelect'),
    filterEquipmentSelect: document.getElementById('filterEquipmentSelect'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    printReportBtn: document.getElementById('printReportBtn'),
    clearAllBookingsBtn: document.getElementById('clearAllBookingsBtn'),

    // Modal
    bookingDetailModal: document.getElementById('bookingDetailModal'),
    modalStudentName: document.getElementById('modalStudentName'),
    modalCardBody: document.getElementById('modalCardBody'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCloseActionBtn: document.getElementById('modalCloseActionBtn'),
    modalPrintPassBtn: document.getElementById('modalPrintPassBtn'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Initialize App ---
  function init() {
    loadSavedTheme();
    loadSampleDataIfEmpty();
    bindEvents();
    startLiveClock();
    recalculateState();
    renderAll();
  }

  // --- Seed Demo Data for Live Impression ---
  function loadSampleDataIfEmpty() {
    const saved = localStorage.getItem('libsphere_bookings');
    if (saved) {
      try {
        bookings = JSON.parse(saved);
        // Recalibrate stocks based on saved bookings
        recalibrateInventoryFromBookings();
        return;
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    }

    // Default starter bookings
    bookings = [
      {
        id: "LIB-1001",
        name: "Aarav Sharma",
        studentId: "CS-2026-104",
        seat: "Study Table",
        seatNumber: "ST-01",
        equipment: "Laptop",
        qty: 1,
        duration: "4 Hours",
        timestamp: "14-10-2026 14:30"
      },
      {
        id: "LIB-1002",
        name: "Chloe Bennett",
        studentId: "IT-2026-088",
        seat: "Computer Desk",
        seatNumber: "CD-01",
        equipment: "Microphone",
        qty: 1,
        duration: "2 Hours",
        timestamp: "14-10-2026 15:15"
      },
      {
        id: "LIB-1003",
        name: "Rohan Varma",
        studentId: "ME-2026-210",
        seat: "Private Cabin",
        seatNumber: "PC-01",
        equipment: "Projector",
        qty: 1,
        duration: "Full Day",
        timestamp: "14-10-2026 16:00"
      }
    ];

    recalibrateInventoryFromBookings();
    saveToStorage();
  }

  function recalibrateInventoryFromBookings() {
    // Reset to full capacity
    seatCapacity = { ...INITIAL_CAPACITY };
    equipmentStock = { ...INITIAL_STOCK };

    bookings.forEach(b => {
      if (seatCapacity[b.seat] !== undefined) {
        seatCapacity[b.seat] = Math.max(0, seatCapacity[b.seat] - 1);
      }
      if (equipmentStock[b.equipment] !== undefined) {
        equipmentStock[b.equipment] = Math.max(0, equipmentStock[b.equipment] - b.qty);
      }
    });
  }

  function saveToStorage() {
    try {
      localStorage.setItem('libsphere_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  // --- Live Clock ---
  function startLiveClock() {
    function updateClock() {
      const now = new Date();
      elements.currentTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // --- Theme Toggle ---
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem('libsphere_theme') || 'theme-light';
    document.body.className = savedTheme;
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    const newTheme = isDark ? 'theme-light' : 'theme-dark';
    document.body.className = newTheme;
    localStorage.setItem('libsphere_theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    if (elements.themeIcon) {
      elements.themeIcon.textContent = theme === 'theme-dark' ? '☀️' : '🌙';
    }
  }

  // --- Recalculation & Metrics ---
  function recalculateState() {
    const totalBookingsCount = bookings.length;
    const totalMaxSeats = Object.values(INITIAL_CAPACITY).reduce((a, b) => a + b, 0);
    const seatsRemaining = Object.values(seatCapacity).reduce((a, b) => a + b, 0);

    const totalMaxEquipment = Object.values(INITIAL_STOCK).reduce((a, b) => a + b, 0);
    const equipmentRemaining = Object.values(equipmentStock).reduce((a, b) => a + b, 0);

    const uniqueStudents = new Set(bookings.map(b => b.name.toLowerCase())).size;
    const utilizationRate = Math.round(((totalMaxSeats - seatsRemaining) / totalMaxSeats) * 100);

    // Update KPI UI
    elements.statTotalBookings.textContent = totalBookingsCount;
    elements.statActiveStudents.textContent = `${uniqueStudents} Active Student${uniqueStudents === 1 ? '' : 's'}`;
    elements.bookingProgressBar.style.width = `${Math.min(100, (totalBookingsCount / totalMaxSeats) * 100)}%`;

    elements.statSeatsLeft.textContent = seatsRemaining;
    elements.statSeatsTotal.textContent = `of ${totalMaxSeats} total`;
    elements.seatsProgressBar.style.width = `${(seatsRemaining / totalMaxSeats) * 100}%`;

    elements.statEquipmentLeft.textContent = equipmentRemaining;
    elements.statEquipmentTotal.textContent = `of ${totalMaxEquipment} in stock`;
    elements.equipmentProgressBar.style.width = `${(equipmentRemaining / totalMaxEquipment) * 100}%`;

    elements.statUtilization.textContent = `${utilizationRate}%`;
    elements.utilizationProgressBar.style.width = `${utilizationRate}%`;

    if (utilizationRate >= 80) {
      elements.utilizationStatus.textContent = 'High Demand';
      elements.utilizationStatus.className = 'metric-tag tag-blue';
    } else if (utilizationRate >= 40) {
      elements.utilizationStatus.textContent = 'Moderate Flow';
      elements.utilizationStatus.className = 'metric-tag tag-amber';
    } else {
      elements.utilizationStatus.textContent = 'Plenty Space';
      elements.utilizationStatus.className = 'metric-tag tag-emerald';
    }

    updatePillBadges();
  }

  function updatePillBadges() {
    const curSeat = elements.seatType.value;
    const curSeatLeft = seatCapacity[curSeat] ?? 0;
    elements.selectedSeatStockPill.textContent = `Available: ${curSeatLeft}`;
    elements.selectedSeatStockPill.className = 'stock-pill' + (curSeatLeft === 0 ? ' empty' : curSeatLeft <= 2 ? ' low' : '');

    const curEq = elements.equipmentType.value;
    const curEqLeft = equipmentStock[curEq] ?? 0;
    elements.selectedEquipmentStockPill.textContent = `Stock: ${curEqLeft}`;
    elements.selectedEquipmentStockPill.className = 'stock-pill' + (curEqLeft === 0 ? ' empty' : curEqLeft <= 2 ? ' low' : '');
  }

  // --- Render Equipment Inventory Monitor ---
  function renderInventoryMonitor() {
    elements.inventoryMonitorList.innerHTML = '';

    Object.keys(INITIAL_STOCK).forEach(gear => {
      const total = INITIAL_STOCK[gear];
      const available = equipmentStock[gear] ?? 0;
      const pct = Math.round((available / total) * 100);

      let barColor = 'var(--emerald-gradient)';
      let statusClass = 'text-emerald';
      if (pct === 0) {
        barColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        statusClass = 'text-rose';
      } else if (pct <= 40) {
        barColor = 'var(--amber-gradient)';
        statusClass = 'text-amber';
      }

      const item = document.createElement('div');
      item.className = 'inventory-item';
      item.innerHTML = `
        <div class="inventory-item-header">
          <div class="inventory-gear-name">
            <span>${EQUIPMENT_ICONS[gear] || '📦'}</span>
            <span>${gear}</span>
          </div>
          <span class="inventory-stock-count ${statusClass}">${available} / ${total} left</span>
        </div>
        <div class="inventory-track">
          <div class="inventory-fill" style="width: ${pct}%; background: ${barColor}"></div>
        </div>
      `;
      elements.inventoryMonitorList.appendChild(item);
    });
  }

  // --- Render Interactive Visual Floor Map ---
  function renderFloorMap() {
    elements.seatGridContainer.innerHTML = '';

    // Collect all seats across zones
    const allSeats = [];
    Object.keys(INITIAL_CAPACITY).forEach(zone => {
      const count = INITIAL_CAPACITY[zone];
      const prefix = SEAT_PREFIXES[zone];
      for (let i = 1; i <= count; i++) {
        const numStr = String(i).padStart(2, '0');
        const seatCode = `${prefix}-${numStr}`;
        allSeats.push({
          code: seatCode,
          zone: zone,
          index: i
        });
      }
    });

    // Map occupied seats
    const occupiedMap = new Map();
    bookings.forEach(b => {
      if (b.seatNumber) {
        occupiedMap.set(b.seatNumber, b);
      }
    });

    const filteredSeats = allSeats.filter(s => activeSeatFilter === 'all' || s.zone === activeSeatFilter);

    filteredSeats.forEach(s => {
      const isOccupied = occupiedMap.has(s.code);
      const isSelected = selectedSeatCode === s.code;
      const bookingData = occupiedMap.get(s.code);

      const pod = document.createElement('button');
      pod.type = 'button';
      pod.className = `seat-pod ${isOccupied ? 'occupied' : 'available'} ${isSelected ? 'selected' : ''}`;
      pod.dataset.seatCode = s.code;
      pod.dataset.zone = s.zone;

      if (isOccupied) {
        pod.title = `Booked by: ${bookingData.name} (${bookingData.duration})`;
      } else {
        pod.title = `Click to choose ${s.zone} (${s.code})`;
      }

      pod.innerHTML = `
        <span class="seat-pod-icon">${SEAT_ICONS[s.zone] || '🪑'}</span>
        <span class="seat-pod-label">${s.code}</span>
        <span class="seat-pod-zone">${s.zone}</span>
        <span class="seat-pod-status ${isOccupied ? 'status-booked' : 'status-free'}">
          ${isOccupied ? 'Occupied' : 'Available'}
        </span>
      `;

      if (!isOccupied) {
        pod.addEventListener('click', () => {
          selectSeatPod(s.code, s.zone);
        });
      }

      elements.seatGridContainer.appendChild(pod);
    });
  }

  function selectSeatPod(seatCode, zone) {
    selectedSeatCode = seatCode;
    elements.seatType.value = zone;
    updatePillBadges();
    renderFloorMap();
    showToast(`Workstation ${seatCode} (${zone}) selected!`, 'info');
  }

  // --- Assign Next Available Seat in Zone ---
  function getNextAvailableSeatCode(zone) {
    const count = INITIAL_CAPACITY[zone];
    const prefix = SEAT_PREFIXES[zone];
    const occupiedSeats = new Set(bookings.map(b => b.seatNumber));

    // If user clicked a specific seat pod in that zone
    if (selectedSeatCode && selectedSeatCode.startsWith(prefix) && !occupiedSeats.has(selectedSeatCode)) {
      return selectedSeatCode;
    }

    for (let i = 1; i <= count; i++) {
      const code = `${prefix}-${String(i).padStart(2, '0')}`;
      if (!occupiedSeats.has(code)) {
        return code;
      }
    }
    return `${prefix}-01`;
  }

  // --- Render Bookings Table ---
  function renderBookingsTable() {
    const searchTerm = elements.recordSearchInput.value.trim().toLowerCase();
    const filterSeat = elements.filterSeatSelect.value;
    const filterEq = elements.filterEquipmentSelect.value;

    const filtered = bookings.filter(b => {
      const matchSearch = !searchTerm ||
        b.name.toLowerCase().includes(searchTerm) ||
        (b.studentId && b.studentId.toLowerCase().includes(searchTerm)) ||
        b.seat.toLowerCase().includes(searchTerm) ||
        b.seatNumber.toLowerCase().includes(searchTerm) ||
        b.equipment.toLowerCase().includes(searchTerm) ||
        b.id.toLowerCase().includes(searchTerm);

      const matchSeat = filterSeat === 'all' || b.seat === filterSeat;
      const matchEq = filterEq === 'all' || b.equipment === filterEq;

      return matchSearch && matchSeat && matchEq;
    });

    elements.bookingsTableBody.innerHTML = '';

    if (filtered.length === 0) {
      elements.tableEmptyState.classList.remove('hidden');
      elements.bookingsTable.classList.add('hidden');
      elements.tableRecordCount.textContent = 'Showing 0 reservations';
      return;
    }

    elements.tableEmptyState.classList.add('hidden');
    elements.bookingsTable.classList.remove('hidden');
    elements.tableRecordCount.textContent = `Showing ${filtered.length} of ${bookings.length} reservation${bookings.length === 1 ? '' : 's'}`;

    filtered.forEach(b => {
      const tr = document.createElement('tr');

      const initials = b.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      tr.innerHTML = `
        <td><span class="ref-code">${b.id}</span></td>
        <td>
          <div class="student-col">
            <div class="student-avatar">${initials}</div>
            <div class="student-info">
              <span class="student-name">${escapeHtml(b.name)}</span>
              <span class="student-id-sub">${b.studentId ? escapeHtml(b.studentId) : 'Regular Visitor'}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="seat-category-pill">
            <span>${SEAT_ICONS[b.seat] || '🪑'}</span>
            <span>${b.seat}</span>
            <strong class="font-mono">(${b.seatNumber})</strong>
          </span>
        </td>
        <td>
          <span class="equipment-badge">
            <span>${EQUIPMENT_ICONS[b.equipment] || '💻'}</span>
            <span>${b.equipment}</span>
            <span class="qty-counter">x${b.qty}</span>
          </span>
        </td>
        <td>
          <span class="time-stamp">${b.timestamp}</span>
        </td>
        <td>
          <span class="status-badge-active">🟢 Active (${b.duration})</span>
        </td>
        <td class="text-right">
          <div class="action-btn-group">
            <button type="button" class="table-action-btn view" data-action="view" data-id="${b.id}" title="View Pass">Pass</button>
            <button type="button" class="table-action-btn release" data-action="release" data-id="${b.id}" title="Release reservation & return hardware">Release</button>
          </div>
        </td>
      `;

      elements.bookingsTableBody.appendChild(tr);
    });
  }

  function renderAll() {
    recalculateState();
    renderInventoryMonitor();
    renderFloorMap();
    renderBookingsTable();
  }

  // --- Booking Form Submission ---
  function handleBookingSubmit(e) {
    e.preventDefault();

    const name = elements.studentName.value.trim();
    const studentIdVal = elements.studentId.value.trim();
    const seat = elements.seatType.value;
    const equipment = elements.equipmentType.value;
    const qtyRaw = elements.equipmentQty.value.trim();
    const duration = elements.bookingDuration.value;

    // 1. Validate Name
    if (!name || name.length < 2) {
      highlightInvalid(elements.studentName, 'Please enter a valid student name (minimum 2 letters).');
      return;
    }

    // 2. Validate Quantity
    const qty = parseInt(qtyRaw, 10);
    if (isNaN(qty) || qty <= 0) {
      highlightInvalid(elements.equipmentQty, 'Quantity must be a positive number.');
      return;
    }

    // 3. Check Seat Capacity
    if ((seatCapacity[seat] ?? 0) <= 0) {
      showToast(`No seats left in "${seat}". Please choose a different category.`, 'error');
      return;
    }

    // 4. Check Equipment Stock
    const availableStock = equipmentStock[equipment] ?? 0;
    if (qty > availableStock) {
      highlightInvalid(elements.equipmentQty, `Insufficient stock! Only ${availableStock} ${equipment}(s) available.`);
      return;
    }

    // 5. Allocate Seat Code
    const assignedSeatCode = getNextAvailableSeatCode(seat);

    // 6. Generate Booking Record
    const nextRefNumber = 1000 + bookings.length + 1;
    const newBooking = {
      id: `LIB-${nextRefNumber}`,
      name: name,
      studentId: studentIdVal || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      seat: seat,
      seatNumber: assignedSeatCode,
      equipment: equipment,
      qty: qty,
      duration: duration,
      timestamp: formatDateTime(new Date())
    };

    // 7. Update System State
    bookings.unshift(newBooking);
    seatCapacity[seat] -= 1;
    equipmentStock[equipment] -= qty;
    selectedSeatCode = null;

    saveToStorage();
    renderAll();
    resetForm();

    showToast(`Booking ${newBooking.id} confirmed for ${newBooking.name}! Assigned Seat: ${newBooking.seatNumber}`, 'success');
  }

  function highlightInvalid(inputElem, message) {
    inputElem.classList.add('is-invalid');
    inputElem.focus();
    showToast(message, 'error');
    setTimeout(() => {
      inputElem.classList.remove('is-invalid');
    }, 1500);
  }

  function resetForm() {
    elements.studentName.value = '';
    elements.studentId.value = '';
    elements.seatType.value = 'Study Table';
    elements.equipmentType.value = 'Laptop';
    elements.equipmentQty.value = '1';
    elements.bookingDuration.value = '2 Hours';
    selectedSeatCode = null;
    updatePillBadges();
    renderFloorMap();
  }

  // --- Release / Cancel Booking ---
  function releaseBooking(bookingId) {
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return;

    const b = bookings[index];
    if (!confirm(`Are you sure you want to release reservation ${b.id} for "${b.name}"?\nThis will return ${b.qty} ${b.equipment}(s) and free seat ${b.seatNumber}.`)) {
      return;
    }

    // Restock
    seatCapacity[b.seat] = Math.min(INITIAL_CAPACITY[b.seat], (seatCapacity[b.seat] ?? 0) + 1);
    equipmentStock[b.equipment] = Math.min(INITIAL_STOCK[b.equipment], (equipmentStock[b.equipment] ?? 0) + b.qty);

    bookings.splice(index, 1);
    saveToStorage();
    renderAll();
    showToast(`Reservation ${b.id} released. Resources returned to inventory.`, 'info');
  }

  // --- Show Detail Pass Modal ---
  function showBookingPass(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (!b) return;

    elements.modalStudentName.textContent = `Library Access Pass - ${b.id}`;
    elements.modalCardBody.innerHTML = `
      <div class="pass-card">
        <div class="pass-header">
          <span class="pass-ref">${b.id}</span>
          <span class="status-badge-active">Verified Active</span>
        </div>
        <div class="pass-details-grid">
          <div class="pass-field">
            <span class="pass-field-label">Student Name</span>
            <span class="pass-field-value">${escapeHtml(b.name)}</span>
          </div>
          <div class="pass-field">
            <span class="pass-field-label">Student ID</span>
            <span class="pass-field-value">${escapeHtml(b.studentId)}</span>
          </div>
          <div class="pass-field">
            <span class="pass-field-label">Assigned Station</span>
            <span class="pass-field-value">${SEAT_ICONS[b.seat] || '🪑'} ${b.seat} (${b.seatNumber})</span>
          </div>
          <div class="pass-field">
            <span class="pass-field-label">Hardware Checked-out</span>
            <span class="pass-field-value">${EQUIPMENT_ICONS[b.equipment] || '💻'} ${b.qty}x ${b.equipment}</span>
          </div>
          <div class="pass-field">
            <span class="pass-field-label">Duration</span>
            <span class="pass-field-value">⏱️ ${b.duration}</span>
          </div>
          <div class="pass-field">
            <span class="pass-field-label">Issued At</span>
            <span class="pass-field-value">${b.timestamp}</span>
          </div>
        </div>
      </div>
    `;

    elements.bookingDetailModal.classList.remove('hidden');
  }

  function hideModal() {
    elements.bookingDetailModal.classList.add('hidden');
  }

  // --- Export CSV ---
  function exportBookingsToCSV() {
    if (bookings.length === 0) {
      showToast('No booking records to export.', 'info');
      return;
    }

    const headers = ["Reference ID", "Student Name", "Student ID", "Seat Type", "Seat Number", "Equipment", "Quantity", "Duration", "Timestamp"];
    const rows = bookings.map(b => [
      `"${b.id}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${(b.studentId || '').replace(/"/g, '""')}"`,
      `"${b.seat}"`,
      `"${b.seatNumber}"`,
      `"${b.equipment}"`,
      b.qty,
      `"${b.duration}"`,
      `"${b.timestamp}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Library_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV manifest exported successfully!', 'success');
  }

  // --- Clear All Bookings ---
  function clearAllBookings() {
    if (bookings.length === 0) {
      showToast('No bookings to clear.', 'info');
      return;
    }

    if (!confirm('Are you sure you want to release ALL current reservations?\nAll seats and equipment will be restored to 100% capacity.')) {
      return;
    }

    bookings = [];
    seatCapacity = { ...INITIAL_CAPACITY };
    equipmentStock = { ...INITIAL_STOCK };
    selectedSeatCode = null;

    saveToStorage();
    renderAll();
    showToast('All bookings released. Inventory fully restored.', 'info');
  }

  // --- Toast System ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    const title = type === 'success' ? 'Success' : type === 'error' ? 'Notice' : 'Information';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="toast-close" aria-label="Close notification">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- Helper Utilities ---
  function formatDateTime(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Theme & Reset
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    elements.resetDataBtn.addEventListener('click', () => {
      if (confirm('Reset simulator to default sample data?')) {
        localStorage.removeItem('libsphere_bookings');
        loadSampleDataIfEmpty();
        resetForm();
        renderAll();
        showToast('Simulator restored to default state.', 'info');
      }
    });

    // Form
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);
    elements.clearFormBtn.addEventListener('click', resetForm);

    elements.seatType.addEventListener('change', () => {
      updatePillBadges();
      renderFloorMap();
    });

    elements.equipmentType.addEventListener('change', updatePillBadges);

    // Quantity Stepper
    elements.qtyDecrementBtn.addEventListener('click', () => {
      let val = parseInt(elements.equipmentQty.value, 10) || 1;
      if (val > 1) {
        elements.equipmentQty.value = val - 1;
      }
    });

    elements.qtyIncrementBtn.addEventListener('click', () => {
      let val = parseInt(elements.equipmentQty.value, 10) || 1;
      const maxAvailable = equipmentStock[elements.equipmentType.value] ?? 10;
      if (val < maxAvailable) {
        elements.equipmentQty.value = val + 1;
      } else {
        showToast(`Cannot exceed currently available stock (${maxAvailable}).`, 'error');
      }
    });

    // Floor Map Filter Tabs
    elements.seatFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.seatFilterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeSeatFilter = tab.dataset.filter;
        renderFloorMap();
      });
    });

    // Search & Filter Table
    elements.recordSearchInput.addEventListener('input', renderBookingsTable);
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.recordSearchInput.value = '';
      renderBookingsTable();
    });
    elements.filterSeatSelect.addEventListener('change', renderBookingsTable);
    elements.filterEquipmentSelect.addEventListener('change', renderBookingsTable);

    // Table Actions (delegated)
    elements.bookingsTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === 'release') {
        releaseBooking(id);
      } else if (action === 'view') {
        showBookingPass(id);
      }
    });

    // Toolbar Buttons
    elements.exportCsvBtn.addEventListener('click', exportBookingsToCSV);
    elements.printReportBtn.addEventListener('click', () => window.print());
    elements.clearAllBookingsBtn.addEventListener('click', clearAllBookings);

    // Modal Events
    elements.modalCloseBtn.addEventListener('click', hideModal);
    elements.modalCloseActionBtn.addEventListener('click', hideModal);
    elements.bookingDetailModal.addEventListener('click', (e) => {
      if (e.target === elements.bookingDetailModal) hideModal();
    });
    elements.modalPrintPassBtn.addEventListener('click', () => window.print());
  }

  // Run!
  document.addEventListener('DOMContentLoaded', init);
})();
