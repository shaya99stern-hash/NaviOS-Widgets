import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var model: TaskListModel
    @EnvironmentObject private var location: LocationService

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                VStack(spacing: 0) {
                    Picker("List", selection: $model.selectedList) {
                        ForEach(TaskListKind.allCases) { list in
                            Text(list.title).tag(list)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 18)
                    .padding(.top, 8)
                    .padding(.bottom, 10)

                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [.white.opacity(0.32), .white.opacity(0.03)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(height: 0.5)
                        .padding(.horizontal, 18)

                    if model.visibleTasks.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Text(model.selectedList.title)
                                .font(.system(size: 38, weight: .regular, design: .serif))
                            Text("Nothing pressing.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                    } else {
                        List {
                            Section {
                                ForEach(model.visibleTasks) { task in
                                    Button {
                                        model.toggle(task)
                                    } label: {
                                        HStack(spacing: 12) {
                                            Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                                                .foregroundStyle(task.isCompleted ? .secondary : .primary)

                                            VStack(alignment: .leading, spacing: 3) {
                                                Text(task.title)
                                                    .strikethrough(task.isCompleted)
                                                    .foregroundStyle(task.isCompleted ? .secondary : .primary)

                                                if let due = task.dueDate {
                                                    Text(due, style: .relative)
                                                        .font(.caption)
                                                        .foregroundStyle(.secondary)
                                                }
                                            }

                                            Spacer()

                                            if task.hasLocation {
                                                Image(systemName: "location.fill")
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                        }
                                        .padding(.vertical, 5)
                                    }
                                    .buttonStyle(.plain)
                                    .listRowBackground(Color.black)
                                }
                                .onDelete(perform: model.deleteVisible)
                            } header: {
                                Text(model.selectedList.title)
                                    .font(.system(size: 25, weight: .regular, design: .serif))
                                    .textCase(nil)
                                    .foregroundStyle(.primary)
                            }
                        }
                        .scrollContentBackground(.hidden)
                    }
                }
            }
            .navigationTitle("NaviOS")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        model.showAddTask = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $model.showAddTask) {
                AddTaskView(initialList: model.selectedList)
                    .environmentObject(model)
                    .environmentObject(location)
            }
            .task {
                await ReminderScheduler.requestAuthorization()
            }
            .onAppear {
                model.reload()
                location.refresh()
            }
        }
        .tint(.white)
    }
}

private struct AddTaskView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var model: TaskListModel
    @EnvironmentObject private var location: LocationService

    let initialList: TaskListKind

    @State private var title = ""
    @State private var list: TaskListKind
    @State private var hasDueDate = false
    @State private var dueDate = Date().addingTimeInterval(3600)
    @State private var useCurrentLocation = false

    init(initialList: TaskListKind) {
        self.initialList = initialList
        _list = State(initialValue: initialList)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("What needs to happen?", text: $title)
                }

                Section("List") {
                    Picker("List", selection: $list) {
                        ForEach(TaskListKind.allCases) { item in
                            Text(item.title).tag(item)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Reminder") {
                    Toggle("Set a time", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("When", selection: $dueDate)
                    }
                }

                Section("Place") {
                    Toggle("Use my current location", isOn: $useCurrentLocation)
                    if useCurrentLocation {
                        Label(
                            location.coordinate == nil ? "Getting location…" : "Stored only on this iPhone",
                            systemImage: "location.fill"
                        )
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        model.add(
                            title: title,
                            list: list,
                            dueDate: hasDueDate ? dueDate : nil,
                            useCurrentLocation: useCurrentLocation,
                            coordinate: location.coordinate
                        )
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onChange(of: useCurrentLocation) { _, enabled in
                if enabled { location.refresh() }
            }
        }
        .preferredColorScheme(.dark)
    }
}
