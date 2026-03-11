#!/bin/bash

# Change to the root directory of the project
cd /Users/shaunak/.gemini/antigravity/scratch/film-roi-predictor

# Ensure the logs directory exists
mkdir -p .logs

# Add a timestamp to the log
echo "=== Scheduled Database Update: $(date) ===" >> .logs/cron.log

# Run the python script and append output to log
python3 scripts/seed_db.py >> .logs/cron.log 2>&1

echo "=== Update Completed ===" >> .logs/cron.log
echo "" >> .logs/cron.log
