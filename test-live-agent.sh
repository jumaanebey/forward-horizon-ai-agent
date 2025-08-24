#!/bin/bash

# Test Your Live AI Agent on Railway
# Replace YOUR_URL with your actual Railway URL

AGENT_URL="https://forward-horizon-ai-agent-production.up.railway.app"

echo "🔍 Testing Forward Horizon AI Agent"
echo "===================================="
echo ""

# 1. Check Status
echo "1️⃣ Checking Agent Status..."
curl -s "$AGENT_URL/api/status" | python3 -m json.tool
echo ""

# 2. Test Lead Capture
echo "2️⃣ Testing Lead Capture..."
curl -X POST "$AGENT_URL/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "message": "I need help with transitional housing",
    "source": "website",
    "is_veteran": true
  }' | python3 -m json.tool
echo ""

# 3. Test AI Chat
echo "3️⃣ Testing AI Chat..."
curl -X POST "$AGENT_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What services does Forward Horizon offer?",
    "context": {}
  }' | python3 -m json.tool
echo ""

# 4. Check Recent Memories
echo "4️⃣ Checking Recent Memories..."
curl -s "$AGENT_URL/api/memory" | python3 -m json.tool | head -20
echo ""

# 5. Check Business Leads
echo "5️⃣ Checking Business Leads..."
curl -s "$AGENT_URL/api/business/leads" | python3 -m json.tool
echo ""

echo "✅ Testing Complete!"
echo ""
echo "📊 Dashboard: $AGENT_URL/dashboard"
echo "📧 Check your email for test lead notification!"