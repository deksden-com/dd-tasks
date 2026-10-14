import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

const sqlError = () =>
  Object.assign(new Error("identical SQL integrity error"), {
    name: "PostgresError",
    code: "23503",
  });
describe("before hook", () => {
  beforeAll(() => {
    throw sqlError();
  });
  test("skipped after setup failure", () => {});
});
describe("nested", () => {
  describe("before hook", () => {
    beforeAll(() => {
      throw sqlError();
    });
    test("another skipped test", () => {});
  });
});
describe("after hook", () => {
  afterAll(() => {
    throw sqlError();
  });
  test("passes before cleanup failure", () => {});
});
test("exception", () => {
  throw sqlError();
});
test("assertion", () => {
  expect(1).toBe(2);
});
describe("beforeEach hook", () => {
  beforeEach(() => {
    throw sqlError();
  });
  test("failed setup test", () => {});
});
describe("afterEach hook", () => {
  afterEach(() => {
    throw sqlError();
  });
  test("failed teardown test", () => {});
});
describe("successful hooks do not misattribute test body", () => {
  beforeEach(() => {});
  afterEach(() => {});
  test("body exception", () => {
    throw sqlError();
  });
});
