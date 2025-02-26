resource "aws_s3_bucket" "cryptarioLambdaCode" {
  bucket = "cryptario-lambda-code-${terraform.workspace}"
}

resource "aws_s3_bucket" "cryptarioDictionary" {
  bucket = "cryptario-dictionary-${terraform.workspace}"
}