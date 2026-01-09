# API Testing Guide with cURL

Base URL: `http://localhost:3000`

## Table of Contents
1. [Health Check](#health-check)
2. [Authentication Flow](#authentication-flow)
3. [Public Routes](#public-routes)
4. [Intermediate Hub Manager Routes](#intermediate-hub-manager-routes)
5. [Main Hub Manager Routes](#main-hub-manager-routes)
6. [Driver Manager Routes](#driver-manager-routes)

---

## Health Check

```bash
curl -X GET http://localhost:3000/
```

---

## Authentication Flow

### 1. Request OTP
```bash
# Request OTP for hub manager
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hubmanager@example.com"
  }'

# Request OTP for driver manager
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com"
  }'
```

### 2. Verify OTP
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hubmanager@example.com",
    "otp": "123456"
  }'
```

### 3. Create Main Hub Manager (after OTP verification)
```bash
curl -X POST http://localhost:3000/createHubManager \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Hub Manager",
    "email": "main.hub@example.com",
    "phone": "+1234567890",
    "hubmanagerCategory": "main",
    "address": "123 Main Street, City",
    "geoLat": 40.7128,
    "geoLng": -74.0060
  }'
```

**Response:** Save the `token` for authenticated requests

### 4. Create Intermediate Hub Manager
```bash
curl -X POST http://localhost:3000/createHubManager \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Intermediate Hub Manager",
    "email": "intermediate.hub@example.com",
    "phone": "+1234567891",
    "hubmanagerCategory": "intermediate",
    "mainHubManagerId": 1,
    "address": "456 Second Street, City",
    "geoLat": 40.7589,
    "geoLng": -73.9851
  }'
```

**Note:** Replace `mainHubManagerId` with actual main hub manager ID

### 5. Create Driver Manager
```bash
# Main Driver Manager
curl -X POST http://localhost:3000/createDriverManager \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Driver Manager",
    "email": "main.driver@example.com",
    "phone": "+1234567892",
    "category": "main",
    "hubmanagerId": 2,
    "address": "789 Third Street, City",
    "geoLat": 40.7480,
    "geoLng": -73.9862
  }'

# Intermediate Driver Manager
curl -X POST http://localhost:3000/createDriverManager \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Intermediate Driver Manager",
    "email": "intermediate.driver@example.com",
    "phone": "+1234567893",
    "category": "intermediate",
    "hubmanagerId": 2,
    "address": "101 Fourth Street, City",
    "geoLat": 40.7614,
    "geoLng": -73.9776
  }'
```

---

## Public Routes

### Get All Hub Managers (Main Only)
```bash
curl -X GET http://localhost:3000/getAllHubManagers
```

---

## Intermediate Hub Manager Routes

**Set your token as environment variable:**
```bash
export INT_HUB_TOKEN="your_intermediate_hub_manager_token_here"
```

### Get Profile Info
```bash
curl -X GET http://localhost:3000/getIntermediateHubManagerProfileInfo \
  -H "Authorization: Bearer $INT_HUB_TOKEN"
```

### Create Shop
```bash
curl -X POST http://localhost:3000/createShop \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Mart",
    "phone": "+1234567894",
    "address": "123 Shop Street",
    "geoLat": 40.7580,
    "geoLng": -73.9855
  }'
```

### Create Product
```bash
curl -X POST http://localhost:3000/createProduct \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fresh Apples",
    "description": "Organic red apples from local farms",
    "price": 4.99,
    "quantity": 100,
    "metadata": {
      "category": "fruits",
      "origin": "local"
    }
  }'
```

### Create Vehicle
```bash
curl -X POST http://localhost:3000/createVehicleForIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "VH-1234",
    "model": "Ford Transit",
    "capacity": 1500.5
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/createOrder \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 10
      },
      {
        "productId": 2,
        "quantity": 5
      }
    ],
    "metadata": {
      "urgency": "high",
      "notes": "Handle with care"
    },
    "deliveryDate": "2026-01-15T10:00:00Z"
  }'
```

### Allocate Vehicle to Order
```bash
curl -X POST http://localhost:3000/allocateVehicletoOrderViaIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "vehicleId": 1
  }'
