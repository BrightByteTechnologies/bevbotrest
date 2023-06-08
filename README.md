# Express Server with API Key Authentication

This repository contains an Express server implementation with API key authentication for different routes. The server is built using Node.js and MySQL.

## Getting Started

To get started with the server, follow the instructions below.

### Prerequisites

- Node.js installed on your machine
- MySQL server running locally
- `.env` file with the required environment variables (see the example below)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/express-api-key-server.git
   ```
2. Install the dependencies:

   cd path/to/your/api-folder
   ```bash
   npm install 
   ```
   
3. Create a .env file in the root directory and provide the following environment variables:

   - WEBSITE_KEY=your_website_api_key
   - RESTAURANT_KEY=your_restaurant_api_key
   - RESTAURANT_RESERVING_KEY=your_restaurant_reserving_api_key
   - QR_KEY=your_qr_api_key
   - QR_REGISTRATION_KEY=your_qr_registration_api_key
   - PRODUCTS_KEY=your_products_api_key
   - ORDER_KEY=your_order_api_key
   - ORDER_CHANGE_KEY=your_order_change_api_key

4. Start the server:
   ```bash
   node index.js
   ```
   The server will start running on http://localhost:3000.

Routes and API Keys
The server defines the following routes and their corresponding API keys:

- /management - Website Management Route (Requires WEBSITE_KEY)
- /software - Software Team Route (Requires WEBSITE_KEY)
- /hardware - Hardware Team Route (Requires WEBSITE_KEY)
- /timeline - Timeline Route (Requires WEBSITE_KEY)
- /tables - Restaurant Tables Route (Requires RESTAURANT_KEY)
- /tables/reserve - Table Reservation Route (Requires RESTAURANT_RESERVING_KEY)
- /qrcodes - Restaurant QR Codes Route (Requires QR_KEY)
- /qrcodes/register - QR Code Registration Route (Requires QR_REGISTRATION_KEY)
- /qrcodes/use - QR Code Usage Route (Requires QR_REGISTRATION_KEY)
- /products - Restaurant Products Route (Requires PRODUCTS_KEY)
- /orders - Restaurant Orders Route (Requires ORDER_KEY)
- /orders/unfinished - Unfinished Orders Route (Requires ORDER_KEY)
- /orders/place - Place Order Route (Requires ORDER_CHANGE_KEY)
- /orders/finish - Finish Order Route (Requires ORDER_CHANGE_KEY)
Feel free to add more routes and API keys as needed.

### Development
The server uses the Express framework and MySQL for database operations. You can modify the existing routes or add new ones to suit your requirements. Make sure to handle errors and perform necessary validations when extending the functionality.

### License
This project is licensed under the [MIT License](./LICENSE). See the LICENSE file for details.
