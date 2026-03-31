import { createDepartment } from "./lib/actions/department.actions";

async function test() {
  const result = await createDepartment({ name: "Testing Reload " + Date.now() });
  console.log("Result:", result);
}

test();
