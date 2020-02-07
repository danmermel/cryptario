data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

provider "aws" {
  region = "eu-west-1"
}

terraform {
  backend "s3" {
    bucket = "cryptario-terraform"
    key = "state"
    region = "eu-west-1"
  }
  
}

// DynamoDB dictionary table
resource "aws_dynamodb_table" "cryptario-dictionary-db" {
  name = "cryptarioDictionary-${terraform.workspace}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"
  attribute {
   name = "id"
   type = "S"
  }
  attribute {
   name = "problem"
   type = "S"
  }
  attribute {
   name = "solution"
   type = "S"
  }
  global_secondary_index {
    name = "problem-index"
    hash_key = "problem"
    projection_type = "INCLUDE"
    non_key_attributes = ["solution"]
  }
  global_secondary_index {
    name = "solution-index"
    hash_key = "solution"
    projection_type = "INCLUDE"
    non_key_attributes = ["problem"]
  }
}

// AWS Role for Lambda
resource "aws_iam_role" "cryptario_lambda_role" {
  name = "cryptario${terraform.workspace}"
  assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [{
   "Effect": "Allow",
   "Principal": {"Service": "lambda.amazonaws.com"},
   "Action": "sts:AssumeRole"
  }
 ]
}
  EOF
}

// Adding logs access to our tole
resource "aws_iam_role_policy" "logs_policy" {
  name = "logs_policy"
  role = "${aws_iam_role.cryptario_lambda_role.id}"
  policy = <<EOF
{
 "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
  EOF
}

// Adding DynamoDB access to our Lambda role
resource "aws_iam_role_policy_attachment" "cryptario_role_attach" {
  role = "${aws_iam_role.cryptario_lambda_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_anagram_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-anagram-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_hiddenwords_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-hiddenwords-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_doubledef_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-doubledef-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_homophones_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-homophones-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_reversals_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-reversals-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_containers_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-containers-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_subtractions_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-subtractions-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_charades_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-charades-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs10.x"
  timeout = 10
}


// create an API gateway
resource "aws_api_gateway_rest_api" "cryptario_api" {
  name = "cryptario-${terraform.workspace}"
}

module "anagram_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "anagram"
  api_lambda_arn = "${aws_lambda_function.cryptario_anagram_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_anagram_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

module "hiddenwords_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "hiddenwords"
  api_lambda_arn = "${aws_lambda_function.cryptario_hiddenwords_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_hiddenwords_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

module "doubledef_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "doubledef"
  api_lambda_arn = "${aws_lambda_function.cryptario_doubledef_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_doubledef_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

module "homophones_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "homophones"
  api_lambda_arn = "${aws_lambda_function.cryptario_homophones_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_homophones_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

module "reversals_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "reversals"
  api_lambda_arn = "${aws_lambda_function.cryptario_reversals_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_reversals_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

module "containers_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "containers"
  api_lambda_arn = "${aws_lambda_function.cryptario_containers_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_containers_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

module "subtractions_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "subtractions"
  api_lambda_arn = "${aws_lambda_function.cryptario_subtractions_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_subtractions_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

module "charades_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "charades"
  api_lambda_arn = "${aws_lambda_function.cryptario_charades_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_charades_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

# create api gateway deployment
resource "aws_api_gateway_deployment" "cryptario_api_deployment" {
  depends_on = ["module.anagram_method","module.hiddenwords_method","module.doubledef_method"]
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  stage_name = "${terraform.workspace}"
}


# Custom domain part
module "custom_domain" {
  source = "./modules/acm"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
}

# associate the certificate & domain name to the API gateway

resource "aws_api_gateway_domain_name" "cdn" {
  certificate_arn = module.custom_domain.certarn
  domain_name     = "${terraform.workspace}.remebit.com"
}

# api base path  mapping
resource "aws_api_gateway_base_path_mapping" "cdn_mapping" { 
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}" 
  stage_name = "${terraform.workspace}" 
  domain_name = "${aws_api_gateway_domain_name.cdn.domain_name}" 
}

# create DNS record in Route 53 - aliasing our domain name with 
# the api gateway's domain name
resource "aws_route53_record" "r53_cdn_entry" { 
  zone_id = "Z1L8M1ZWQLKTWT" 
  name = "${terraform.workspace}.remebit.com" 
  type = "A" 
  alias { 
    name = "${aws_api_gateway_domain_name.cdn.cloudfront_domain_name}" 
    zone_id = "${aws_api_gateway_domain_name.cdn.cloudfront_zone_id}" 
    evaluate_target_health = true 
  } 
}
