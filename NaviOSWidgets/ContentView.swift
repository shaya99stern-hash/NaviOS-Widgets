import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var model: TaskListModel
    @EnvironmentObject private var location: LocationService

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                if model.tasks.isEmpty {
                    VStack(spacing: 10) {
                        Text("Personal")
                            .font(.system(size: 36, weight: .regular, design: .serif))
                        Text("Quietly organized.")
                            .foregroundStyle(.secondary)
                    }
                } else {
                    List {
                        ForEach(model.tasks) { task in
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
                        .onDelete(perform: model.delete)
                    }
                    .scrollContentBackground(.hidden)
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
                AddTaskView()
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

    @State private var title = ""
    @State private var hasDueDate = false
    @State private var dueDate = Date().addingTimeInterval(3600)
    @State private var useCurrentLocation = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("What needs to happen?", text: $title)
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
                            location.coordinate == nil ? "Getting location…" : "Stored locally",
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
