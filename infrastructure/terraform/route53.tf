# Create the hosted zone (instead of looking it up)
resource "aws_route53_zone" "main" {
  name = "pitch-game.com"

  tags = {
    Environment = "production"
  }
}

# Optional: Output the nameservers so you can configure Squarespace
output "route53_nameservers" {
  value = aws_route53_zone.main.name_servers
}

resource "aws_route53_record" "frontend" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "play"   # Subdomain part (full becomes pitch.game.app)
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}