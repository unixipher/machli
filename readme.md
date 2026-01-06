# Machli API Documentation

## Base URL
```
https://machli-3kcb.onrender.com
```

---

## Health Check

### Check API Health
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "message": "Health check successful",
  "timestamp": 1736064000000
}
```

---

## Public Routes (No Authentication Required)

### Create Hub Manager
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/createHubManager' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Mrinmoy Halder",
  "email": "mrinmoyhalder859@gmail.com",
  "phone": "919330218705",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4",
  "hubmanagerCategory": "main"
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mrinmoy Halder",
    "email": "mrinmoyhalder859@gmail.com",
    "phone": "919330218705",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4",
    "createdAt": "2026-01-05T06:11:31.861Z",
    "hubmanagerCategory": "main",
    "mainHubManagerId": null,
    "updatedAt": "2026-01-05T06:11:31.861Z"
  }
}
```

### Create Intermediate Hub Manager
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/createHubManager' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Deepan Sadhukhan",
  "email": "sadhukhandeepan@gmail.com",
  "phone": "917003574257",
  "hubmanagerCategory": "intermediate",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo",
  "mainHubManagerId": 1
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Deepan Sadhukhan",
    "email": "sadhukhandeepan@gmail.com",
    "phone": "917003574257",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo",
    "createdAt": "2026-01-05T06:16:26.864Z",
    "hubmanagerCategory": "intermediate",
    "mainHubManagerId": 1,
    "updatedAt": "2026-01-05T06:16:26.864Z"
  }
}
```

### Create Vehicle
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/createVehicle' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "vehicleNumber": "WB-01-AB-1234",
  "vehicleType": "truck",
  "capacity": 1000,
  "metadata": {
    "make": "Tata",
    "model": "ACE",
    "year": 2023
  }
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vehicleNumber": "WB-01-AB-1234",
    "vehicleType": "truck",
    "capacity": 1000,
    "metadata": {
      "make": "Tata",
      "model": "ACE",
      "year": 2023
    },
    "createdAt": "2026-01-05T09:00:00.000Z",
    "updatedAt": "2026-01-05T09:00:00.000Z"
  }
}
```

### Create Driver Manager
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/createDriverManager' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Farhan Anis",
  "email": "farhan@gmail.com",
  "phone": "91122334455",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRmFyaGFuIEFuaXMiLCJlbWFpbCI6ImZhcmhhbkBnbWFpbC5jb20iLCJwaG9uZSI6IjkxMTIyMzM0NDU1IiwiY2F0ZWdvcnkiOiJtYWluIn0.9BkyJJ6AypEXPZT4E2UVrcK0iGZPLNsFbbNzccfErHc",
  "category": "main"
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Farhan Anis",
    "email": "farhan@gmail.com",
    "status": "available",
    "phone": "91122334455",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRmFyaGFuIEFuaXMiLCJlbWFpbCI6ImZhcmhhbkBnbWFpbC5jb20iLCJwaG9uZSI6IjkxMTIyMzM0NDU1IiwiY2F0ZWdvcnkiOiJtYWluIn0.9BkyJJ6AypEXPZT4E2UVrcK0iGZPLNsFbbNzccfErHc",
    "category": "main",
    "createdAt": "2026-01-05T09:23:25.499Z",
    "updatedAt": "2026-01-05T09:23:25.499Z"
  }
}
```

---

## Intermediate Hub Manager Routes
**Authorization Required:** Bearer Token (Intermediate Hub Manager)

### Create Shop
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/createShop' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Babulal Machli",
  "phone": "919876543210",
  "address": "31, Bamangachi, Salkia, Howrah, West Bengal 711101",
  "geoLat": 22.600811,
  "geoLng": 88.329695
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Babulal Machli",
    "phone": "919876543210",
    "geoLat": 22.600811,
    "geoLng": 88.3297,
    "address": "31, Bamangachi, Salkia, Howrah, West Bengal 711101",
    "createdAt": "2026-01-05T06:21:13.892Z",
    "updatedAt": "2026-01-05T06:21:13.892Z"
  }
}
```

