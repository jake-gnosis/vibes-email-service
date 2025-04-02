# Vibes Email Service

A powerful programmatic email service backend built with Node.js, Express, and TypeScript.

## Features

- **Programmatic Email Sending**: Send transactional and marketing emails via API
- **Email Templates**: Create, manage, and use reusable email templates with variables
- **User Quotas**: Configurable daily email sending limits per user
- **API Key Authentication**: Secure API access with unique API keys
- **Email History**: Track and monitor sent emails with detailed logs
- **Template Variables**: Dynamic content insertion with simple {{variable}} syntax

## Tech Stack

- **Node.js & TypeScript**: For type-safe backend development
- **Express**: For API routing and middleware
- **MongoDB & Mongoose**: For data storage and modeling
- **Nodemailer**: For email delivery
- **Winston**: For application logging
- **JWT**: For authentication (API keys)

## Prerequisites

- Node.js (v16.17.1 or higher)
- MongoDB (local or remote)
- SMTP server credentials for email sending

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/vibes-email.git
   cd vibes-email
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your configuration

4. Start the development server:
   ```
   npm run dev
   ```

## API Documentation

### Authentication

All API requests (except public template endpoints) require authentication using an API key sent in the `X-API-Key` header or `api_key` query parameter.

### Email Endpoints

#### Send Email
```
POST /api/v1/email/send
```

Request body:
```json
{
  "from": "sender@example.com",
  "to": ["recipient@example.com"],
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Hello from Vibes",
  "text": "Plain text version",
  "html": "<p>HTML version</p>",
  "attachments": [],
  "tags": ["welcome", "onboarding"],
  "metadata": { "userId": "123" }
}
```

#### Send Templated Email
```
POST /api/v1/email/send-template
```

Request body:
```json
{
  "from": "sender@example.com",
  "to": ["recipient@example.com"],
  "templateId": "template-id-here",
  "templateData": {
    "name": "John",
    "company": "Acme Inc"
  }
}
```

#### Get Email Status
```
GET /api/v1/email/status/:id
```

#### Get Email History
```
GET /api/v1/email/history
```

### Template Endpoints

#### Create Template
```
POST /api/v1/templates
```

Request body:
```json
{
  "name": "Welcome Email",
  "description": "Sent to new users",
  "subject": "Welcome to {{company}}",
  "html": "<p>Hello {{name}},</p><p>Welcome to {{company}}!</p>",
  "isPublic": false
}
```

#### Update Template
```
PUT /api/v1/templates/:id
```

#### Delete Template
```
DELETE /api/v1/templates/:id
```

#### Get Template
```
GET /api/v1/templates/:id
```

#### List Templates
```
GET /api/v1/templates
```

#### List Public Templates
```
GET /api/v1/templates/public
```

## License

ISC License 