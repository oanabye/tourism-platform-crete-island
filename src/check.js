const s = require('sqlite3').verbose();
const d = new s.Database('./db.sqlite');
d.all("SELECT name FROM sqlite_master WHERE type='table'", [], (e, r) => {
    console.log(r);
    d.close();
});