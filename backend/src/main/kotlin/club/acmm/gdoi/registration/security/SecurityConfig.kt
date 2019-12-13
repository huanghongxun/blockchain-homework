package club.acmm.gdoi.registration.security

import club.acmm.gdoi.registration.config.PASSWORD_STRENGTH
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.AccessDecisionManager
import org.springframework.security.access.AccessDecisionVoter
import org.springframework.security.access.hierarchicalroles.RoleHierarchy
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl
import org.springframework.security.access.vote.AuthenticatedVoter
import org.springframework.security.access.vote.RoleHierarchyVoter
import org.springframework.security.access.vote.UnanimousBased
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.BeanIds
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.access.expression.WebExpressionVoter
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class SecurityConfig @Autowired constructor(
        private val securityUserService: SecurityUserService,
        private val unauthorizedHandler: JwtAuthenticationEntryPoint
) : WebSecurityConfigurerAdapter() {

    @Bean
    fun jwtAuthenticationFilter() = JwtAuthenticationFilter()

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(PASSWORD_STRENGTH)

    @Bean(BeanIds.AUTHENTICATION_MANAGER)
    override fun authenticationManagerBean(): AuthenticationManager {
        return super.authenticationManagerBean()
    }

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.userDetailsService(securityUserService)
                .passwordEncoder(passwordEncoder())
    }

    override fun configure(http: HttpSecurity) {
        http
                .cors().and().csrf().disable()
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeRequests().run {
                    antMatchers("/",
                            "/favicon.ico",
                            "/**/*.png",
                            "/**/*.gif",
                            "/**/*.svg",
                            "/**/*.jpg",
                            "/**/*.html",
                            "/**/*.css",
                            "/**/*.js")
                            .permitAll()
                    // anyRequest().authenticated().accessDecisionManager(accessDecisionManager())
                }.and()
                .logout().logoutRequestMatcher(AntPathRequestMatcher("/api/auth/logout"))

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter::class.java)
    }

    @Bean
    fun accessDecisionManager(): AccessDecisionManager {
        val decisionVoters = arrayListOf<AccessDecisionVoter<*>>(
                WebExpressionVoter(),
                roleHierarchyVoter(),
                AuthenticatedVoter()
        )

        return UnanimousBased(decisionVoters)
    }

    @Bean
    fun roleHierarchyVoter(): RoleHierarchyVoter =
            RoleHierarchyVoter(roleHierarchy())

    @Bean
    fun roleHierarchy(): RoleHierarchy = RoleHierarchyImpl().apply {
        setHierarchy("""
            ROLE_ADMIN > ROLE_EXAMINER
            ROLE_ADMIN > ROLE_REGIONAL_CHARGER
            ROLE_REGIONAL_CHARGER > ROLE_COACH
            ROLE_COACH > ROLE_CONTESTANT
            ROLE_CONTESTANT > ROLE_ANONYMOUS
        """.trimIndent())
    }
}
