resource "aws_ecr_repository" "app" {
  name = "app-backend"

  image_scanning_configuration {
    scan_on_push = true
  }
}
