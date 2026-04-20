resource "aws_ecs_cluster" "main" {
  name = "app-cluster"
}

resource "aws_cloudwatch_log_group" "ecs_app" {
  name              = "/ecs/app"
  retention_in_days = 7
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_exec" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "app" {
  depends_on = [aws_elasticache_cluster.redis]
  family                   = var.ecs_task_family
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name      = "app"
    image = "${aws_ecr_repository.app.repository_url}:latest"
    essential = true
    
    portMappings = [{
      containerPort = 3000
    }]

    environment = [
      { name = "REDIS_URL",    value = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}" },
      { name = "CLIENT_ORIGIN", value = var.client_origin },
      { name = "PORT",          value = "3000" }
    ]

    secrets = [
      {
        name      = "MONGO_URI"
        valueFrom = aws_ssm_parameter.mongo_uri.arn
      },
      {
        name      = "JWT_SECRET"
        valueFrom = aws_ssm_parameter.jwt_secret.arn
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_app.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "app"
      }
    }
  }])

}

resource "aws_ecs_service" "app" {
  name            = "app-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }
}
