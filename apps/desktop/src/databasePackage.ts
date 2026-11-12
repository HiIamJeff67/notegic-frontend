const unavailable = () => {
  throw new Error("Desktop does not open the web local database.");
};

export class SQLocalDrizzle {
  constructor() {
    unavailable();
  }
}

export class SQLocalProcessor {
  constructor() {
    unavailable();
  }
}

export class SQLiteOpfsDriver {
  constructor() {
    unavailable();
  }
}
