#!/bin/bash

while IFS= read -r email; do
  aws ses send-email \
      --from bpartners.artisans@gmail.com \
      --to "$email" \
      --message file://.conf/email-template.json \
      --profile "$1"
done < .conf/recipients.txt