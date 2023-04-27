const dotenv = require('dotenv');
dotenv.config();
const API_KEY = 'qr_registration_test';
const key = 2;
switch (key) {
  case 1:
    nonePostFetch();
    break;
  case 2:
    postFetch();
    break;
}
function nonePostFetch() {
  console.log(API_KEY);
  fetch('http://localhost:3000/qrcodes?restaurant_id=test_restaurant', {
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
}

function  postFetch() {
  console.log(API_KEY);
  const requestOptions = {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'api-key': API_KEY
    },
    body: JSON.stringify({
      restaurant_id: 'test_restaurant',
      token: 'test_token_2',
      tableNo: 'test_table'
    })
  };
  
  fetch('http://localhost:3000/qrcodes/register', requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  
}