```

### Allocate Driver Manager to Vehicle
```bash
curl -X POST http://localhost:3000/allocateDriverManagertoVehicleViaIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "driverManagerId": 1
  }'
```

### Get All Shops
```bash
curl -X GET http://localhost:3000/getAllShopsUnderIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN"
```

### Get All Driver Managers
```bash
curl -X GET http://localhost:3000/getAllDriverManagerUnderIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN"
```

### Get All Orders
```bash
curl -X GET http://localhost:3000/getAllOrdersForIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN"
```

### Get All Products
```bash
curl -X GET http://localhost:3000/getAllProductsUnderIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN"
```

### Get All Vehicles
```bash
curl -X GET http://localhost:3000/getAllVehicleUnderIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN"
```

### Update Order
```bash
curl -X PUT http://localhost:3000/updateOrderForIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "status": "in_transit",
    "metadata": {
      "updatedBy": "hub_manager",
      "timestamp": "2026-01-10T12:00:00Z"
    }
  }'
```

---

## Main Hub Manager Routes

**Set your token as environment variable:**
```bash
export MAIN_HUB_TOKEN="your_main_hub_manager_token_here"
```

### Get Profile Info
```bash
curl -X GET http://localhost:3000/getMainHubManagerProfileInfo \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN"
```

### Create Vehicle
```bash
curl -X POST http://localhost:3000/createVehicleForMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "MV-5678",
    "model": "Mercedes Sprinter",
    "capacity": 2000.0
  }'
```

### Get All Orders (Grouped by Intermediate Managers)
```bash
curl -X GET http://localhost:3000/getAllOrdersForMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN"
```

### Get All Driver Managers
```bash
curl -X GET http://localhost:3000/getAllDriverManagerUnderMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN"
```

### Get All Intermediate Hub Managers
```bash
curl -X GET http://localhost:3000/getAllIntermediateHubManagerUnderMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN"
```

### Get All Vehicles
```bash
curl -X GET http://localhost:3000/getAllVehicleUnderMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN"
```

### Update Order
```bash
curl -X PUT http://localhost:3000/updateOrderForMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "status": "delivered",
    "metadata": {
      "deliveredBy": "main_hub",
      "timestamp": "2026-01-11T14:00:00Z"
    }
  }'
```

### Allocate Vehicle to Order
```bash
curl -X POST http://localhost:3000/allocateVehicletoOrderViaMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "vehicleId": 2
  }'
```

### Allocate Driver Manager to Vehicle
```bash
curl -X POST http://localhost:3000/allocateDriverManagertoVehicleViaMainHubManager \
  -H "Authorization: Bearer $MAIN_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 2,
    "driverManagerId": 2
  }'
```

---

## Driver Manager Routes

### Main Driver Manager

**Set your token as environment variable:**
```bash
export MAIN_DRIVER_TOKEN="your_main_driver_manager_token_here"
```

#### Get Orders
```bash
curl -X GET http://localhost:3000/getOrdersForMainDriverManager \
  -H "Authorization: Bearer $MAIN_DRIVER_TOKEN"
```

### Intermediate Driver Manager

**Set your token as environment variable:**
```bash
export INT_DRIVER_TOKEN="your_intermediate_driver_manager_token_here"
```

#### Get Orders
```bash
curl -X GET http://localhost:3000/getOrdersForIntermediateDriverManager \
  -H "Authorization: Bearer $INT_DRIVER_TOKEN"
```

---

## Complete Testing Flow Example

### Step 1: Setup Main Hub Manager
```bash
# 1. Request OTP
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "main@test.com"}'

# 2. Verify OTP (check your email/console for OTP)
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "main@test.com", "otp": "YOUR_OTP"}'

# 3. Create Main Hub Manager
curl -X POST http://localhost:3000/createHubManager \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Hub",
    "email": "main@test.com",
    "phone": "+11111111111",
    "hubmanagerCategory": "main",
    "address": "Main Hub Address",
    "geoLat": 40.7128,
    "geoLng": -74.0060
  }'