### Get Intermediate Hub Manager Profile Info
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getIntermediateHubManagerProfileInfo' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Deepan Sadhukhan",
    "email": "sadhukhandeepan@gmail.com",
    "phone": "917003574257",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo",
    "hubmanagerCategory": "intermediate",
    "mainHubManagerId": 1,
    "createdAt": "2026-01-05T06:16:26.864Z",
    "updatedAt": "2026-01-05T06:16:26.864Z"
  }
}
```

### Create Order
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/createOrder' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "shopId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 10
    }
  ],
  "metadata": {
    "location": "Malda Town West Bengal"
  },
  "deliveryDate": "2026-01-06"
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopId": 1,
    "hubmanagerId": 2,
    "metadata": {
      "location": "Malda Town West Bengal"
    },
    "status": "pending",
    "deliveryDate": "2026-01-06T00:00:00.000Z",
    "createdAt": "2026-01-05T06:59:54.969Z",
    "updatedAt": "2026-01-05T06:59:54.969Z",
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 10,
        "createdAt": "2026-01-05T06:59:55.071Z",
        "updatedAt": "2026-01-05T06:59:55.071Z"
      }
    ]
  }
}
```

### Get All Shops Under Intermediate Hub Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getAllShopsUnderIntermediateHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Babulal Machli",
      "phone": "919876543210",
      "geoLat": 22.600811,
      "geoLng": 88.3297,
      "address": "31, Bamangachi, Salkia, Howrah, West Bengal 711101",
      "createdAt": "2026-01-05T06:21:13.892Z",
      "updatedAt": "2026-01-05T06:21:13.892Z"
    }
  ]
}
```

### Get All Driver Managers Under Intermediate Hub Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getAllDriverManagerUnderIntermediateHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Ravi Kumar",
      "email": "ravi@gmail.com",
      "status": "available",
      "phone": "91998877665",
      "category": "intermediate",
      "createdAt": "2026-01-05T10:00:00.000Z",
      "updatedAt": "2026-01-05T10:00:00.000Z"
    }
  ]
}
```

### Get All Orders for Intermediate Hub Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getAllOrdersForIntermediateHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shopId": 1,
      "hubmanagerId": 2,
      "metadata": {
        "location": "Malda Town West Bengal"
      },
      "status": "pending",
      "deliveryDate": "2026-01-06T00:00:00.000Z",
      "createdAt": "2026-01-05T06:59:54.969Z",
      "updatedAt": "2026-01-05T06:59:54.969Z"
    },
    {
      "id": 2,
      "shopId": 1,
      "hubmanagerId": 2,
      "metadata": {
        "location": "Malda Town West Bengal"
      },
      "status": "pending",
      "deliveryDate": "2026-01-07T00:00:00.000Z",
      "createdAt": "2026-01-05T07:02:20.294Z",
      "updatedAt": "2026-01-05T07:02:20.294Z"
    }
  ]
}
```

### Update Order for Intermediate Hub Manager
```bash
curl -X PUT \
  'https://machli-3kcb.onrender.com/updateOrderForIntermediateHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "orderId": 1,
  "status": "in_transit",
  "metadata": {
    "location": "Order is on the way at Hooghly"
  }
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopId": 1,
    "hubmanagerId": 2,
    "metadata": {
      "location": "Order is on the way at Hooghly"
    },
    "status": "in_transit",
    "deliveryDate": "2026-01-06T00:00:00.000Z",
    "createdAt": "2026-01-05T06:59:54.969Z",
    "updatedAt": "2026-01-05T07:14:07.486Z"
  }
}
```

### Create Product
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/createProduct' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "title": "Hilsha Fish",
  "description": "Hilsha Fish from the waters of Bangladesh",
  "price": 350,
  "quantity": 100,
  "metadata": {
    "category": "Fish",
    "origin": "Bangladesh"
  }
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Hilsha Fish",
    "description": "Hilsha Fish from the waters of Bangladesh",
    "price": 350,
    "quantity": 100,
    "metadata": {
      "category": "Fish",
      "origin": "Bangladesh"
    },
    "createdAt": "2026-01-05T06:50:00.000Z",
    "updatedAt": "2026-01-05T06:50:00.000Z"
  }
}
```

