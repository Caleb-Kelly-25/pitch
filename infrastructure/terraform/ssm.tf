resource "aws_ssm_parameter" "mongo_uri" {
  name  = "/pitch/prod/MONGO_URI"
  type  = "SecureString"
  value = "placeholder"   # Actual value managed outside Terraform
  lifecycle { ignore_changes = [value] }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/pitch/prod/JWT_SECRET"
  type  = "SecureString"
  value = "placeholder"
  lifecycle { ignore_changes = [value] }
}

# IAM policy to allow reading these parameters
resource "aws_iam_role_policy" "ssm_secrets" {
  name = "ssm-secrets"
  role = aws_iam_role.ecs_task_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameters"]
      Resource = [
        aws_ssm_parameter.mongo_uri.arn,
        aws_ssm_parameter.jwt_secret.arn
      ]
    }]
  })
}