require('dotenv').config();
const API_KEY = process.env.API_KEY;

fetch('http://192.168.0.176:3000/management', {
  headers: {
    'api-key': API_KEY
  }
})
.then(response => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Failed to fetch data');
  }
})
.then(data => {
  console.log(data)
})
.catch(error => {
  console.error(error);
});
