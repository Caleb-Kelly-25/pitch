# AWS Deployment

The production environment runs on AWS and is defined entirely in Terraform (`infrastructure/terraform/`). Deployment is handled by three manually triggered GitHub Actions workflows in `.github/workflows/`. Configure the required secrets in the GitHub repository before running them.

## Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `AWS_REGION` | e.g. `us-east-1` |
| `AWS_ROLE_ARN` | IAM role ARN with ECS/ECR/S3/CloudFront permissions (OIDC) |
| `TF_VAR_docdb_username` | DocumentDB admin username |
| `TF_VAR_docdb_password` | DocumentDB admin password |

## Step 1: Provision infrastructure (first time only)

Run the **Deploy Infrastructure** workflow (`deploy-infra.yml`) from the GitHub Actions tab. It uses Terraform to create:

- VPC with public and private subnets across two availability zones, and a NAT gateway
- Security groups that limit each tier to traffic from the tier in front of it
- Application Load Balancer with sticky sessions and a `/api/health` health check
- ECS Fargate cluster, task definition, and CPU-based autoscaling
- ECR container registry
- ElastiCache Redis
- DocumentDB cluster (MongoDB-compatible)
- S3 bucket and CloudFront distribution for the frontend, with an ACM certificate
- Route 53 DNS records
- SSM Parameter Store entries for secrets (`MONGO_URI`, `JWT_SECRET`), which are injected into tasks at startup

Review the Terraform plan output in the Actions log before the apply step.

## Step 2: Deploy the backend

Run the **Deploy Backend** workflow (`deploy-backend.yml`). It:

1. Builds the server Docker image
2. Pushes it to ECR
3. Updates the ECS task definition with the new image
4. Deploys the updated service and waits for it to stabilize

## Step 3: Deploy the frontend

Run the **Deploy Frontend** workflow (`deploy-frontend.yml`). It:

1. Installs dependencies and runs `vite build`
2. Syncs the `dist/` output to S3
3. Invalidates the CloudFront cache so users get the latest version

## Redeploying

After code changes, run only the backend or frontend workflow, depending on what changed. Infrastructure only needs to be re-applied when Terraform files change.