# Save the token from response
```

### Step 2: Setup Intermediate Hub Manager
```bash
# 1. Request OTP
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "intermediate@test.com"}'

# 2. Verify OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "intermediate@test.com", "otp": "YOUR_OTP"}'

# 3. Create Intermediate Hub Manager (use mainHubManagerId from step 1)
curl -X POST http://localhost:3000/createHubManager \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Intermediate Hub",
    "email": "intermediate@test.com",
    "phone": "+12222222222",
    "hubmanagerCategory": "intermediate",
    "mainHubManagerId": 1,
    "address": "Intermediate Hub Address",
    "geoLat": 40.7589,
    "geoLng": -73.9851
  }'
# Save the token
```

### Step 3: Create Products
```bash
export INT_HUB_TOKEN="intermediate_hub_token_from_step_2"

curl -X POST http://localhost:3000/createProduct \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product 1",
    "description": "Test product",
    "price": 10.99,
    "quantity": 50
  }'
```

### Step 4: Create Shop
```bash
curl -X POST http://localhost:3000/createShop \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Shop",
    "phone": "+13333333333",
    "address": "Shop Address",
    "geoLat": 40.7580,
    "geoLng": -73.9855
  }'
```

### Step 5: Create Order
```bash
curl -X POST http://localhost:3000/createOrder \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": 1,
    "items": [{"productId": 1, "quantity": 5}]
  }'
```

### Step 6: Create Vehicle and Driver
```bash
# Create vehicle
curl -X POST http://localhost:3000/createVehicleForIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "TEST-001",
    "model": "Test Model",
    "capacity": 1000
  }'

# Create driver (after OTP verification)
curl -X POST http://localhost:3000/createDriverManager \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Driver",
    "email": "driver@test.com",
    "phone": "+14444444444",
    "category": "main",
    "hubmanagerId": 2,
    "address": "Driver Address",
    "geoLat": 40.7480,
    "geoLng": -73.9862
  }'
```

### Step 7: Allocate Vehicle and Driver to Order
```bash
# Allocate vehicle to order
curl -X POST http://localhost:3000/allocateVehicletoOrderViaIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1, "vehicleId": 1}'

# Allocate driver to vehicle
curl -X POST http://localhost:3000/allocateDriverManagertoVehicleViaIntermediateHubManager \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 1, "driverManagerId": 1}'
```

---

## Order Status Values
- `created` - Initial state
- `pending` - Awaiting processing
- `in_transit` - In transit to destination
- `in_source` - At source location
- `in_hub` - At hub
- `delivered` - Successfully delivered
- `cancelled` - Order cancelled

## Vehicle Status Values
- `available` - Available for allocation
- `occupied` - Currently allocated

## Driver Manager Status Values
- `available` - Available for work
- `occupied` - Currently assigned to vehicle

## Manager Categories
- **Hub Manager:** `main` or `intermediate`
- **Driver Manager:** `main` or `intermediate`

---

## Error Handling Examples

### Unauthorized Access
```bash
# Without token
curl -X GET http://localhost:3000/getIntermediateHubManagerProfileInfo
# Response: 401 Unauthorized
```

### Invalid Token
```bash
curl -X GET http://localhost:3000/getIntermediateHubManagerProfileInfo \
  -H "Authorization: Bearer invalid_token"
# Response: 401 Unauthorized
```

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/createShop \
  -H "Authorization: Bearer $INT_HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Incomplete Shop"}'
# Response: 400 Bad Request
```

---

## Tips for Testing

1. **Save tokens:** Export tokens as environment variables for easier testing
2. **Check logs:** Server logs provide detailed information about each request
3. **Sequential testing:** Follow the complete flow example for end-to-end testing
4. **Database state:** Remember that some operations require specific database states
5. **OTP verification:** Check console/email for OTP codes during authentication
6. **Pretty print JSON:** Add `-s | jq` to curl commands for formatted output:
   ```bash
   curl -s http://localhost:3000/ | jq
   ```

---

## Testing with Prisma Studio

You can also view/edit data using Prisma Studio:
```bash
npm run db:studio
```
This opens a web interface at `http://localhost:5555` to browse and edit your database.
