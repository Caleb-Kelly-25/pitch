# Subnet group for DocumentDB (must span at least two AZs)
resource "aws_docdb_subnet_group" "main" {
  name       = "app-docdb-subnet"
  subnet_ids = module.vpc.private_subnets
}

# Security group for DocumentDB
resource "aws_security_group" "docdb" {
  name   = "app-docdb-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "app-docdb-sg" }
}

# DocumentDB cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "pitch-app-docdb"
  engine                  = "docdb"
  master_username         = var.docdb_username
  master_password         = var.docdb_password
  db_subnet_group_name    = aws_docdb_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.docdb.id]
  skip_final_snapshot     = true  # Change to false for production
  backup_retention_period = 1

  # Enable deletion protection in production
  deletion_protection = false

  lifecycle {
    create_before_destroy = true
  }
}

# DocumentDB instance (primary)
resource "aws_docdb_cluster_instance" "main" {
  count              = 1  # Increase for read replicas
  identifier         = "app-docdb-instance-${count.index}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = "db.t3.medium"
}