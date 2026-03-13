resource "aws_s3_bucket" "cryptarioDictionary" {
  bucket = "cryptario-dictionary-${terraform.workspace}"
}