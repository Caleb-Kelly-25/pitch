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

variable "ECS_TASK_FAMILY" {
    type = string
}

variable "account_id" {
  type = number
  sensitive = true
}