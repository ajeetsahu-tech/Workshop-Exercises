import csv
import re
import tkinter as tk
from pathlib import Path
from tkinter import messagebox, ttk


class EventRegistrationApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Campus Event Registration Portal")
        self.geometry("1280x760")
        self.minsize(1100, 680)
        self.configure(bg="#edf4ff")

        self.registrations = []
        self.current_user = ""
        self.login_credentials = {"admin": "admin123", "staff": "campus2026"}
        self.theme_mode = "light"

        self.main_container = tk.Frame(self, bg="#edf4ff")
        self.main_container.pack(fill="both", expand=True)

        self.login_frame = None
        self.dashboard_frame = None
        self.topbar = None
        self.content = None
        self.summary_frame = None
        self.main_panel = None
        self.form_frame = None
        self.list_frame = None
        self.filters_frame = None
        self.attendance_tree = None
        self.search_var = tk.StringVar()
        self.department_filter = tk.StringVar(value="All")
        self.event_filter = tk.StringVar(value="All")
        self.entry_vars = {}
        self.summary_labels = {}
        self.summary_cards = []
        self.dashboard_widgets = []
        self.user_label = None
        self.theme_toggle_button = None

        self.build_login_screen()

    def build_login_screen(self):
        self.login_frame = tk.Frame(self.main_container, bg="#eef4ff")
        self.login_frame.pack(fill="both", expand=True)

        gradient = tk.Canvas(self.login_frame, width=1280, height=760, highlightthickness=0, bg="#eef4ff")
        gradient.pack(fill="both", expand=True)
        gradient.create_rectangle(0, 0, 1280, 760, fill="#eef4ff", outline="")
        gradient.create_rectangle(0, 0, 540, 760, fill="#1d4ed8", outline="")
        gradient.create_rectangle(540, 0, 1280, 760, fill="#eef4ff", outline="")

        left_panel = tk.Frame(self.login_frame, bg="#1d4ed8")
        left_panel.place(x=0, y=0, width=540, height=760)

        tk.Label(left_panel, text="🏫 Campus Event Hub", font=("Segoe UI", 30, "bold"), fg="white", bg="#1d4ed8", pady=25).pack(anchor="center", pady=(140, 10))
        tk.Label(left_panel, text="Smart registration workflow for technical events", font=("Segoe UI", 15), fg="#dbeafe", bg="#1d4ed8", wraplength=340, justify="center").pack(anchor="center")

        for item in ["✅ Registration Validation", "🧾 Attendance Tracking", "🔍 Search & Filters", "📊 Live Dashboard Reports"]:
            tk.Label(left_panel, text=item, font=("Segoe UI", 13, "bold"), fg="white", bg="#1d4ed8", pady=8).pack(anchor="center")

        login_card = tk.Frame(self.login_frame, bg="white", bd=0, highlightthickness=0)
        login_card.place(relx=0.72, rely=0.5, anchor="center", width=420, height=410)

        tk.Label(login_card, text="Welcome Back", font=("Segoe UI", 26, "bold"), fg="#0f172a", bg="white").place(x=40, y=30)
        tk.Label(login_card, text="Sign in to manage event registrations", font=("Segoe UI", 11), fg="#475569", bg="white").place(x=40, y=76)

        tk.Label(login_card, text="Username", font=("Segoe UI", 10, "bold"), bg="white", fg="#334155").place(x=40, y=125)
        self.username_var = tk.StringVar(value="admin")
        tk.Entry(login_card, textvariable=self.username_var, width=32, font=("Segoe UI", 12), bd=1, relief="solid", highlightthickness=1, highlightbackground="#cbd5e1").place(x=40, y=150, width=340, height=40)

        tk.Label(login_card, text="Password", font=("Segoe UI", 10, "bold"), bg="white", fg="#334155").place(x=40, y=210)
        self.password_var = tk.StringVar(value="admin123")
        tk.Entry(login_card, textvariable=self.password_var, width=32, font=("Segoe UI", 12), show="*", bd=1, relief="solid", highlightthickness=1, highlightbackground="#cbd5e1").place(x=40, y=235, width=340, height=40)

        tk.Button(login_card, text="Login", command=self.login, bg="#2563eb", fg="white", font=("Segoe UI", 11, "bold"), relief="flat", bd=0, padx=20, pady=12, cursor="hand2").place(x=40, y=300, width=340, height=46)
        tk.Label(login_card, text="Demo login: admin / admin123", font=("Segoe UI", 10), fg="#64748b", bg="white").place(x=40, y=360)

    def login(self):
        username = self.username_var.get().strip()
        password = self.password_var.get().strip()

        if username.lower() in self.login_credentials and self.login_credentials[username.lower()] == password:
            self.current_user = username.title()
            self.login_frame.destroy()
            self.build_dashboard()
            return

        messagebox.showerror("Login Failed", "Invalid username or password.")

    def toggle_theme(self):
        self.theme_mode = "dark" if self.theme_mode == "light" else "light"
        self.apply_theme()

    def apply_theme(self):
        if self.theme_mode == "dark":
            bg = "#0b1220"
            panel = "#111827"
            topbar = "#0f172a"
            text_color = "#e2e8f0"
            entry_bg = "#0f172a"
            entry_fg = "#f8fafc"
            button_bg = "#1e293b"
            table_even = "#1f2937"
            table_odd = "#111827"
        else:
            bg = "#edf4ff"
            panel = "#ffffff"
            topbar = "#0f172a"
            text_color = "#0f172a"
            entry_bg = "#ffffff"
            entry_fg = "#0f172a"
            button_bg = "#e2e8f0"
            table_even = "#f8fafc"
            table_odd = "#ffffff"

        self.configure(bg=bg)
        self.main_container.configure(bg=bg)

        if self.dashboard_frame is not None:
            self.dashboard_frame.configure(bg=bg)
            self.topbar.configure(bg=topbar)
            self.content.configure(bg=bg)
            self.summary_frame.configure(bg=bg)
            self.main_panel.configure(bg=bg)
            self.form_frame.configure(bg=panel)
            self.list_frame.configure(bg=panel)
            self.filters_frame.configure(bg=panel)

            if self.theme_toggle_button is not None:
                self.theme_toggle_button.configure(
                    bg=button_bg,
                    fg="white" if self.theme_mode == "dark" else "#0f172a",
                    activebackground=button_bg,
                    activeforeground="white" if self.theme_mode == "dark" else "#0f172a",
                    text="☀️ Light Mode" if self.theme_mode == "dark" else "🌙 Dark Mode",
                )

            if self.user_label is not None:
                self.user_label.configure(bg=topbar, fg="#dbeafe")

            for child in self.topbar.winfo_children():
                if isinstance(child, tk.Label):
                    child.configure(bg=topbar, fg="white")
                elif isinstance(child, tk.Button):
                    child.configure(bg=button_bg, fg="white" if self.theme_mode == "dark" else "#0f172a")

            for widget in self.dashboard_widgets:
                if isinstance(widget, tk.Label):
                    widget.configure(bg=panel, fg=text_color)
                elif isinstance(widget, tk.Entry):
                    widget.configure(bg=entry_bg, fg=entry_fg, insertbackground=entry_fg)
                elif isinstance(widget, ttk.Combobox):
                    widget.configure(background=entry_bg, foreground=entry_fg)

            if self.attendance_tree is not None:
                self.attendance_tree.tag_configure("evenrow", background=table_even)
                self.attendance_tree.tag_configure("oddrow", background=table_odd)

            for card in self.summary_cards:
                card.configure(bg=card.card_color)
                for child in card.winfo_children():
                    if isinstance(child, tk.Label):
                        child.configure(bg=card.card_color, fg="white")

    def build_dashboard(self):
        self.dashboard_frame = tk.Frame(self.main_container, bg="#edf4ff")
        self.dashboard_frame.pack(fill="both", expand=True)

        self.topbar = tk.Frame(self.dashboard_frame, bg="#0f172a", height=90)
        self.topbar.pack(fill="x")

        title_bar = tk.Frame(self.topbar, bg="#0f172a")
        title_bar.pack(fill="x", padx=22, pady=18)

        tk.Label(title_bar, text="🎓 Institute Technical Event Portal", font=("Segoe UI", 22, "bold"), fg="white", bg="#0f172a").pack(side="left")

        self.theme_toggle_button = tk.Button(
            title_bar,
            text="🌙 Dark Mode",
            command=self.toggle_theme,
            bg="#1e293b",
            fg="white",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            bd=0,
            padx=16,
            pady=8,
            cursor="hand2",
        )
        self.theme_toggle_button.pack(side="right")

        self.user_label = tk.Label(title_bar, text=f"Logged in as: {self.current_user}", font=("Segoe UI", 10, "bold"), fg="#dbeafe", bg="#0f172a")
        self.user_label.pack(side="right", padx=(0, 16))

        self.content = tk.Frame(self.dashboard_frame, bg="#edf4ff")
        self.content.pack(fill="both", expand=True, padx=18, pady=18)

        self.summary_frame = tk.Frame(self.content, bg="#edf4ff")
        self.summary_frame.pack(fill="x", pady=(0, 12))

        cards = [
            ("Total Registrations", "0", "👥", "#2563eb"),
            ("Unique Departments", "0", "🏛️", "#16a34a"),
            ("Events Scheduled", "0", "🎯", "#f59e0b"),
            ("Filtered Results", "0", "🔍", "#7c3aed"),
        ]

        self.summary_labels = {}
        self.summary_cards = []
        self.dashboard_widgets = []

        for index, (title, value, icon, color) in enumerate(cards):
            card = tk.Frame(self.summary_frame, bg=color, padx=18, pady=16, bd=0)
            card.grid(row=0, column=index, padx=10, sticky="nsew")
            card.card_color = color
            self.summary_cards.append(card)

            tk.Label(card, text=icon, font=("Segoe UI", 26), bg=color, fg="white").pack(anchor="w")
            tk.Label(card, text=title, font=("Segoe UI", 10, "bold"), bg=color, fg="white").pack(anchor="w")
            value_label = tk.Label(card, text=value, font=("Segoe UI", 22, "bold"), bg=color, fg="white")
            value_label.pack(anchor="w", pady=(4, 0))
            self.summary_labels[title] = value_label

        self.summary_frame.grid_columnconfigure((0, 1, 2, 3), weight=1)

        self.main_panel = tk.Frame(self.content, bg="#edf4ff")
        self.main_panel.pack(fill="both", expand=True)

        self.form_frame = tk.LabelFrame(self.main_panel, text="📝 Registration Form", font=("Segoe UI", 12, "bold"), bg="#ffffff", fg="#0f172a", padx=18, pady=18)
        self.form_frame.pack(side="left", fill="y", padx=(0, 16))

        self.list_frame = tk.LabelFrame(self.main_panel, text="📋 Attendance List", font=("Segoe UI", 12, "bold"), bg="#ffffff", fg="#0f172a", padx=16, pady=12)
        self.list_frame.pack(side="right", fill="both", expand=True)

        self.filters_frame = tk.Frame(self.list_frame, bg="#ffffff")
        self.filters_frame.pack(fill="x", pady=(0, 12))

        search_label = tk.Label(self.filters_frame, text="Search", font=("Segoe UI", 10, "bold"), bg="#ffffff", fg="#334155")
        search_label.grid(row=0, column=0, sticky="w", padx=(0, 8))
        self.dashboard_widgets.append(search_label)
        self.search_var = tk.StringVar()
        search_entry = tk.Entry(self.filters_frame, textvariable=self.search_var, width=26, font=("Segoe UI", 10), bd=1, relief="solid")
        search_entry.grid(row=0, column=1, sticky="ew", padx=(0, 10))
        self.dashboard_widgets.append(search_entry)
        self.search_var.trace_add("write", lambda *args: self.filter_attendance())

        dept_label = tk.Label(self.filters_frame, text="Department", font=("Segoe UI", 10, "bold"), bg="#ffffff", fg="#334155")
        dept_label.grid(row=0, column=2, sticky="w", padx=(0, 8))
        self.dashboard_widgets.append(dept_label)
        self.department_filter = tk.StringVar(value="All")
        dept_values = ["All", "Computer Science", "Electrical", "Mechanical", "Civil", "Business Administration", "Applied Sciences", "Other"]
        dept_combo = ttk.Combobox(self.filters_frame, textvariable=self.department_filter, values=dept_values, state="readonly", width=18)
        dept_combo.grid(row=0, column=3, sticky="ew", padx=(0, 10))
        self.dashboard_widgets.append(dept_combo)
        self.department_filter.trace_add("write", lambda *args: self.filter_attendance())

        event_label = tk.Label(self.filters_frame, text="Event", font=("Segoe UI", 10, "bold"), bg="#ffffff", fg="#334155")
        event_label.grid(row=0, column=4, sticky="w", padx=(0, 8))
        self.dashboard_widgets.append(event_label)
        self.event_filter = tk.StringVar(value="All")
        event_values = ["All", "AI & Robotics Workshop", "Cyber Security Seminar", "Web Development Bootcamp", "Data Science Challenge", "IoT Expo"]
        event_combo = ttk.Combobox(self.filters_frame, textvariable=self.event_filter, values=event_values, state="readonly", width=24)
        event_combo.grid(row=0, column=5, sticky="ew")
        self.dashboard_widgets.append(event_combo)
        self.event_filter.trace_add("write", lambda *args: self.filter_attendance())

        self.filters_frame.grid_columnconfigure((1, 3, 5), weight=1)

        fields = [
            ("Full Name", "full_name", "text"),
            ("Student ID", "student_id", "text"),
            ("Email", "email", "text"),
            ("Department", "department", "combo"),
            ("Event", "event", "combo"),
            ("Contact Number", "contact", "text"),
        ]

        current_row = 1
        for label_text, key, field_type in fields:
            label = tk.Label(self.form_frame, text=f"{label_text}:", font=("Segoe UI", 10, "bold"), bg="#ffffff", fg="#1f2937")
            label.grid(row=current_row, column=0, sticky="w", padx=(0, 12), pady=9)
            self.dashboard_widgets.append(label)

            if field_type == "combo":
                options = {
                    "department": ["Computer Science", "Electrical", "Mechanical", "Civil", "Business Administration", "Applied Sciences", "Other"],
                    "event": ["AI & Robotics Workshop", "Cyber Security Seminar", "Web Development Bootcamp", "Data Science Challenge", "IoT Expo"],
                }
                var = tk.StringVar(value=options[key][0])
                widget = ttk.Combobox(self.form_frame, textvariable=var, values=options[key], width=28, state="readonly", font=("Segoe UI", 10))
                widget.grid(row=current_row, column=1, sticky="ew", pady=8)
                self.dashboard_widgets.append(widget)
            else:
                var = tk.StringVar()
                widget = tk.Entry(self.form_frame, textvariable=var, width=34, font=("Segoe UI", 10), bd=1, relief="solid", highlightthickness=1, highlightbackground="#cbd5e1")
                widget.grid(row=current_row, column=1, sticky="ew", pady=8)
                self.dashboard_widgets.append(widget)

            self.entry_vars[key] = var
            current_row += 1

        self.form_frame.columnconfigure(1, weight=1)

        button_frame = tk.Frame(self.form_frame, bg="#ffffff")
        button_frame.grid(row=current_row, column=0, columnspan=2, pady=(18, 0), sticky="ew")
        self.dashboard_widgets.append(button_frame)

        tk.Button(button_frame, text="✅ Register", command=self.register_participant, bg="#2563eb", fg="white", font=("Segoe UI", 10, "bold"), relief="flat", bd=0, padx=14, pady=9, cursor="hand2").pack(side="left", padx=(0, 10))
        tk.Button(button_frame, text="🧹 Clear", command=self.clear_form, bg="#e2e8f0", fg="#0f172a", font=("Segoe UI", 10, "bold"), relief="flat", bd=0, padx=14, pady=9, cursor="hand2").pack(side="left", padx=(0, 10))
        tk.Button(button_frame, text="📤 Export", command=self.export_attendance, bg="#16a34a", fg="white", font=("Segoe UI", 10, "bold"), relief="flat", bd=0, padx=14, pady=9, cursor="hand2").pack(side="left")

        table_columns = ("Name", "Student ID", "Email", "Department", "Event", "Contact")
        self.attendance_tree = ttk.Treeview(self.list_frame, columns=table_columns, show="headings", height=17)
        for column in table_columns:
            self.attendance_tree.heading(column, text=column)
            self.attendance_tree.column(column, width=148, anchor="center")

        scroll_y = ttk.Scrollbar(self.list_frame, orient="vertical", command=self.attendance_tree.yview)
        scroll_x = ttk.Scrollbar(self.list_frame, orient="horizontal", command=self.attendance_tree.xview)
        self.attendance_tree.configure(yscrollcommand=scroll_y.set, xscrollcommand=scroll_x.set)

        self.attendance_tree.pack(side="left", fill="both", expand=True)
        scroll_y.pack(side="right", fill="y")
        scroll_x.pack(side="bottom", fill="x")
        self.attendance_tree.tag_configure("evenrow", background="#f8fafc")
        self.attendance_tree.tag_configure("oddrow", background="#ffffff")

        self.apply_theme()
        self.refresh_attendance()

    def get_form_values(self):
        return {
            "full_name": self.entry_vars["full_name"].get().strip(),
            "student_id": self.entry_vars["student_id"].get().strip(),
            "email": self.entry_vars["email"].get().strip(),
            "department": self.entry_vars["department"].get().strip(),
            "event": self.entry_vars["event"].get().strip(),
            "contact": self.entry_vars["contact"].get().strip(),
        }

    def clear_form(self):
        for key in self.entry_vars:
            if key in ("department", "event"):
                defaults = {"department": "Computer Science", "event": "AI & Robotics Workshop"}
                self.entry_vars[key].set(defaults[key])
            else:
                self.entry_vars[key].set("")

    def validate_form(self, data):
        if not data["full_name"]:
            raise ValueError("Full Name is required.")
        if not re.fullmatch(r"[A-Za-z ]+([A-Za-z ]+)?", data["full_name"]):
            raise ValueError("Full Name can only contain letters and spaces.")

        if not data["student_id"]:
            raise ValueError("Student ID is required.")
        if len(data["student_id"]) < 4:
            raise ValueError("Student ID must be at least 4 characters long.")

        if not data["email"]:
            raise ValueError("Email is required.")
        if not re.fullmatch(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", data["email"]):
            raise ValueError("Please enter a valid email address.")

        if not data["department"]:
            raise ValueError("Please select the department.")

        if not data["event"]:
            raise ValueError("Please select the event.")

        if not data["contact"]:
            raise ValueError("Contact Number is required.")
        if not data["contact"].isdigit() or len(data["contact"]) not in (10, 11):
            raise ValueError("Contact Number must be 10 or 11 digits.")

        for registration in self.registrations:
            if registration["student_id"].lower() == data["student_id"].lower() or registration["email"].lower() == data["email"].lower():
                raise ValueError("Duplicate registration detected. Student ID or Email already exists.")

        return True

    def register_participant(self):
        try:
            data = self.get_form_values()
            self.validate_form(data)
            self.registrations.append(data)
            self.refresh_attendance()
            self.clear_form()
            messagebox.showinfo("Success", f"{data['full_name']} has been successfully registered.")
        except ValueError as exc:
            messagebox.showerror("Validation Error", str(exc))

    def filter_attendance(self):
        query = self.search_var.get().strip().lower()
        selected_department = self.department_filter.get()
        selected_event = self.event_filter.get()

        filtered = self.registrations
        if query:
            filtered = [
                item
                for item in filtered
                if query in item["full_name"].lower()
                or query in item["student_id"].lower()
                or query in item["email"].lower()
            ]

        if selected_department != "All":
            filtered = [item for item in filtered if item["department"] == selected_department]

        if selected_event != "All":
            filtered = [item for item in filtered if item["event"] == selected_event]

        self._render_table(filtered)
        self.update_summary_cards(filtered)

    def refresh_attendance(self):
        self.filter_attendance()

    def _render_table(self, data):
        if self.attendance_tree is None:
            return

        for child in self.attendance_tree.get_children():
            self.attendance_tree.delete(child)

        for index, registration in enumerate(data):
            tag = "evenrow" if index % 2 == 0 else "oddrow"
            self.attendance_tree.insert(
                "",
                "end",
                values=(
                    registration["full_name"],
                    registration["student_id"],
                    registration["email"],
                    registration["department"],
                    registration["event"],
                    registration["contact"],
                ),
                tags=(tag,),
            )

    def update_summary_cards(self, filtered=None):
        if filtered is None:
            filtered = self.registrations

        self.summary_labels["Total Registrations"].configure(text=str(len(self.registrations)))
        self.summary_labels["Unique Departments"].configure(text=str(len({item["department"] for item in self.registrations})))
        self.summary_labels["Events Scheduled"].configure(text=str(len({item["event"] for item in self.registrations})))
        self.summary_labels["Filtered Results"].configure(text=str(len(filtered)))

    def export_attendance(self):
        if not self.registrations:
            messagebox.showwarning("No Records", "No registrations are available to export.")
            return

        export_path = Path("attendance_list.csv")
        with export_path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(["Name", "Student ID", "Email", "Department", "Event", "Contact"])
            for registration in self.registrations:
                writer.writerow([
                    registration["full_name"],
                    registration["student_id"],
                    registration["email"],
                    registration["department"],
                    registration["event"],
                    registration["contact"],
                ])

        messagebox.showinfo("Export Complete", f"Attendance list exported to: {export_path.resolve()}")


if __name__ == "__main__":
    app = EventRegistrationApp()
    app.mainloop()
