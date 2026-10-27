import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(__dirname, "../..");
const functions = path.join(root, "src/api/functions");

test("every protected server-function upstream takes the current RPC CSRF header", () => {
  let protectedCalls = 0;
  const publicAuth = new Set([
    "Register",
    "RegisterViaGoogle",
    "Login",
    "LoginViaGoogle",
  ]);
  for (const name of readdirSync(functions).filter(name =>
    name.endsWith(".serverFn.ts")
  )) {
    const source = ts.createSourceFile(
      name,
      readFileSync(path.join(functions, name), "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "fetch"
      ) {
        let owner: ts.Node | undefined = node.parent;
        let publicCall = false;
        while (owner) {
          if (
            name === "auth.serverFn.ts" &&
            ts.isVariableDeclaration(owner) &&
            publicAuth.has(owner.name.getText(source))
          )
            publicCall = true;
          owner = owner.parent;
        }
        if (!publicCall) {
          const options = node.arguments[1];
          const headers =
            options && ts.isObjectLiteralExpression(options)
              ? options.properties.find(
                  property =>
                    ts.isPropertyAssignment(property) &&
                    property.name.getText(source) === "headers"
                )
              : undefined;
          expect(headers).toBeDefined();
          const text = headers?.getText(source) ?? "";
          expect({ file: name, headers: text }).toEqual({
            file: name,
            headers: expect.stringContaining(
              'getRequestHeader("X-CSRF-Token")'
            ),
          });
          protectedCalls++;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    expect(source.text).toContain("readAPIResponse(");
  }
  expect(protectedCalls).toBeGreaterThan(120);
});

test("RPCs and the settings custom fetch share the session boundary", () => {
  expect(readFileSync(path.join(root, "src/start.ts"), "utf8")).toContain(
    "functionMiddleware: [sessionMiddleware]"
  );
  expect(
    readFileSync(
      path.join(root, "src/api/invokers/userSetting.invoker.ts"),
      "utf8"
    )
  ).toContain("await fetchServerFunction(input, init)");
});

test("hooks cannot replay cached response tokens into sessionStorage", () => {
  const directory = path.join(root, "src/api/hooks");
  for (const name of readdirSync(directory).filter(name =>
    name.endsWith(".hook.ts")
  )) {
    const source = readFileSync(path.join(directory, name), "utf8");
    expect({
      file: name,
      legacyWriter: source.includes("SessionStorageKey.csrfToken"),
    }).toEqual({ file: name, legacyWriter: false });
    if (name !== "auth.hook.ts")
      expect(source).not.toContain("setClientCSRFToken");
  }
  const auth = readFileSync(path.join(directory, "auth.hook.ts"), "utf8");
  expect(auth.match(/setClientCSRFToken\(/g)).toHaveLength(4);
});

test("settings cooldown and empty membership responses cannot bypass renewal handling", () => {
  for (const name of [
    "station.serverFn.ts",
    "rootShelf.serverFn.ts",
    "userSetting.serverFn.ts",
  ]) {
    const source = readFileSync(path.join(functions, name), "utf8");
    expect(source).not.toContain("if (response.status === 204)");
    if (name === "userSetting.serverFn.ts") {
      expect(source.indexOf("await readAPIResponse(response)")).toBeLessThan(
        source.indexOf("response.status === 429")
      );
      expect(source).toContain("error instanceof NotegicAPIError");
    }
  }
});

test("direct browser uploads use the current token and the shared response reader", () => {
  for (const name of ["material.clientFn.ts", "userInfo.clientFn.ts"]) {
    const source = readFileSync(path.join(functions, name), "utf8");
    expect(source).toContain("const csrfToken = getClientCSRFToken()");
    expect(source).toContain("readAPIResponse(");
    expect(source).not.toContain("request.header.csrfToken");
  }
});

test("CSRF storage has one owner across the frontend, not per-feature writers", () => {
  for (const directory of [
    path.join(root, "src"),
    path.resolve(root, "../../shared"),
  ]) {
    for (const name of readdirSync(directory, { recursive: true })) {
      if (
        typeof name !== "string" ||
        !/\.tsx?$/.test(name) ||
        /\.(test|spec)\./.test(name) ||
        name === path.join("api", "clientHeaders.ts")
      )
        continue;
      const source = readFileSync(path.join(directory, name), "utf8");
      expect({
        file: name,
        writer:
          /SessionStorageManipulator\.(?:ensureItem|setItem|removeItem)\(\s*SessionStorageKey\.csrfToken/.test(
            source
          ),
      }).toEqual({ file: name, writer: false });
    }
  }
});
