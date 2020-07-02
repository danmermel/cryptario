# The certificate creation bit must be done in us-east-1 for
# some reason, so we are creating a separate module for this
# which is fixed to us-east-1.
provider "aws" {
  region = "us-east-1"
}

# create certificate for <workspace>.cryptario.net
resource "aws_acm_certificate" "cert" {
  domain_name  = "${terraform.workspace}.api.cryptario.net"
  validation_method = "DNS"
}

# create a route 53 dns record for certificate validation
resource "aws_route53_record" "cert_validation" {
  name    = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_type}"
  zone_id = "Z097007520BJXLNUB48G5"
  records = ["${aws_acm_certificate.cert.domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = "${aws_acm_certificate.cert.arn}"
  validation_record_fqdns = ["${aws_route53_record.cert_validation.fqdn}"]
}

output certarn {
  value = aws_acm_certificate.cert.arn
}
