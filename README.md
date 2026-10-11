# Phone & Mail Express Testing API

A modular Express.js application designed for testing phone validation, SMS/OTP simulation, email verification, user management, and general HTTP testing utilities.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
- **Production mode:**
  ```bash
  npm start
  ```
- **Development mode (auto-reload on save):**
  ```bash
  npm run dev
  ```
The server will start at `http://localhost:3000`.

### 3. Run Automated Tests
```bash
npm test
```

---

## 📡 Available Routes

### 🌐 System & Index
| Method | Route | Description |
|---|---|---|
| `GET` | `/` | API endpoint directory and status |
| `GET` | `/api/health` | Health check endpoint (uptime, timestamp) |

---

### 📱 Phone Routes (`/api/phone`)
| Method | Route | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/phone/info` | List of phone endpoints | - |
| `POST` | `/api/phone/validate` | Validates phone number format | `{ "phone": "+12025550143" }` |
| `POST` | `/api/phone/send-otp` | Generates & sends mock OTP | `{ "phone": "+12025550143" }` |
| `POST` | `/api/phone/verify-otp` | Verifies submitted OTP | `{ "phone": "+12025550143", "otp": "123456" }` |
| `GET` | `/api/phone/active-otps` | Inspect active OTPs (testing aid) | - |

---

### ✉️ Email Routes (`/api/email`)
| Method | Route | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/email/info` | List of email endpoints | - |
| `POST` | `/api/email/validate` | Checks email format & extracts domain | `{ "email": "alice@example.com" }` |
| `POST` | `/api/email/send-verification` | Generates token & verification URL | `{ "email": "alice@example.com" }` |
| `GET` | `/api/email/verify/:token` | Validates token (simulated link click) | - |
| `POST` | `/api/email/send-message` | Mock send custom email message | `{ "to": "alice@example.com", "subject": "Hello", "body": "Test message" }` |

---

### 👤 User Routes (`/api/users`)
| Method | Route | Description | Query / Body |
|---|---|---|---|
| `GET` | `/api/users` | List all users (supports `?email=` and `?phone=` query filters) | - |
| `GET` | `/api/users/:id` | Get user by ID | - |
| `POST` | `/api/users` | Create a new user | `{ "name": "John Doe", "email": "john@example.com", "phone": "+12025550199" }` |
| `DELETE` | `/api/users/:id` | Delete user by ID | - |

---

### 🛠️ General Testing Utilities (`/api/test`)
| Method | Route | Description | Parameters |
|---|---|---|---|
| `ALL` | `/api/test/echo` | Echoes request headers, query, and body | Any method, body, or headers |
| `GET` | `/api/test/delay/:ms` | Artificial delay response (timeout testing) | e.g. `/api/test/delay/1500` (up to 10s) |
| `GET` | `/api/test/status/:code` | Returns specific HTTP status code | e.g. `/api/test/status/404`, `/500` |
| `GET` | `/api/test/simulate-error` | Triggers 500 internal server error | Tests error handling middleware |

---

## 🧪 Testing with cURL Examples

```bash
# Health check
curl http://localhost:3000/api/health

# Send phone OTP
curl -X POST http://localhost:3000/api/phone/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+12025550143"}'

# Send email verification
curl -X POST http://localhost:3000/api/email/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Echo request
curl -X POST http://localhost:3000/api/test/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```
