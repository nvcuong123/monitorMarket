import bcrypt from "bcryptjs";
console.log(bcrypt.hashSync("c209123@X", 8));


$2b$08$dvxn3m.x17lvD1WSXHgVtuhX0ujS95/QH7sQhho5XErjRSffZKhoi



curl -X POST https://monitormarket-ycrr.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"hashPasswod\":\"$2b$08$mw34SiHSifxyLjTyCbHB.e1PwPBXWxsj7qI/5peDSUuz414GIQlTm\"}"