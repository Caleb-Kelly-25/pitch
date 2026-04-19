resource "aws_ecs_cluster" "main" {
  name = "app-cluster"
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
  family                   = "app-task"
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
      { name = "MONGO_URI",    value = "mongodb://${var.docdb_username}:${var.docdb_password}@${aws_docdb_cluster.main.endpoint}:27017/pitch?tls=true&retryWrites=false" },
      { name = "CLIENT_ORIGIN", value = var.client_origin }
    ]
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
