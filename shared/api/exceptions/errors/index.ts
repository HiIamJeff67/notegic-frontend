export class NotegicError extends Error {
  protected isPresentable: boolean;
  protected presentation: string;

  constructor(
    initialMessage: string = "unknown error occurred",
    isPresentable: boolean = false,
    presentation: string = ""
  ) {
    super(initialMessage);
    this.name = "NotegicError";
    this.isPresentable = isPresentable;
    this.presentation = presentation;
  }

  get getPresentation(): string {
    return this.isPresentable ? this.presentation : "";
  }

  setPresentation(presentation: string): NotegicError {
    this.presentation = presentation;
    this.isPresentable = true;
    return this;
  }

  consumePresentation(): string {
    const presentation = this.presentation ?? "";
    this.presentation = "";
    this.isPresentable = false;
    return presentation;
  }

  removePresentation(): NotegicError {
    this.presentation = "";
    this.isPresentable = false;
    return this;
  }
}
