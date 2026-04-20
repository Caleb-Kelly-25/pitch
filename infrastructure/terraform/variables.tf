variable "docdb_username" {
  description = "DocumentDB master username"
  type        = string
  sensitive   = true
}

variable "docdb_password" {
  description = "DocumentDB master password"
  type        = string
  sensitive   = true
}

variable "client_origin" {
    type = string
}

variable "ecs_task_family" {
    type = string
}

variable "account_id" {
  type = number
  sensitive = true
}

variable "frontend_domain" {
  type = string
}

variable "cloudfront_header_secret" {
  type = string
  sensitive = true
}