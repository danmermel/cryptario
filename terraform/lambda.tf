# cryptario
module "cryptario" {
  source        = "./modules/apicall"
  function_name = "cryptario"
  role          = aws_iam_role.cryptarioLambdaRole.arn
  nodeLayer         = aws_lambda_layer_version.cryptarioLambdaLayer.arn
}


output "cryptarioFunctionUrl" {
  value = module.cryptario.url
}