fetch("https://monitormarket-ycrr.onrender.com/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    hashPasswod: "c209123@X"
  })
})
//.then(res => res.json())
.then(res => res.text())
.then(console.log);
//const text = await res.text();
//console.log(text);