import { createDepartment } from "./lib/actions/department.actions";

/** Pass a real client id from your DB, e.g. from `SELECT id FROM clients LIMIT 1`. */
async function test() {
  const clientId = process.env.TEST_CLIENT_ID ?? "";
  const result = await createDepartment({
    name: "Testing Reload " + Date.now(),
    clientId,
  });
  console.log("Result:", result);
}

test();
