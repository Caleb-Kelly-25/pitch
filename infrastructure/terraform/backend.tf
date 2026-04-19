terraform {
    backend "s3" {
        bucket = "terraform-state-bucket-620455726351-us-east-1-an" # Name of the S3 bucket
        key = "dev/tf-statefile" # Path to the state file in the bucket
        region = "us-east-1" # AWS region of the bucket
        encrypt = true # Enable server-side encryption
        dynamodb_table = "terraform-lock-table" # Optional: DynamoDB table for state locking
    }
}