### Allocate Vehicle to Order (Intermediate Hub Manager)
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/allocateVehicletoOrderViaIntermediateHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "orderId": 1,
  "vehicleId": 2
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopId": 1,
    "hubmanagerId": 2,
    "vehicleId": 2,
    "metadata": {
      "location": "Order is Cancelled"
    },
    "status": "in_source",
    "deliveryDate": "2026-01-06T00:00:00.000Z",
    "createdAt": "2026-01-05T06:59:54.969Z",
    "updatedAt": "2026-01-05T08:48:09.008Z"
  }
}
```

### Allocate Driver Manager to Vehicle (Intermediate Hub Manager)
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/allocateDriverManagertoVehicleViaIntermediateHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGVlcGFuIFNhZGh1a2hhbiIsImVtYWlsIjoic2FkaHVraGFuZGVlcGFuQGdtYWlsLmNvbSIsInBob25lIjoiOTE3MDAzNTc0MjU3IiwiaHVibWFuYWdlckNhdGVnb3J5IjoiaW50ZXJtZWRpYXRlIiwibWFpbkh1Yk1hbmFnZXJJZCI6MX0.uz2lDvFmis2W1cpm6UaqkAFY4pUPciPOIxVhA2mfbpo' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "vehicleId": 2,
  "driverManagerId": 3
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "vehicleNumber": "WB-02-CD-5678",
    "vehicleType": "van",
    "capacity": 500,
    "driverManagerId": 3,
    "metadata": {},
    "createdAt": "2026-01-05T10:00:00.000Z",
    "updatedAt": "2026-01-05T10:30:00.000Z"
  }
}
```

---

## Main Hub Manager Routes
**Authorization Required:** Bearer Token (Main Hub Manager)

### Get All Orders for Main Hub Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getAllOrdersForMainHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "intermediateManager": {
        "name": "Deepan Sadhukhan",
        "email": "sadhukhandeepan@gmail.com",
        "phone": "917003574257"
      },
      "orders": [
        {
          "id": 1,
          "shopId": 1,
          "hubmanagerId": 2,
          "metadata": {
            "location": "Malda Town West Bengal"
          },
          "status": "pending",
          "deliveryDate": "2026-01-06T00:00:00.000Z",
          "createdAt": "2026-01-05T06:59:54.969Z",
          "updatedAt": "2026-01-05T06:59:54.969Z"
        },
        {
          "id": 2,
          "shopId": 1,
          "hubmanagerId": 2,
          "metadata": {
            "location": "Malda Town West Bengal"
          },
          "status": "pending",
          "deliveryDate": "2026-01-07T00:00:00.000Z",
          "createdAt": "2026-01-05T07:02:20.294Z",
          "updatedAt": "2026-01-05T07:02:20.294Z"
        }
      ]
    }
  ]
}
```

### Get Main Hub Manager Profile Info
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getMainHubManagerProfileInfo' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mrinmoy Halder",
    "email": "mrinmoyhalder859@gmail.com",
    "phone": "919330218705",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4",
    "hubmanagerCategory": "main",
    "mainHubManagerId": null,
    "createdAt": "2026-01-05T06:11:31.861Z",
    "updatedAt": "2026-01-05T06:11:31.861Z"
  }
}
```

### Get All Driver Managers Under Main Hub Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getAllDriverManagerUnderMainHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Farhan Anis",
      "email": "farhan@gmail.com",
      "status": "available",
      "phone": "91122334455",
      "category": "main",
      "createdAt": "2026-01-05T09:23:25.499Z",
      "updatedAt": "2026-01-05T09:23:25.499Z"
    }
  ]
}
```

### Get All Intermediate Hub Managers Under Main Hub Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getAllIntermediateHubManagerUnderMainHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Deepan Sadhukhan",
      "email": "sadhukhandeepan@gmail.com",
      "phone": "917003574257",
      "hubmanagerCategory": "intermediate",
      "mainHubManagerId": 1,
      "createdAt": "2026-01-05T06:16:26.864Z",
      "updatedAt": "2026-01-05T06:16:26.864Z"
    }
  ]
}
```

### Update Order for Main Hub Manager
```bash
curl -X PUT \
  'https://machli-3kcb.onrender.com/updateOrderForMainHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "orderId": 1,
  "status": "delivered",
  "metadata": {
    "location": "Order delivered successfully"
  }
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopId": 1,
    "hubmanagerId": 2,
    "metadata": {
      "location": "Order delivered successfully"
    },
    "status": "delivered",
    "deliveryDate": "2026-01-06T00:00:00.000Z",
    "createdAt": "2026-01-05T06:59:54.969Z",
    "updatedAt": "2026-01-05T09:00:00.000Z"
  }
}
```

