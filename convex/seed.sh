#!/bin/bash
# Seed script for realistic EcoTrack reference users.

echo "Seeding EcoTrack with realistic reference data..."
echo ""
echo "This will maintain 6 reference users:"
echo "  - Jens Ammann"
echo "  - Jan Ammann"
echo "  - Elijah Stauss"
echo "  - Moritz Kaltenstadler"
echo "  - Jana Ammann"
echo "  - Lisa Ammann"
echo ""
echo "Each profile receives 14 days of plausible sustainable activities."
echo "Urban profiles rely more on bike and public transport."
echo "Rural profiles include more car pooling and bundled car trips."
echo ""

npx convex run seed:seedData

echo ""
echo "Seeding complete."
echo ""
echo "Default password for all seeded users:"
echo "  test123"
