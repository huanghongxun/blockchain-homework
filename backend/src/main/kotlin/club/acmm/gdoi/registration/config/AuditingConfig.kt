package club.acmm.gdoi.registration.config

import club.acmm.gdoi.registration.security.UserPrincipal
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import java.util.*

@Configuration
@EnableJpaAuditing
class AuditingConfig {

    @Bean
    fun auditorProvider(): AuditorAware<Long> {
        return AuditorAware<Long> {
            val auth = SecurityContextHolder.getContext().authentication

            if (auth == null || !auth.isAuthenticated || auth is AnonymousAuthenticationToken)
                return@AuditorAware Optional.empty()

            val userPrincipal = auth.principal as UserPrincipal
            return@AuditorAware Optional.ofNullable(userPrincipal.id)
        }
    }
}