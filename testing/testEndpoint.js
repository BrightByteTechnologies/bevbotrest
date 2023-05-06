const dotenv = require('dotenv');
dotenv.config();
const API_KEY = 'pi59hh6X1Z';
const key = 1;
switch (key) {
  case 1:
    nonePostFetch();
    break;
  case 2:
    postFetch();
    break;
}
function nonePostFetch() {
  fetch('http://api.brightbytetechnologies.de/qrcodes?restaurant_id=bbt_restaurant_Hd8s0d&token=659eeda30654a9b9bcd61eb34229f82d', {
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