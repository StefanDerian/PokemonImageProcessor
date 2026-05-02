#!/bin/bash
awslocal sqs create-queue --queue-name pokemon-processing --region us-east-1
echo "SQS queue ready"
