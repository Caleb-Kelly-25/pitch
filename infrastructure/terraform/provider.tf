terraform{
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 6.0"
        }
    }
}

provider "aws" {
    region = "us-east-1"
    assume_role {
        role_arn = "arn:aws:iam::123456789012:role/ROLE_NAME"
        session_name = "SESSION_NAME"
    }
}