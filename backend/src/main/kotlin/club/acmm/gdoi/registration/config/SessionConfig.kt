package club.acmm.gdoi.registration.config

import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories
import org.springframework.session.web.context.AbstractHttpSessionApplicationInitializer

@Configuration
@EnableRedisRepositories
class SessionConfig : AbstractHttpSessionApplicationInitializer()