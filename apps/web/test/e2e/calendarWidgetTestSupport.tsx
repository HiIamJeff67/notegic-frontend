import { createRoot } from "react-dom/client";
import { BasicPreviewWidgets } from "@/components/widgets/basic/basic";
import { getSizeValues } from "@/components/widgets/widget";

export const mountCalendarWidgets = (frameSize: number) => {
  const container = document.createElement("main");
  container.id = "calendar-widget-test-root";
  container.className =
    "fixed inset-0 z-50 flex flex-wrap content-start items-start gap-6 overflow-auto bg-canvas p-6 text-foreground";
  document.body.append(container);
  const root = createRoot(container);
  const calendar = BasicPreviewWidgets.calendar;
  const resize = (frameSize: number) =>
    root.render(
      <>
        {calendar.availableSizes.map(size => {
          const label = `${size.heightFrameCount}×${size.widthFrameCount}`;
          return (
            <section key={label} data-calendar-size={label}>
              <calendar.component
                className="rounded-lg border border-foreground/25 bg-card"
                style={getSizeValues(size, frameSize, 6)}
              />
            </section>
          );
        })}
      </>
    );
  resize(frameSize);
  return {
    resize,
    unmount: () => {
      root.unmount();
      container.remove();
    },
  };
};
