
variable "function_name" {}
variable "role" {}
variable "runtime" {
  default = "nodejs24.x"
}
variable "timeout" {
  default = 60
}

# variable "nodeLayer" {}