const http = require("http");

const test = (path, body) => new Promise((resolve) => {
  const data = JSON.stringify(body);
  const req = http.request({
    hostname: "localhost", port: 5000, path, method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
  }, res => {
    let out = "";
    res.on("data", c => out += c);
    res.on("end", () => resolve({ status: res.statusCode, body: out }));
  });
  req.write(data); req.end();
});

(async () => {
  console.log("--- Testing superadmin login ---");
  const r1 = await test("/api/auth/login", { email: "superadmin@zefender.com", password: "Zefender@123", role: "superadmin" });
  console.log(r1.status, r1.body);

  console.log("\n--- Testing admin register ---");
  const r2 = await test("/api/auth/register", { email: "testadmin@example.com", password: "Test@1234" });
  console.log(r2.status, r2.body);

  process.exit(0);
})();