### Allocate Vehicle to Order (Main Hub Manager)
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/allocateVehicletoOrderViaMainHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "orderId": 1,
  "vehicleId": 1
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopId": 1,
    "hubmanagerId": 2,
    "vehicleId": 1,
    "metadata": {
      "location": "Order is Cancelled"
    },
    "status": "in_source",
    "deliveryDate": "2026-01-06T00:00:00.000Z",
    "createdAt": "2026-01-05T06:59:54.969Z",
    "updatedAt": "2026-01-05T08:43:14.085Z"
  }
}
```

### Allocate Driver Manager to Vehicle (Main Hub Manager)
```bash
curl -X POST \
  'https://machli-3kcb.onrender.com/allocateDriverManagertoVehicleViaMainHubManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTXJpbm1veSBIYWxkZXIiLCJlbWFpbCI6Im1yaW5tb3loYWxkZXI4NTlAZ21haWwuY29tIiwicGhvbmUiOiI5MTkzMzAyMTg3MDUiLCJodWJtYW5hZ2VyQ2F0ZWdvcnkiOiJtYWluIn0.BeYztjGzQOGLgOZf2YoGvKwcRXJiEeYVF-Lkqt02XN4' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "vehicleId": 1,
  "driverManagerId": 1
}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vehicleNumber": "WB-01-AB-1234",
    "vehicleType": "truck",
    "capacity": 1000,
    "driverManagerId": 1,
    "metadata": {
      "make": "Tata",
      "model": "ACE",
      "year": 2023
    },
    "createdAt": "2026-01-05T09:00:00.000Z",
    "updatedAt": "2026-01-05T09:30:00.000Z"
  }
}
```

---

## Main Driver Manager Routes
**Authorization Required:** Bearer Token (Main Driver Manager)

### Get Orders for Main Driver Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getOrdersForMainDriverManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRmFyaGFuIEFuaXMiLCJlbWFpbCI6ImZhcmhhbkBnbWFpbC5jb20iLCJwaG9uZSI6IjkxMTIyMzM0NDU1IiwiY2F0ZWdvcnkiOiJtYWluIn0.9BkyJJ6AypEXPZT4E2UVrcK0iGZPLNsFbbNzccfErHc' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shopId": 1,
      "hubmanagerId": 2,
      "vehicleId": 2,
      "metadata": {
        "location": "Order is Cancelled"
      },
      "status": "in_source",
      "deliveryDate": "2026-01-06T00:00:00.000Z",
      "createdAt": "2026-01-05T06:59:54.969Z",
      "updatedAt": "2026-01-05T08:48:09.008Z"
    }
  ]
}
```

---

## Intermediate Driver Manager Routes
**Authorization Required:** Bearer Token (Intermediate Driver Manager)

### Get Orders for Intermediate Driver Manager
```bash
curl -X GET \
  'https://machli-3kcb.onrender.com/getOrdersForIntermediateDriverManager' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUmF2aSBLdW1hciIsImVtYWlsIjoicmF2aUBnbWFpbC5jb20iLCJwaG9uZSI6IjkxOTk4ODc3NjY1IiwiY2F0ZWdvcnkiOiJpbnRlcm1lZGlhdGUifQ.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890' \
  --header 'Content-Type: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "shopId": 1,
      "hubmanagerId": 2,
      "vehicleId": 3,
      "metadata": {
        "location": "Order in transit"
      },
      "status": "in_transit",
      "deliveryDate": "2026-01-07T00:00:00.000Z",
      "createdAt": "2026-01-05T07:02:20.294Z",
      "updatedAt": "2026-01-05T10:00:00.000Z"
    }
  ]
}
```

---

## Notes

- Replace the bearer tokens with your actual JWT tokens
- All timestamps are in ISO 8601 format
- The base URL can be changed to `http://localhost:3000` for local development
- Status values for orders: `pending`, `in_transit`, `in_source`, `delivered`, `cancelled`
- Driver Manager categories: `main`, `intermediate`
- Hub Manager categories: `main`, `intermediate`
