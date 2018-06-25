const Koa = require('koa');
const app = new Koa();
const  serve = require("koa-static");
console.log(__dirname)

app.use(serve(__dirname + "/client/html/"));
app.use(serve(__dirname + "/client/"));
app.use(serve(__dirname + "/"));
// app.use(serve(__dirname));
app.listen(7000);
