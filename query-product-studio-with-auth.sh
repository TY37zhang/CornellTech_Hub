#!/bin/bash
# Replace YOUR_AUTH_TOKEN with your actual authentication token
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"message": "Tell me about the Product Studio course"}'
