#!/bin/bash
awslocal sqs create-queue --queue-name pokemon-processing --region us-east-1
echo "SQS queue ready"

awslocal s3 mb s3://raw --region us-east-1                                                                                                                                                                                        
awslocal s3 mb s3://annotated --region us-east-1                                                                                                                                                                                         
echo "S3 buckets ready" 
