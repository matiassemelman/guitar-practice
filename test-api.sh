#!/bin/bash

# Script de testing para los endpoints del backend de Deliberate Guitar
# Uso: ./test-api.sh [base-url]
# Ejemplo: ./test-api.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"

echo "🎸 Testing API de Deliberate Guitar"
echo "Base URL: $BASE_URL"
echo ""
echo "========================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Verificar conexión a DB
echo "📡 Test 1: GET /api/test (verificar conexión a DB)"
echo "---"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/test")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
fi

echo ""
echo "========================================"
echo ""

# Test 2: Crear sesión
echo "📝 Test 2: POST /api/sessions (crear sesión de prueba)"
echo "---"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "microObjective": "Cambio limpio de C a G a 60 bpm",
    "technicalFocus": "Técnica",
    "durationMin": 30,
    "bpmTarget": 60,
    "bpmAchieved": 55,
    "perfectTakes": 2,
    "qualityRating": 4,
    "rpe": 6,
    "mindsetChecklist": {
      "warmedUp": true,
      "practicedSlow": true,
      "recorded": false,
      "tookBreaks": true,
      "reviewedMistakes": true
    },
    "reflection": "Hoy me di cuenta que necesito relajar más la muñeca"
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
fi

echo ""
echo "========================================"
echo ""

# Test 3: Listar sesiones
echo "📋 Test 3: GET /api/sessions (listar sesiones)"
echo "---"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/sessions?limit=5")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.data.sessions | length' | xargs -I {} echo "  → {} sesiones encontradas"
  echo "$BODY" | jq '.data | {total, hasMore}'
else
  echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
fi

echo ""
echo "========================================"
echo ""

# Test 4: Obtener estadísticas
echo "📊 Test 4: GET /api/stats (estadísticas)"
echo "---"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/stats")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.data.stats'
else
  echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
fi

echo ""
echo "========================================"
echo ""

# Test 5: Validación - crear sesión con datos inválidos
echo "❌ Test 5: POST /api/sessions (validación - objetivo muy corto)"
echo "---"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "microObjective": "Test",
    "technicalFocus": "Técnica",
    "durationMin": 30
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✓ Status: $HTTP_CODE (validación funcionando correctamente)${NC}"
  echo "$BODY" | jq '.error'
else
  echo -e "${YELLOW}⚠ Status: $HTTP_CODE (esperado 400)${NC}"
  echo "$BODY" | jq '.'
fi

echo ""
echo "========================================"
echo ""

# Test 6: Filtrar sesiones por foco técnico
echo "🔍 Test 6: GET /api/sessions?technicalFocus=Técnica (filtrado)"
echo "---"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/sessions?technicalFocus=Técnica&limit=10")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.data.sessions | length' | xargs -I {} echo "  → {} sesiones con foco 'Técnica'"
else
  echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
fi

echo ""
echo "========================================"
echo ""
echo -e "${GREEN}✅ Tests completados${NC}"
echo ""
echo "💡 Tip: Verifica que DATABASE_URL esté configurada en .env.local"
echo "💡 Tip: Asegúrate de que el schema.sql haya sido aplicado a la DB"
