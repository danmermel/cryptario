resource "aws_route53_zone" "cryptarioZone" {
    #we will never use the stage one but we create it
    name= terraform.workspace == "stage" ? "dummycryptario.net" :"cryptario.net"
}

resource "aws_route53_record" "apexdns" {
  zone_id = aws_route53_zone.cryptarioZone.zone_id
  name    = aws_route53_zone.cryptarioZone.name
  type    = "A"
  ttl     = 300
  records = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"]
}

resource "aws_route53_record" "apexip6" {
  zone_id = aws_route53_zone.cryptarioZone.zone_id
  name    = aws_route53_zone.cryptarioZone.name
  type    = "AAAA"
  ttl     = 300
  records = ["2606:50c0:8000::153","2606:50c0:8001::153","2606:50c0:8002::153","2606:50c0:8003::153"]
}

resource "aws_route53_record" "apexTXT" {
  zone_id = aws_route53_zone.cryptarioZone.zone_id
  name    = aws_route53_zone.cryptarioZone.name
  type    = "TXT"
  ttl     = 900
  records = ["brave-ledger-verification=1a0291bac3ca3d2db94d1da66764c7b8768d8503ceccfabf87c8162e4b8f0cfd"]
}

