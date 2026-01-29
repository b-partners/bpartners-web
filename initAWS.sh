#!/bin/bash
sudo aws configure set aws_access_key_id "$2" --profile "$1"
sudo aws configure set aws_secret_access_key "$3" --profile "$1"
sudo aws configure set region "$4" --profile "$1"