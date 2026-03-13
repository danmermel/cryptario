terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.36"
    }
  }
  backend "s3" {
    bucket = "cryptario-terraform"
    key    = "state"
    region = "eu-west-1"
  }
}
provider "aws" {
  region = "eu-west-1"
}
