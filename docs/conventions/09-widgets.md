# Dashboard widgets

Dashboard widgets are registered through `PreviewWidget` entries in
`apps/web/src/components/widgets/basic/basic.ts`. The entry owns the widget's
component, layout constraints, editability, and default `setting` and `data`.

## Widget folders

A widget component belongs in its own feature folder. Use `data/` for the
persisted data shape and its default factory, and use `setting/` for persisted
presentation or behavior settings when the widget has configurable settings.
Neither folder is required when the widget has no corresponding state, but
state that is stored in a widget should not be declared as an untyped object in
the component file.

The component receives these values through `WidgetProps`:

- `data` and `setData` for user content or progress;
- `setting` and `setSetting` for widget configuration;
- `sync` to persist the current dashboard widget collection.

Use `useAnyTypeState` when a widget needs a typed view of the persisted
`Record<string, any>` values. It merges the registered defaults with stored
values so a newly added field has a safe value without invalidating existing
dashboard data.

## Local persistence

`WidgetProvider` serializes the complete widget collection under the
user-scoped `LocalStorageKey.dashboardWidgets` key. `setData` and `setSetting`
update the in-memory dashboard state; they do not persist by themselves. A
widget that must survive immediately after an interaction, such as a checklist
progress toggle, calls `sync()` after updating its state. A widget with an
explicit save action may defer `sync()` until that action, following the Todo
and Scratch Pad patterns.

Do not create a separate `localStorage` key for one widget unless the state
must live outside the dashboard widget collection. Keeping widget state inside
`data` or `setting` preserves dashboard import, reset, and user isolation
behavior.
