resource "aws_s3_bucket" "cryptarioLambdaCode" {
  bucket = "cryptario-lambda-code-${terraform.workspace}"
}