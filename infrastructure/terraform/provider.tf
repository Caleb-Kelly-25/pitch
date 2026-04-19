terraform{
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 6.0"
        }
    }
}

data "aws_caller_identity" "current" {}

provider "aws" {
    region = "us-east-1"
    assume_role {
        role_arn = "arn:aws:iam::${var.account_id}:role/GitHub-deploy-role"
        session_name = "GitHub-Infra-Deploy"
    }
}