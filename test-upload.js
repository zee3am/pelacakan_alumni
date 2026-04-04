const result = require('node-fetch')('http://localhost:3000/api/alumni/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: [
      {
        nama: "Test Person",
        posisi: "Test Role"
      }
    ]
  })
}).then(res => res.json()).then(console.log).catch(console.error);
