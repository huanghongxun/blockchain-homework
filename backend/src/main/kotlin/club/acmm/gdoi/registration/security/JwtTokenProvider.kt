package club.acmm.gdoi.registration.security

import io.jsonwebtoken.*
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.*

@Component
class JwtTokenProvider {
    val logger = LoggerFactory.getLogger(JwtTokenProvider::class.java)

    val jwtSecret = "#S%Y^S!U(G&D@O:I)2019"

    val jwtExpirationInMs = 604800000

    fun generateToken(authentication: Authentication): String {
        val userPrincipal = authentication.principal as UserPrincipal
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationInMs)

        return Jwts.builder()
                .setSubject(userPrincipal.id.toString())
                .setIssuedAt(Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact()
    }

    fun getUserIdFromJwt(token: String): Long {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .body
                .subject
                .toLong()
    }

    fun validateToken(token: String): Boolean {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token)
            return true
        } catch (ex: SignatureException) {
            logger.error("Invalid Jwt Signature", ex)
        } catch (ex: MalformedJwtException) {
            logger.error("Invalid Jwt Token", ex)
        } catch (ex: ExpiredJwtException) {
            logger.debug("Expired Jwt Token", ex)
        } catch (ex: UnsupportedJwtException) {
            logger.error("Unsupported Jwt Token", ex)
        } catch (ex: IllegalArgumentException) {
            logger.error("Empty Jwt Token", ex)
        }
        return false
    }
}