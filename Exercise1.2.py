import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime


class LibraryBookingApp(tk.Tk):
    """
    Exercise 1.2: Library Seat & Equipment Booking Simulator
    Enhanced Tkinter UI with Live Recalibration, Inventory Tracking & Search
    """
    def __init__(self):
        super().__init__()
        self.title("Library Seat & Equipment Booking Simulator | Exercise 1.2")
        self.geometry("1060x680")
        self.minsize(980, 620)
        self.configure(bg="#f1f5f9")

        # Inventory configurations
        self.max_seat_capacity = {"Study Table": 12, "Computer Desk": 8, "Private Cabin": 4}
        self.seat_capacity = dict(self.max_seat_capacity)

        self.max_equipment_stock = {"Laptop": 6, "Projector": 3, "Camera": 2, "Microphone": 5}
        self.equipment_stock = dict(self.max_equipment_stock)

        self.bookings = [
            {
                "id": "LIB-1001",
                "name": "Aarav Sharma",
                "seat": "Study Table",
                "equipment": "Laptop",
                "qty": 1,
                "time": "14-10-2026 14:30"
            },
            {
                "id": "LIB-1002",
                "name": "Chloe Bennett",
                "seat": "Computer Desk",
                "equipment": "Microphone",
                "qty": 1,
                "time": "14-10-2026 15:15"
            }
        ]

        # Recalibrate initial stock for preloaded sample records
        for b in self.bookings:
            self.seat_capacity[b["seat"]] = max(0, self.seat_capacity[b["seat"]] - 1)
            self.equipment_stock[b["equipment"]] = max(0, self.equipment_stock[b["equipment"]] - b["qty"])

        self.setup_styles()
        self.build_ui()
        self.update_summary()
        self.update_table()

    def setup_styles(self):
        style = ttk.Style(self)
        style.theme_use("clam")

        # Treeview styling
        style.configure(
            "Treeview",
            background="#ffffff",
            foreground="#0f172a",
            rowheight=28,
            fieldbackground="#ffffff",
            font=("Segoe UI", 9)
        )
        style.configure(
            "Treeview.Heading",
            background="#e2e8f0",
            foreground="#1e293b",
            font=("Segoe UI", 10, "bold"),
            relief="flat"
        )
        style.map("Treeview", background=[("selected", "#2563eb")], foreground=[("selected", "#ffffff")])

        # Combobox styling
        style.configure("TCombobox", padding=4, font=("Segoe UI", 9))

    def build_ui(self):
        # Header banner
        header = tk.Frame(self, bg="#ffffff", bd=1, relief="solid")
        header.pack(fill="x", padx=16, pady=(14, 10))

        brand_frame = tk.Frame(header, bg="#ffffff", padx=14, pady=10)
        brand_frame.pack(side="left", fill="both")

        tk.Label(brand_frame, text="📚 Library Booking System", font=("Segoe UI", 18, "bold"), bg="#ffffff", fg="#0f172a").pack(anchor="w")
        tk.Label(brand_frame, text="Real-time Seat & Equipment Reservation Simulator • Exercise 1.2", font=("Segoe UI", 9), bg="#ffffff", fg="#64748b").pack(anchor="w")

        # Metrics summary dashboard
        self.summary = tk.Frame(self, bg="#f1f5f9")
        self.summary.pack(fill="x", padx=16, pady=(0, 10))

        self.summary_labels = {}
        cards_config = [
            ("Total Bookings", "booking", "#2563eb", "📋"),
            ("Seats Available", "seat", "#059669", "🪑"),
            ("Equipment Stock", "equipment", "#7c3aed", "💻"),
            ("Utilization Rate", "utilization", "#d97706", "⚡")
        ]

        for i, (text, key, color, icon) in enumerate(cards_config):
            card = tk.Frame(self.summary, bg=color, padx=14, pady=10, relief="flat")
            card.grid(row=0, column=i, padx=4, pady=2, sticky="nsew")

            top_row = tk.Frame(card, bg=color)
            top_row.pack(fill="x")
            tk.Label(top_row, text=text, bg=color, fg="#ffffff", font=("Segoe UI", 9, "bold")).pack(side="left")
            tk.Label(top_row, text=icon, bg=color, fg="#ffffff", font=("Segoe UI", 11)).pack(side="right")

            lbl = tk.Label(card, text="0", bg=color, fg="#ffffff", font=("Segoe UI", 18, "bold"))
            lbl.pack(anchor="w", pady=(4, 0))
            self.summary_labels[key] = lbl

        for i in range(len(cards_config)):
            self.summary.grid_columnconfigure(i, weight=1)

        # Workspace split (Left: Form, Right: Records Table)
        workspace = tk.Frame(self, bg="#f1f5f9")
        workspace.pack(fill="both", expand=True, padx=16, pady=(0, 14))

        # --- Left: Booking Form Frame ---
        left = tk.LabelFrame(workspace, text=" ✍️ Reservation Form ", font=("Segoe UI", 11, "bold"), padx=14, pady=12, bg="#ffffff", fg="#0f172a", bd=1)
        left.pack(side="left", fill="y", padx=(0, 10))

        fields = [
            ("Student Name", "name"),
            ("Seat Type", "seat"),
            ("Equipment", "equipment"),
            ("Quantity", "qty"),
        ]

        self.vars = {}
        self.stock_info_labels = {}

        for row, (label_text, key) in enumerate(fields):
            tk.Label(left, text=label_text, font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#334155").grid(row=row * 2, column=0, sticky="w", pady=(8, 2), padx=(0, 8))

            if key == "seat":
                var = tk.StringVar(value="Study Table")
                box = ttk.Combobox(left, textvariable=var, values=list(self.max_seat_capacity.keys()), state="readonly", width=22)
                box.grid(row=row * 2 + 1, column=0, sticky="ew", pady=(0, 4))
                box.bind("<<ComboboxSelected>>", lambda e: self.update_form_hints())

                info = tk.Label(left, text="", font=("Segoe UI", 8), bg="#ffffff", fg="#059669")
                info.grid(row=row * 2 + 1, column=1, sticky="w", padx=6)
                self.stock_info_labels["seat"] = info

            elif key == "equipment":
                var = tk.StringVar(value="Laptop")
                box = ttk.Combobox(left, textvariable=var, values=list(self.max_equipment_stock.keys()), state="readonly", width=22)
                box.grid(row=row * 2 + 1, column=0, sticky="ew", pady=(0, 4))
                box.bind("<<ComboboxSelected>>", lambda e: self.update_form_hints())

                info = tk.Label(left, text="", font=("Segoe UI", 8), bg="#ffffff", fg="#7c3aed")
                info.grid(row=row * 2 + 1, column=1, sticky="w", padx=6)
                self.stock_info_labels["equipment"] = info

            else:
                var = tk.StringVar()
                if key == "qty":
                    var.set("1")
                entry = tk.Entry(left, textvariable=var, width=24, font=("Segoe UI", 9), bd=1, relief="solid")
                entry.grid(row=row * 2 + 1, column=0, sticky="ew", pady=(0, 4))
            self.vars[key] = var

        btns = tk.Frame(left, bg="#ffffff")
        btns.grid(row=9, column=0, columnspan=2, sticky="ew", pady=(16, 0))

        tk.Button(
            btns, text="✅ Book Now", command=self.add_booking,
            bg="#2563eb", fg="white", activebackground="#1d4ed8", activeforeground="white",
            font=("Segoe UI", 9, "bold"), relief="flat", cursor="hand2", padx=10, pady=6
        ).pack(side="left", padx=(0, 6), fill="x", expand=True)

        tk.Button(
            btns, text="🧹 Clear", command=self.clear_form,
            bg="#e2e8f0", fg="#0f172a", activebackground="#cbd5e1",
            font=("Segoe UI", 9, "bold"), relief="flat", cursor="hand2", padx=8, pady=6
        ).pack(side="left", fill="x", expand=True)

        # Inventory live stock box in left column
        inv_box = tk.LabelFrame(left, text=" 📦 Live Hardware Stock ", font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#475569", padx=8, pady=8)
        inv_box.grid(row=10, column=0, columnspan=2, sticky="ew", pady=(18, 0))

        self.gear_stock_labels = {}
        for idx, gear in enumerate(self.max_equipment_stock.keys()):
            row_f = tk.Frame(inv_box, bg="#ffffff")
            row_f.pack(fill="x", pady=2)
            tk.Label(row_f, text=gear, font=("Segoe UI", 8), bg="#ffffff", fg="#334155").pack(side="left")
            lbl = tk.Label(row_f, text="", font=("Segoe UI", 8, "bold"), bg="#ffffff", fg="#2563eb")
            lbl.pack(side="right")
            self.gear_stock_labels[gear] = lbl

        # --- Right: Booked Records Frame ---
        right = tk.LabelFrame(workspace, text=" 📑 Booked Records ", font=("Segoe UI", 11, "bold"), padx=12, pady=10, bg="#ffffff", fg="#0f172a", bd=1)
        right.pack(side="right", fill="both", expand=True)

        # Search & Action Toolbar
        toolbar = tk.Frame(right, bg="#ffffff")
        toolbar.pack(fill="x", pady=(0, 8))

        tk.Label(toolbar, text="🔍 Search:", font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#475569").pack(side="left", padx=(0, 4))
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *args: self.filter_table())
        search_entry = tk.Entry(toolbar, textvariable=self.search_var, width=20, font=("Segoe UI", 9), bd=1, relief="solid")
        search_entry.pack(side="left", padx=(0, 10))

        tk.Button(
            toolbar, text="🗑️ Release / Cancel Booking", command=self.cancel_selected_booking,
            bg="#fee2e2", fg="#dc2626", activebackground="#fca5a5",
            font=("Segoe UI", 8, "bold"), relief="flat", cursor="hand2", padx=8, pady=4
        ).pack(side="right")

        cols = ("Ref ID", "Name", "Seat", "Equipment", "Qty", "Time")
        self.tree = ttk.Treeview(right, columns=cols, show="headings", height=14)
        for col in cols:
            self.tree.heading(col, text=col)
            width = 75 if col in ("Ref ID", "Qty") else 140 if col == "Time" else 130
            self.tree.column(col, width=width, anchor="center")

        scrollbar = ttk.Scrollbar(right, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side="right", fill="y")
        self.tree.pack(fill="both", expand=True)

        # Status note at bottom
        self.status_bar = tk.Label(
            right, text="💡 Tip: Select any reservation row above and click 'Release / Cancel Booking' to restock items.",
            font=("Segoe UI", 8, "italic"), bg="#ffffff", fg="#64748b"
        )
        self.status_bar.pack(anchor="w", pady=(6, 0))

        self.update_form_hints()

    def update_form_hints(self):
        seat = self.vars["seat"].get()
        eq = self.vars["equipment"].get()
        seat_left = self.seat_capacity.get(seat, 0)
        eq_left = self.equipment_stock.get(eq, 0)

        if "seat" in self.stock_info_labels:
            self.stock_info_labels["seat"].configure(text=f"({seat_left} left)")
        if "equipment" in self.stock_info_labels:
            self.stock_info_labels["equipment"].configure(text=f"({eq_left} left)")

        for gear, lbl in self.gear_stock_labels.items():
            avail = self.equipment_stock.get(gear, 0)
            tot = self.max_equipment_stock.get(gear, 0)
            lbl.configure(text=f"{avail}/{tot} left")

    def clear_form(self):
        self.vars["name"].set("")
        self.vars["seat"].set("Study Table")
        self.vars["equipment"].set("Laptop")
        self.vars["qty"].set("1")
        self.update_form_hints()

    def add_booking(self):
        name = self.vars["name"].get().strip()
        seat = self.vars["seat"].get()
        equipment = self.vars["equipment"].get()
        qty = self.vars["qty"].get().strip()

        if not name or len(name) < 2:
            messagebox.showerror("Error", "Valid student name is required (min 2 characters).")
            return
        if not qty.isdigit() or int(qty) <= 0:
            messagebox.showerror("Error", "Quantity must be a positive number.")
            return

        qty = int(qty)

        # Check Seat Availability
        if self.seat_capacity.get(seat, 0) <= 0:
            messagebox.showerror("Capacity Full", f"No seats available for '{seat}'. Please select another workstation.")
            return

        # Check Equipment Availability
        available_equipment = self.equipment_stock.get(equipment, 0)
        if qty > available_equipment:
            messagebox.showerror("Stock Insufficient", f"Only {available_equipment} {equipment}(s) available in stock.")
            return

        # Assign booking ID
        ref_id = f"LIB-{1000 + len(self.bookings) + 1}"

        self.bookings.append({
            "id": ref_id,
            "name": name,
            "seat": seat,
            "equipment": equipment,
            "qty": qty,
            "time": datetime.now().strftime("%d-%m-%Y %H:%M")
        })

        # Decrement stock & capacity
        self.seat_capacity[seat] -= 1
        self.equipment_stock[equipment] -= qty

        self.update_table()
        self.update_summary()
        self.update_form_hints()
        self.clear_form()
        messagebox.showinfo("Success", f"Booking {ref_id} confirmed for {name}!")

    def cancel_selected_booking(self):
        selected_item = self.tree.selection()
        if not selected_item:
            messagebox.showwarning("Selection Required", "Please select a booking from the table to release.")
            return

        values = self.tree.item(selected_item[0], "values")
        ref_id = values[0]
        student_name = values[1]

        target_booking = next((b for b in self.bookings if b["id"] == ref_id), None)
        if not target_booking:
            return

        if messagebox.askyesno("Confirm Release", f"Release reservation {ref_id} for '{student_name}'?\nThis will return equipment and seat to inventory."):
            # Restore stock & capacity
            self.seat_capacity[target_booking["seat"]] = min(
                self.max_seat_capacity[target_booking["seat"]],
                self.seat_capacity[target_booking["seat"]] + 1
            )
            self.equipment_stock[target_booking["equipment"]] = min(
                self.max_equipment_stock[target_booking["equipment"]],
                self.equipment_stock[target_booking["equipment"]] + target_booking["qty"]
            )

            self.bookings = [b for b in self.bookings if b["id"] != ref_id]
            self.update_table()
            self.update_summary()
            self.update_form_hints()
            messagebox.showinfo("Released", f"Reservation {ref_id} released successfully.")

    def update_table(self):
        self.filter_table()

    def filter_table(self):
        for row in self.tree.get_children():
            self.tree.delete(row)

        search_query = self.search_var.get().strip().lower()

        for item in self.bookings:
            if (not search_query or
                search_query in item["name"].lower() or
                search_query in item["id"].lower() or
                search_query in item["seat"].lower() or
                search_query in item["equipment"].lower()):
                self.tree.insert("", "end", values=(
                    item["id"],
                    item["name"],
                    item["seat"],
                    item["equipment"],
                    item["qty"],
                    item["time"]
                ))

    def update_summary(self):
        total_bookings = len(self.bookings)
        total_max_seats = sum(self.max_seat_capacity.values())
        seats_left = sum(self.seat_capacity.values())
        eq_left = sum(self.equipment_stock.values())
        utilization = round(((total_max_seats - seats_left) / total_max_seats) * 100)

        self.summary_labels["booking"].configure(text=str(total_bookings))
        self.summary_labels["seat"].configure(text=f"{seats_left} / {total_max_seats}")
        self.summary_labels["equipment"].configure(text=str(eq_left))
        self.summary_labels["utilization"].configure(text=f"{utilization}%")


if __name__ == "__main__":
    app = LibraryBookingApp()
    app.mainloop()
