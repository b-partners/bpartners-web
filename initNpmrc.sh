#!/bin/bash
aws codeartifact login --tool npm --repository "$2" --domain "$3" --domain-owner "$4" --profile "$1"