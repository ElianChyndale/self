import http from 'node:http';

const port = Number(process.env.PORT || 80);

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, service: 'self-miniprogram-cloudhosting' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    ok: true,
    message: 'Cloud hosting service is running.',
    note: 'Mini Program business logic still uses CloudBase cloud functions.',
  }));
});

server.listen(port, () => {
  console.log(`cloudhosting server listening on ${port}`);
});
