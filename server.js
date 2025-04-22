const http = require('http');
const url = require('url');

// Object datasets
let movies = [
  { id: 1, title: "Inception", director: "Christopher Nolan", year: 2010 },
  { id: 2, title: "The Matrix", director: "Wachowski Sisters", year: 1999 }
];

let series = [
  { id: 1, title: "Game of Thrones", seasons: 8, creator: "D. B. Weiss and David Benioff" },
  { id: 2, title: "Stranger Things", seasons: 4, creator: "Duffer Brothers" }
];

let songs = [
  { id: 1, title: "Residuals", artist: "Chris Brown", year: 2023 },
  { id: 2, title: "Blinding Lights", artist: "The Weeknd", year: 2020 }
];


const sendJSON = (res, data, status = 200) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const notFound = res => {
  sendJSON(res, { error: "Not found" }, 404);
};

const getBody = req =>
  new Promise(resolve => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => resolve(JSON.parse(body)));
  });

// Create a server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const method = req.method;

  let dataSet;
  if (pathname.startsWith('/movies')) dataSet = movies;
  else if (pathname.startsWith('/series')) dataSet = series;
  else if (pathname.startsWith('/songs')) dataSet = songs;

  if (!['/movies', '/series', '/songs'].some(path => pathname.startsWith(path))) {
    return notFound(res);
  }

  const idMatch = pathname.match(/\/(movies|series|songs)\/(\d+)/);
  const id = idMatch ? parseInt(idMatch[2]) : null;

  if (method === 'GET') {
    return sendJSON(res, dataSet);
  }

  if (method === 'POST') {
    const newItem = await getBody(req);
    dataSet.push(newItem);
    return sendJSON(res, dataSet);
  }

  if (method === 'PUT' && id) {
    const updatedItem = await getBody(req);
    for (let i = 0; i < dataSet.length; i++) {
      if (dataSet[i].id === id) {
        dataSet[i] = { ...dataSet[i], ...updatedItem };
      }
    }
    return sendJSON(res, dataSet);
  }

  if (method === 'DELETE' && id) {
    const filtered = dataSet.filter(item => item.id !== id);
    if (pathname.startsWith('/movies')) movies = filtered;
    if (pathname.startsWith('/series')) series = filtered;
    if (pathname.startsWith('/songs')) songs = filtered;
    return sendJSON(res, filtered);
  }

  return notFound(res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
