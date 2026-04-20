# S3 bucket for React build files
resource "aws_s3_bucket" "frontend" {
  bucket = "pitch-frontend-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }  # For SPA routing
}

# CloudFront Origin Access Control (OAC) to restrict S3 access
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "pitch-frontend-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [var.frontend_domain]

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "ALB"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Origin-Verify"
      value = var.cloudfront_header_secret
    }
  }

  default_cache_behavior {
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  # Cache behavior for API routes
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "ALB"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods  = ["HEAD", "GET", "OPTIONS"]
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization"]
      cookies { forward = "all" }
    }
  }

  # WebSocket support (Socket.IO uses /socket.io/ path)
  ordered_cache_behavior {
    path_pattern           = "/socket.io/*"
    target_origin_id       = "ALB"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods  = ["HEAD", "GET", "OPTIONS"]
    # WebSocket connections should not be cached
    forwarded_values {
      query_string = true
      
      cookies { forward = "all" }
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.frontend.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  depends_on = [aws_s3_bucket.frontend, aws_acm_certificate_validation.frontend]
}

# S3 bucket policy allowing CloudFront only
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.cloudfront_s3_access.json
}

data "aws_iam_policy_document" "cloudfront_s3_access" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

# ACM certificate for custom domain (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "frontend" {
  domain_name       = var.frontend_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}