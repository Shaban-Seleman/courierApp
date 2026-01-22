package com.courier.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${jwt.secret}")
    private String secretKey;

    private final ReactiveStringRedisTemplate redisTemplate;

    public JwtAuthenticationFilter(ReactiveStringRedisTemplate redisTemplate) {
        super(Config.class);
        this.redisTemplate = redisTemplate;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // Allow Swagger/OpenAPI endpoints without token
            String path = request.getURI().getPath();
            if (path.contains("/swagger-ui") || path.contains("/v3/api-docs") || path.contains("/webjars") || path.contains("/auth/")) {
                return chain.filter(exchange);
            }

            // Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return this.onError(exchange, "No Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return this.onError(exchange, "Invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            return redisTemplate.hasKey(token)
                    .flatMap(isBlacklisted -> {
                        if (Boolean.TRUE.equals(isBlacklisted)) {
                            return this.onError(exchange, "Token is Blacklisted", HttpStatus.UNAUTHORIZED);
                        }

                        try {
                            Claims claims = validateToken(token);

                            // Mutate the request to forward headers to downstream services
                            ServerHttpRequest modifiedRequest = request.mutate()
                                    .header("X-User-Id", claims.get("userId", String.class))
                                    .header("X-User-Role", claims.get("role", String.class))
                                    .header("X-User-Email", claims.getSubject())
                                    .header("X-User-Name", claims.get("fullName", String.class))
                                    .build();

                            return chain.filter(exchange.mutate().request(modifiedRequest).build());

                        } catch (Exception e) {
                            return this.onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
                        }
                    });
        };
    }

    private Claims validateToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Configuration properties if needed
    }
}