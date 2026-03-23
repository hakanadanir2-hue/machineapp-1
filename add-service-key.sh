#!/bin/bash
ENV_FILE="/Users/hakanadanir/.verdent/verdent-projects/new-project1-7decfc71/machineapp/.env.local"
KEY="SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2J3eGh5b3h0YnRta21yd3ljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4NTU5MiwiZXhwIjoyMDg5MjYxNTkyfQ.sEYvnFhR6NPTrxEkrI4e-MhpBLZ1DoZ0qG9RdRWNeP8"

if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE" 2>/dev/null; then
  sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|$KEY|" "$ENV_FILE"
  echo "✅ Service role key güncellendi"
else
  echo "" >> "$ENV_FILE"
  echo "$KEY" >> "$ENV_FILE"
  echo "✅ Service role key eklendi"
fi

echo "📄 .env.local içeriği:"
cat "$ENV_FILE" | grep -E "SUPABASE|WGER" | sed 's/=.*/=***GIZLI***/'
