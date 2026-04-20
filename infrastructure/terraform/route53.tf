data "aws_route53_zone" "main" {
  name = "pitchgame.app"   # The base domain you own
}

resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "play"   # Subdomain part (full becomes pitch.game.app)
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}