import {
  SubmitFeedbackReportRequestSchema,
  SubmitFeedbackReportResponseSchema,
} from "./feedback.interface";

describe("Feedback report contracts", () => {
  test("accepts the browser report payload", () => {
    const request = SubmitFeedbackReportRequestSchema.parse({
      header: {
        idempotencyKey: "00000000-0000-4000-8000-000000000001",
      },
      body: {
        type: "bug",
        title: "Editor issue",
        description: "The editor did not save the latest change.",
        route: "/app/dashboard",
        browserContext: {
          locale: "en-US",
          timeZone: "UTC",
          platform: "MacIntel",
          viewportWidth: 1280,
          viewportHeight: 720,
        },
      },
    });

    expect(request.body.route).toBe("/app/dashboard");
  });

  test("rejects a route containing query data", () => {
    expect(() =>
      SubmitFeedbackReportRequestSchema.parse({
        header: {
          idempotencyKey: "00000000-0000-4000-8000-000000000001",
        },
        body: {
          type: "other",
          title: "Report",
          description: "Description",
          route: "/app/dashboard?private=value",
          browserContext: {
            locale: "en-US",
            timeZone: "UTC",
            platform: "MacIntel",
            viewportWidth: 1280,
            viewportHeight: 720,
          },
        },
      })
    ).toThrow();
  });

  test("parses the durable response", () => {
    const response = SubmitFeedbackReportResponseSchema.parse({
      success: true,
      data: {
        reportId: "00000000-0000-4000-8000-000000000002",
        status: "submitted",
        createdAt: "2026-09-25T00:00:00.000Z",
        replay: false,
      },
      exception: null,
    });

    expect(response.data.status).toBe("submitted");
  });
});
